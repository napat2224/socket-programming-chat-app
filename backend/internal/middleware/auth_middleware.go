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
	claims, err := a.authService.VerifyIDToken(c.Context(), c.Get("Authorization"))
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

