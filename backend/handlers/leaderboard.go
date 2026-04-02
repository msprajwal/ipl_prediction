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
	// Identify requesting user (AuthRequired middleware must set userID)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	var currentUser models.User
	if err := db.DB.First(&currentUser, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user"})
		return
	}

	targetGroup := currentUser.Group
	if currentUser.Role == "admin" {
		queryGroup := c.Query("group")
		if queryGroup != "" {
			targetGroup = queryGroup
		}
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
