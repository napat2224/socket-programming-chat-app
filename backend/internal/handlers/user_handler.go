package handlers

import (
	"context"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/services"
)

type UserHandler struct {
	userService *services.UserService
}

type VerifyTokenResponse struct {
	UserID  string `json:"userId"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Profile int `json:"profile"`
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

type RegisterRequest struct {
	IdToken string `json:"idToken" validate:"required"`
	Name    string `json:"name" validate:"required"`
	Profile int `json:"profile" validate:"required"`
}

type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest

	if err := c.BodyParser(&req); err != nil {
		log.Printf("Failed to parse request body: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(RegisterResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	// Validate required fields
	if req.IdToken == "" || req.Name == "" || !domain.ProfileType(req.Profile).IsValid() {
		return c.Status(fiber.StatusBadRequest).JSON(RegisterResponse{
			Success: false,
			Message: "Missing required fields: idToken, fullName, and role are required",
		})
	}

	ctx := context.Background()
	err := h.userService.Register(ctx, req.IdToken, req.Name, req.Profile)
	if err != nil {
		log.Printf("Registration failed: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(RegisterResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(RegisterResponse{
		Success: true,
		Message: "User registered successfully",
	})
}

func (h *UserHandler) GetMe(c *fiber.Ctx) error {
	raw := c.Locals("claims")
	if raw == nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Missing claims")
	}

	claims, ok := raw.(*services.Claims)
	if !ok {
		return fiber.NewError(fiber.StatusInternalServerError, "Invalid claims type")
	}

	return c.Status(fiber.StatusOK).JSON(VerifyTokenResponse{
		UserID:  claims.UserID,
		Email:   claims.Email,
		Name:    claims.Name,
		Profile: claims.Profile,
	})
}
