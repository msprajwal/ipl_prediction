package middleware

import (
	"log"
	"net/http"
	"strings"

	"ipl-prediction-backend/utils"

	"github.com/gin-gonic/gin"
)

// AuthRequired is a middleware to protect routes
func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header format must be Bearer {token}"})
			return
		}

		tokenString := parts[1]

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
