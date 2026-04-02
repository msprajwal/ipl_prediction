package handlers

import (
	"log"
	"net/http"
	"time"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

// ResetDatabase clears matches and predictions, and resets all user points to 0
func ResetDatabase(c *gin.Context) {
	// Delete all predictions
	if err := db.DB.Exec("DELETE FROM predictions").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete predictions"})
		return
	}

	// Delete all matches
	if err := db.DB.Exec("DELETE FROM matches").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete matches"})
		return
	}

	// Reset all user points to 0 (keep all accounts)
	db.DB.Exec("UPDATE users SET total_points = 0")

	// Reset auto-increment sequences
	db.DB.Exec("DELETE FROM sqlite_sequence WHERE name IN ('matches', 'predictions')")

	log.Println("[ADMIN] Database has been reset by admin.")
	c.JSON(http.StatusOK, gin.H{"message": "Database reset successfully. All matches and predictions cleared, points reset to 0. User accounts kept."})
}

// Admin-only struct to update match results
type UpdateMatchResultInput struct {
	Status            string `json:"status" binding:"required"` // should transition to 'completed'
	ActualWinner      string `json:"actual_winner" binding:"required"`
	ActualRunScorer   string `json:"actual_run_scorer" binding:"required"`
	ActualWicketTaker string `json:"actual_wicket_taker" binding:"required"`
	ActualPOTM        string `json:"actual_potm" binding:"required"`
}

// AdminRequired checks that the authenticated user has the "admin" role.
// Must be used AFTER middleware.AuthRequired() so that userRole is set in context.
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			return
		}
		c.Next()
	}
}

// CalculatePoints logic runs when a match is marked completed
func UpdateMatchResult(c *gin.Context) {
	matchID := c.Param("id")
	var input UpdateMatchResultInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var match models.Match
	if err := db.DB.First(&match, matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if match.Status == "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Match is already completed. Cannot recalculate."})
		return
	}

	// Update match details
	match.Status = input.Status
	match.ActualWinner = input.ActualWinner
	match.ActualRunScorer = input.ActualRunScorer
	match.ActualWicketTaker = input.ActualWicketTaker
	match.ActualPOTM = input.ActualPOTM
	db.DB.Save(&match)

	// Fetch all predictions for this match
	var predictions []models.Prediction
	db.DB.Where("match_id = ?", match.ID).Find(&predictions)

	// Calculate and award points
	for _, p := range predictions {
		points := 0
		if p.PredictedWinner == match.ActualWinner {
			points += 2
		}
		if p.PredictedRunScorer == match.ActualRunScorer {
			points += 5
		}
		if p.PredictedWicketTaker == match.ActualWicketTaker {
			points += 3
		}
		if p.PredictedPOTM == match.ActualPOTM {
			points += 10
		}

		p.PointsEarned = points
		db.DB.Save(&p)

		// Add points to user
		var user models.User
		db.DB.First(&user, p.UserID)
		user.TotalPoints += points
		db.DB.Save(&user)
	}

	// Penalize users who did not predict
	var allUsers []models.User
	db.DB.Find(&allUsers)

	// Build a set of user IDs who predicted
	predictedUserIDs := make(map[uint]bool)
	for _, p := range predictions {
		predictedUserIDs[p.UserID] = true
	}

	for _, u := range allUsers {
		if !predictedUserIDs[u.ID] {
			pointsEarned := -1
			if u.Group == "friends" {
				pointsEarned = 0
			}

			// Create a "no prediction" record
			penalty := models.Prediction{
				UserID:               u.ID,
				MatchID:              match.ID,
				PredictedWinner:      "NO PREDICTION",
				PredictedRunScorer:   "NO PREDICTION",
				PredictedWicketTaker: "NO PREDICTION",
				PredictedPOTM:        "NO PREDICTION",
				PointsEarned:         pointsEarned,
			}
			db.DB.Create(&penalty)

			// Only deduct points if pointsEarned is negative (for non-friends)
			if pointsEarned < 0 {
				u.TotalPoints += pointsEarned
				db.DB.Save(&u)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Match updated and points calculated successfully", "match": match})
}

// Add Match route for seeding
type CreateMatchInput struct {
	Team1     string `json:"team1" binding:"required"`
	Team2     string `json:"team2" binding:"required"`
	MatchDate string `json:"match_date" binding:"required"` // ISO string
}

func CreateMatch(c *gin.Context) {
	var input models.Match
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.DB.Create(&input)
	c.JSON(http.StatusCreated, gin.H{"message": "Match created", "match": input})
}

// UpdateMatchTime allows admin to change only the match start time
type UpdateMatchTimeInput struct {
	MatchDate string `json:"match_date" binding:"required"`
}

func UpdateMatchTime(c *gin.Context) {
	matchID := c.Param("id")

	var input UpdateMatchTimeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var match models.Match
	if err := db.DB.First(&match, matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if match.Status == "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot change time of a completed match"})
		return
	}

	newTime, err := time.Parse(time.RFC3339, input.MatchDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format, use ISO 8601 (e.g. 2026-03-01T13:30:00Z)"})
		return
	}

	match.MatchDate = newTime
	db.DB.Save(&match)

	log.Printf("[ADMIN] Match #%s (%s vs %s) time updated to %s", matchID, match.Team1, match.Team2, newTime.String())
	c.JSON(http.StatusOK, gin.H{"message": "Match time updated successfully", "match": match})
}

// GetAllUsers returns a list of all registered users (admin only)
func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := db.DB.Order("id asc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	
	// Create response dropping password hashes
	type UserResponse struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Role     string `json:"role"`
		Group    string `json:"group"`
	}
	
	var userList []UserResponse
	for _, u := range users {
		userList = append(userList, UserResponse{
			ID:       u.ID,
			Username: u.Username,
			Email:    u.Email,
			Role:     u.Role,
			Group:    u.Group,
		})
	}
	c.JSON(http.StatusOK, userList)
}

type UpdateUserGroupInput struct {
	Group string `json:"group" binding:"required"`
}

// UpdateUserGroup modifies a user's assigned group (admin only)
func UpdateUserGroup(c *gin.Context) {
	userID := c.Param("id")
	
	var input UpdateUserGroupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Group != "family" && input.Group != "friends" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group. Must be 'family' or 'friends'"})
		return
	}

	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Group = input.Group
	db.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"message": "User group updated", "user": user})
}
