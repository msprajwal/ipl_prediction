package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"time"

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

	// Seed admin user if not exists (credentials from env vars)
	adminUsername := os.Getenv("ADMIN_USERNAME")
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminUsername != "" && adminPassword != "" {
		var adminUser models.User
		if database.Where("username = ?", adminUsername).First(&adminUser).RowsAffected == 0 {
			hashedPassword, err := utils.HashPassword(adminPassword)
			if err != nil {
				log.Fatal("Failed to hash admin password:", err)
			}
			adminUser = models.User{
				Username:     adminUsername,
				Email:        adminUsername + "@admin.com",
				PasswordHash: hashedPassword,
				Role:         "admin",
			}
			database.Create(&adminUser)
			log.Printf("Admin user '%s' created successfully.", adminUsername)
		} else {
			log.Printf("Admin user '%s' already exists.", adminUsername)
		}
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

	// Background Goroutine to keep the server awake on Render Free Tier
	// It pings its own public URL every 14 minutes (Render sleeps after 15 min of inactivity)
	selfURL := os.Getenv("SELF_URL")
	if selfURL != "" {
		go func() {
			log.Printf("Starting keep-alive goroutine, pinging %s every 14 minutes", selfURL)
			ticker := time.NewTicker(14 * time.Minute)
			for range ticker.C {
				resp, err := http.Get(selfURL)
				if err != nil {
					log.Println("Keep-alive ping failed:", err)
				} else {
					log.Printf("Keep-alive ping successful: %s - Status: %d", selfURL, resp.StatusCode)
					resp.Body.Close()
				}
			}
		}()
	}

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
