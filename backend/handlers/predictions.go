package handlers

import (
	"net/http"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

type PredictionInput struct {
	MatchID              uint   `json:"match_id" binding:"required"`
	PredictedWinner      string `json:"predicted_winner" binding:"required"`
	PredictedRunScorer   string `json:"predicted_run_scorer" binding:"required"`
	PredictedWicketTaker string `json:"predicted_wicket_taker" binding:"required"`
	PredictedPOTM        string `json:"predicted_potm" binding:"required"`
}

func SubmitPrediction(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in context"})
		return
	}

	var input PredictionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify match exists and is upcoming
	var match models.Match
	if err := db.DB.First(&match, input.MatchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if match.Status != "upcoming" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot submit predictions for a match that has started or is completed"})
		return
	}

	// Create or update prediction
	var prediction models.Prediction
	result := db.DB.Where(&models.Prediction{UserID: userID.(uint), MatchID: input.MatchID}).First(&prediction)

	prediction.PredictedWinner = input.PredictedWinner
	prediction.PredictedRunScorer = input.PredictedRunScorer
	prediction.PredictedWicketTaker = input.PredictedWicketTaker
	prediction.PredictedPOTM = input.PredictedPOTM

	if result.RowsAffected > 0 {
		// Update existing
		db.DB.Save(&prediction)
	} else {
		// Create new
		prediction.UserID = userID.(uint)
		prediction.MatchID = input.MatchID
		db.DB.Create(&prediction)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Prediction submitted successfully", "prediction": prediction})
}

func GetMyPredictions(c *gin.Context) {
	userID, _ := c.Get("userID")

	var predictions []models.Prediction
	if err := db.DB.Preload("Match").Where("user_id = ?", userID).Find(&predictions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch predictions"})
		return
	}

	c.JSON(http.StatusOK, predictions)
}

func GetPublicPredictions(c *gin.Context) {
	matchID := c.Param("matchId")

	// Only allow fetching if match is completed
	var match models.Match
	if err := db.DB.First(&match, matchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if match.Status != "completed" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Predictions are hidden until the match is completed to prevent cheating"})
		return
	}

	var predictions []models.Prediction
	if err := db.DB.Preload("User").Where("match_id = ?", matchID).Find(&predictions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch public predictions"})
		return
	}

	// Sanitize output to only send necessary fields (no passwords!)
	type PublicPredictionResponse struct {
		Username             string `json:"username"`
		PredictedWinner      string `json:"predicted_winner"`
		PredictedRunScorer   string `json:"predicted_run_scorer"`
		PredictedWicketTaker string `json:"predicted_wicket_taker"`
		PredictedPOTM        string `json:"predicted_potm"`
		PointsEarned         int    `json:"points_earned"`
	}

	var response []PublicPredictionResponse
	for _, p := range predictions {
		response = append(response, PublicPredictionResponse{
			Username:             p.User.Username,
			PredictedWinner:      p.PredictedWinner,
			PredictedRunScorer:   p.PredictedRunScorer,
			PredictedWicketTaker: p.PredictedWicketTaker,
			PredictedPOTM:        p.PredictedPOTM,
			PointsEarned:         p.PointsEarned,
		})
	}

	c.JSON(http.StatusOK, response)
}
