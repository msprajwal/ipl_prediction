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
	var users []models.User
	if err := db.DB.Order("total_points desc").Limit(100).Find(&users).Error; err != nil {
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
