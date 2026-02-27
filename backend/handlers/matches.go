package handlers

import (
	"net/http"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"

	"github.com/gin-gonic/gin"
)

func GetMatches(c *gin.Context) {
	var matches []models.Match
	if err := db.DB.Order("match_date asc").Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch matches"})
		return
	}

	c.JSON(http.StatusOK, matches)
}

func GetMatchByID(c *gin.Context) {
	id := c.Param("id")
	var match models.Match
	if err := db.DB.First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	c.JSON(http.StatusOK, match)
}
