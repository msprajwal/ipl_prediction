package handlers

import (
	"net/http"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

type LeaderboardUser struct {
	Username    string `json:"username"`
	TotalPoints int    `json:"total_points"`
}

func GetLeaderboard(c *gin.Context) {
	// Public endpoint: if unauthenticated, allow choosing group via query param.
	// If authenticated, default to the user's group; admins may override via query param.
	targetGroup := "family"
	if queryGroup := c.Query("group"); queryGroup != "" {
		targetGroup = queryGroup
	}

	userID, exists := c.Get("userID")
	if exists {
		var currentUser models.User
		if err := db.DB.First(&currentUser, userID).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
			return
		}
		targetGroup = currentUser.Group
		if currentUser.Role == "admin" {
			if queryGroup := c.Query("group"); queryGroup != "" {
				targetGroup = queryGroup
			}
		}
	}

	if targetGroup != "family" && targetGroup != "friends" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group. Must be 'family' or 'friends'"})
		return
	}

	var users []models.User
	if err := db.DB.Where("`group` = ?", targetGroup).Order("total_points desc").Limit(100).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch leaderboard"})
		return
	}

	var leaderboard []LeaderboardUser
	for _, u := range users {
		leaderboard = append(leaderboard, LeaderboardUser{
			Username:    u.Username,
			TotalPoints: u.TotalPoints,
		})
	}

	c.JSON(http.StatusOK, leaderboard)
}
