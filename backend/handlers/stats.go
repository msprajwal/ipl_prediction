package handlers

import (
	"net/http"
	"sort"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

// GetPointsHistory returns per-match points for all users across completed matches
func GetPointsHistory(c *gin.Context) {
	// Get all completed matches ordered by date
	var matches []models.Match
	if err := db.DB.Where("status = ?", "completed").Order("match_date ASC").Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
		return
	}

	if len(matches) == 0 {
		c.JSON(http.StatusOK, gin.H{"matches": []string{}, "users": []interface{}{}})
		return
	}

	// Get all users
	var users []models.User
	db.DB.Order("total_points DESC").Find(&users)

	// Get all predictions for completed matches
	var predictions []models.Prediction
	matchIDs := make([]uint, len(matches))
	for i, m := range matches {
		matchIDs[i] = m.ID
	}
	db.DB.Where("match_id IN ?", matchIDs).Find(&predictions)

	// Build a map: userID -> matchID -> points
	pointsMap := make(map[uint]map[uint]int)
	for _, p := range predictions {
		if pointsMap[p.UserID] == nil {
			pointsMap[p.UserID] = make(map[uint]int)
		}
		pointsMap[p.UserID][p.MatchID] = p.PointsEarned
	}

	// Build match labels
	matchLabels := make([]string, len(matches))
	for i, m := range matches {
		matchLabels[i] = m.Team1 + " vs " + m.Team2
	}

	// Build user data
	type UserPoints struct {
		Username string `json:"username"`
		Points   []int  `json:"points"`
	}

	var userData []UserPoints
	for _, u := range users {
		pts := make([]int, len(matches))
		for i, m := range matches {
			if userPts, ok := pointsMap[u.ID]; ok {
				pts[i] = userPts[m.ID]
			}
		}
		userData = append(userData, UserPoints{
			Username: u.Username,
			Points:   pts,
		})
	}

	// Sort users by total points descending
	sort.Slice(userData, func(i, j int) bool {
		totalI, totalJ := 0, 0
		for _, p := range userData[i].Points {
			totalI += p
		}
		for _, p := range userData[j].Points {
			totalJ += p
		}
		return totalI > totalJ
	})

	c.JSON(http.StatusOK, gin.H{
		"matches": matchLabels,
		"users":   userData,
	})
}
