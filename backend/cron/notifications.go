package cron

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	webpush "github.com/SherClockHolmes/webpush-go"
	"github.com/robfig/cron/v3"
)

// StartNotificationCron starts a background cron job that checks every 5 minutes
// for matches starting in ~25 minutes and sends push notifications to users
// who haven't submitted predictions yet.
func StartNotificationCron() {
	c := cron.New()

	// Run every 5 minutes
	_, err := c.AddFunc("*/5 * * * *", checkAndSendNotifications)
	if err != nil {
		log.Println("[CRON] Failed to schedule notification job:", err)
		return
	}

	c.Start()
	log.Println("[CRON] Notification cron started — checking every 5 minutes for upcoming matches")
}

func checkAndSendNotifications() {
	now := time.Now().UTC()
	windowStart := now.Add(20 * time.Minute) // 20 min from now
	windowEnd := now.Add(30 * time.Minute)   // 30 min from now
	// This 20-30 min window ensures the notification fires ~25 min before match start.
	// With a 5-minute cron interval, every match will fall into this window exactly once.

	var matches []models.Match
	result := db.DB.Where("status = ? AND match_date BETWEEN ? AND ?", "upcoming", windowStart, windowEnd).Find(&matches)
	if result.Error != nil {
		log.Println("[CRON] Error querying upcoming matches:", result.Error)
		return
	}

	if len(matches) == 0 {
		return // No matches starting soon
	}

	vapidPrivateKey := os.Getenv("VAPID_PRIVATE_KEY")
	vapidPublicKey := os.Getenv("VAPID_PUBLIC_KEY")
	vapidContact := os.Getenv("VAPID_CONTACT")
	if vapidContact == "" {
		vapidContact = "mailto:admin@iplpredictor.com"
	}

	if vapidPrivateKey == "" || vapidPublicKey == "" {
		log.Println("[CRON] VAPID keys not configured, skipping push notifications")
		return
	}

	for _, match := range matches {
		sendNotificationsForMatch(match, vapidPublicKey, vapidPrivateKey, vapidContact)
	}
}

func sendNotificationsForMatch(match models.Match, vapidPublicKey, vapidPrivateKey, vapidContact string) {
	// Find users who have a push subscription BUT have NOT predicted for this match
	var subscriptions []models.PushSubscription
	err := db.DB.Raw(`
		SELECT ps.* FROM push_subscriptions ps
		WHERE ps.user_id NOT IN (
			SELECT p.user_id FROM predictions p WHERE p.match_id = ?
		)
	`, match.ID).Scan(&subscriptions).Error

	if err != nil {
		log.Printf("[CRON] Error fetching subscriptions for match %d: %v", match.ID, err)
		return
	}

	if len(subscriptions) == 0 {
		log.Printf("[CRON] Match %d (%s vs %s): All subscribed users have already predicted!", match.ID, match.Team1, match.Team2)
		return
	}

	log.Printf("[CRON] Match %d (%s vs %s): Sending %d push notifications", match.ID, match.Team1, match.Team2, len(subscriptions))

	// Build the notification payload
	payload := map[string]string{
		"title": "🏏 Match Starting Soon!",
		"body":  match.Team1 + " vs " + match.Team2 + " starts in ~25 minutes! Submit your prediction now!",
		"url":   "/match/" + uintToString(match.ID),
	}
	payloadBytes, _ := json.Marshal(payload)

	sentCount := 0
	failCount := 0

	for _, sub := range subscriptions {
		s := &webpush.Subscription{
			Endpoint: sub.Endpoint,
			Keys: webpush.Keys{
				P256dh: sub.P256dh,
				Auth:   sub.Auth,
			},
		}

		resp, err := webpush.SendNotification(payloadBytes, s, &webpush.Options{
			Subscriber:      vapidContact,
			VAPIDPublicKey:  vapidPublicKey,
			VAPIDPrivateKey: vapidPrivateKey,
			TTL:             60, // seconds the push service should retain the message
		})

		if err != nil {
			log.Printf("[CRON] Failed to send push to user %d: %v", sub.UserID, err)
			failCount++
			continue
		}
		resp.Body.Close()

		// If the push service returns 410 Gone, the subscription is expired — remove it
		if resp.StatusCode == 410 || resp.StatusCode == 404 {
			log.Printf("[CRON] Subscription expired for user %d, removing", sub.UserID)
			db.DB.Delete(&sub)
			failCount++
			continue
		}

		sentCount++
	}

	log.Printf("[CRON] Match %d: Sent %d, Failed %d notifications", match.ID, sentCount, failCount)
}

func uintToString(n uint) string {
	return fmt.Sprintf("%d", n)
}
