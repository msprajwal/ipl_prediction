package handlers

import (
	"net/http"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

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
			// Create a penalty prediction record
			penalty := models.Prediction{
				UserID:               u.ID,
				MatchID:              match.ID,
				PredictedWinner:      "NO PREDICTION",
				PredictedRunScorer:   "NO PREDICTION",
				PredictedWicketTaker: "NO PREDICTION",
				PredictedPOTM:        "NO PREDICTION",
				PointsEarned:         -1,
			}
			db.DB.Create(&penalty)

			// Deduct 1 point from user
			u.TotalPoints -= 1
			db.DB.Save(&u)
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
