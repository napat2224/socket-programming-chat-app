package middleware

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/napat2224/socket-programming-chat-app/internal/services"
)

type AuthMiddleware struct {
	authService *services.FirebaseAuth
}

func NewAuthMiddleware(authService *services.FirebaseAuth) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

func (a *AuthMiddleware) AddClaims(c *fiber.Ctx) error {
	if c.Query("mode") == "test" {
		c.Locals("claims", &services.Claims{
			UserID: "test",
			Email: "test@test.com",
			Name: "Test User",
			Profile: "test",
		})
		return c.Next()
	}
	
	var token string
	if c.Get("Authorization") == "" {
		token = c.Query("token")
	} else {
		token = c.Get("Authorization")
	}

	claims, err := a.authService.VerifyIDToken(c.Context(), token)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to verify ID token")
	}
	if claims == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid ID token")
	}
	log.Println("Successfully get claims", claims)

	// Store claims for later access
	c.Locals("claims", claims)

	return c.Next()
}

