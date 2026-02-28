package middleware

import (
	"log"
	"net/http"

	"ipl-prediction-backend/utils"

	"github.com/gin-gonic/gin"
)

// AuthRequired is a middleware to protect routes
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("token")
		if err != nil || tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authentication cookie is missing or invalid"})
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Store user info in context
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		c.Set("userID", uint(userIDFloat))
		c.Set("username", claims["username"])
		if role, ok := claims["role"].(string); ok {
			c.Set("userRole", role)
		} else {
			c.Set("userRole", "user")
		}
		c.Next()

		// Log activity after the request is processed
		log.Printf("[ACTIVITY] User '%s' accessed %s %s", claims["username"], c.Request.Method, c.Request.URL.Path)
	}
}
