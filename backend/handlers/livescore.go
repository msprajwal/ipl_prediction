package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// CricAPI key — free tier (100 calls/day)
const cricAPIKey = "cf964548-f582-4952-b835-f45ce6583730"
const cricAPIURL = "https://api.cricapi.com/v1/currentMatches?apikey=" + cricAPIKey + "&offset=0"

// Simple cache to avoid burning API calls — cache for 30 seconds
var (
	cachedResponse []byte
	cacheTime      time.Time
	cacheMu        sync.Mutex
	cacheDuration  = 30 * time.Second
)

// GetLiveScores proxies and caches CricAPI currentMatches
func GetLiveScores(c *gin.Context) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	// Return cached response if fresh
	if cachedResponse != nil && time.Since(cacheTime) < cacheDuration {
		c.Header("Content-Type", "application/json")
		c.Header("X-Cache", "HIT")
		c.Writer.Write(cachedResponse)
		return
	}

	// Fetch from CricAPI
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(cricAPIURL)
	if err != nil {
		log.Printf("[LIVE SCORE] API request failed: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch live scores"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	// Validate JSON
	var raw map[string]interface{}
	if json.Unmarshal(body, &raw) != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Invalid API response"})
		return
	}

	// Cache it
	cachedResponse = body
	cacheTime = time.Now()

	c.Header("Content-Type", "application/json")
	c.Header("X-Cache", "MISS")
	c.Writer.Write(body)
}
