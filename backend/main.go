package main

import (
	"io"
	"log"
	"os"

	"ipl-prediction-backend/db"
	"ipl-prediction-backend/models"
	"ipl-prediction-backend/routes"
	"ipl-prediction-backend/utils"

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

	// Seed admin user if not exists
	var adminUser models.User
	if database.Where("username = ?", "msprajwal").First(&adminUser).RowsAffected == 0 {
		hashedPassword, err := utils.HashPassword("ipl2026")
		if err != nil {
			log.Fatal("Failed to hash admin password:", err)
		}
		adminUser = models.User{
			Username:     "msprajwal",
			Email:        "msprajwal@admin.com",
			PasswordHash: hashedPassword,
			Role:         "admin",
		}
		database.Create(&adminUser)
		log.Println("Admin user 'msprajwal' created successfully.")
	} else {
		log.Println("Admin user 'msprajwal' already exists.")
	}

	// Setup logging to file and console
	f, err := os.OpenFile("server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Println("Failed to open server.log file, writing logs to console only")
	} else {
		gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
		log.SetOutput(io.MultiWriter(f, os.Stdout))
	}

	// Setup Gin router
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOriginFunc: func(origin string) bool {
			return true // Allow all origins dynamically (required when credentials are enabled)
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Basic healthcheck route
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// Setup API Routes
	routes.SetupRouter(r)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
