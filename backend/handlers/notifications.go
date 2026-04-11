package handlers

import (
	"net/http"
	"os"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

// GetVapidPublicKey returns the VAPID public key so the frontend can subscribe
func GetVapidPublicKey(c *gin.Context) {
	vapidPublicKey := os.Getenv("VAPID_PUBLIC_KEY")
	if vapidPublicKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "VAPID public key not configured"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"public_key": vapidPublicKey})
}

// SubscribeToNotifications saves a push subscription for the authenticated user
func SubscribeToNotifications(c *gin.Context) {
	userID := c.GetUint("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Endpoint string `json:"endpoint" binding:"required"`
		P256dh   string `json:"p256dh" binding:"required"`
		Auth     string `json:"auth" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid subscription data"})
		return
	}

	// Upsert: if this endpoint already exists, update it (browser may regenerate keys)
	var existing models.PushSubscription
	result := db.DB.Where("endpoint = ?", input.Endpoint).First(&existing)
	if result.RowsAffected > 0 {
		existing.UserID = userID
		existing.P256dh = input.P256dh
		existing.Auth = input.Auth
		db.DB.Save(&existing)
	} else {
		sub := models.PushSubscription{
			UserID:   userID,
			Endpoint: input.Endpoint,
			P256dh:   input.P256dh,
			Auth:     input.Auth,
		}
		db.DB.Create(&sub)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Subscription saved"})
}

// UnsubscribeFromNotifications removes a push subscription for the authenticated user
func UnsubscribeFromNotifications(c *gin.Context) {
	userID := c.GetUint("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input struct {
		Endpoint string `json:"endpoint" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	db.DB.Where("user_id = ? AND endpoint = ?", userID, input.Endpoint).Delete(&models.PushSubscription{})
	c.JSON(http.StatusOK, gin.H{"message": "Unsubscribed"})
}

// GetNotificationStatus checks if the current user has an active push subscription
func GetNotificationStatus(c *gin.Context) {
	userID := c.GetUint("userID")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var count int64
	db.DB.Model(&models.PushSubscription{}).Where("user_id = ?", userID).Count(&count)
	c.JSON(http.StatusOK, gin.H{"subscribed": count > 0})
}
