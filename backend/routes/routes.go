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
		adminRoutes.POST("/reset-db", handlers.ResetDatabase)
		adminRoutes.PATCH("/matches/:id/time", handlers.UpdateMatchTime)
	}
	// Catch-all: return 404 for non-API paths (frontend is served by Vercel)
	r.NoRoute(func(c *gin.Context) {
		c.JSON(404, gin.H{"error": "Route not found"})
	})
}
