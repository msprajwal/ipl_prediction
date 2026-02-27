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

	// Match routes (Public)
	api.GET("/matches", handlers.GetMatches)
	api.GET("/matches/:id", handlers.GetMatchByID)
	api.GET("/leaderboard", handlers.GetLeaderboard)

	// Protected routes (User)
	userRoutes := api.Group("/")
	userRoutes.Use(middleware.AuthRequired())
	{
		userRoutes.POST("/predictions", handlers.SubmitPrediction)
		userRoutes.GET("/predictions/me", handlers.GetMyPredictions)
		// Only view public predictions once match is completed
		userRoutes.GET("/matches/:matchId/predictions", handlers.GetPublicPredictions)
	}

	// Admin routes
	adminRoutes := api.Group("/admin")
	adminRoutes.Use(handlers.AdminRequired())
	{
		adminRoutes.POST("/matches", handlers.CreateMatch)
		adminRoutes.PUT("/matches/:id/result", handlers.UpdateMatchResult)
	}
}
