package routes

import (
	"ipl-prediction-backend/handlers"
	"ipl-prediction-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(r *gin.Engine) {
	api := r.Group("/api")

	// Auth routes (Public)
	api.POST("/register", handlers.Register)
	api.POST("/login", handlers.Login)
	api.POST("/logout", handlers.Logout)

	// Match routes (Public)
	api.GET("/matches", handlers.GetMatches)
	api.GET("/matches/:id", handlers.GetMatchByID)
	api.GET("/leaderboard", handlers.GetLeaderboard)

	// Protected routes (User)
	userRoutes := api.Group("/user")
	userRoutes.Use(middleware.AuthRequired())
	{
		userRoutes.POST("/predictions", handlers.SubmitPrediction)
		userRoutes.GET("/predictions/me", handlers.GetMyPredictions)
		userRoutes.GET("/me", handlers.GetMe)
		// Only view public predictions once match is completed
		userRoutes.GET("/matches/:matchId/predictions", handlers.GetPublicPredictions)
	}

	// Admin routes (requires JWT auth + admin role)
	adminRoutes := api.Group("/admin")
	adminRoutes.Use(middleware.AuthRequired())
	adminRoutes.Use(handlers.AdminRequired())
	{
		adminRoutes.POST("/matches", handlers.CreateMatch)
		adminRoutes.PUT("/matches/:id/result", handlers.UpdateMatchResult)
	}

	// Serve the frontend build
	r.Static("/assets", "../frontend/dist/assets")
	r.StaticFile("/vite.svg", "../frontend/dist/vite.svg")
	// If favicon exists, serve it, otherwise ignore
	r.StaticFile("/favicon.ico", "../frontend/dist/favicon.ico")

	// Catch-all route to serve React's index.html for all non-API paths
	r.NoRoute(func(c *gin.Context) {
		// Only serve index.html for non-API routes
		if len(c.Request.URL.Path) >= 4 && c.Request.URL.Path[:4] == "/api" {
			c.JSON(404, gin.H{"error": "API route not found"})
			return
		}
		c.File("../frontend/dist/index.html")
	})
}
