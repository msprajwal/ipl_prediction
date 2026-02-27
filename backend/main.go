package main

import (
	"log"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"
	"ipl-prediction-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables if .env exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables.")
	}

	// Initialize database connection
	database := db.InitDB()

	// Auto-migrate database models
	err = database.AutoMigrate(&models.User{}, &models.Match{}, &models.Prediction{})
	if err != nil {
		log.Fatal("Failed to auto-migrate database schema:", err)
	}

	// Setup Gin router
	r := gin.Default()

	// Configure CORS (allow all origins for local dev)
	r.Use(cors.Default())

	// Basic healthcheck route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Setup API Routes
	routes.SetupRouter(r)

	// Start the server
	port := "8080"
	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
