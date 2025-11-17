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
	Profile int    `json:"profile"`
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

type RegisterRequest struct {
	IdToken string `json:"idToken" validate:"required"`
	Name    string `json:"name" validate:"required"`
	Profile int    `json:"profile" validate:"required"`
}

type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
}

type CheckUsernameRequest struct {
    Name string `json:"name" validate:"required"`
}

type CheckUsernameResponse struct {
    Available bool   `json:"available"`
    Message   string `json:"message,omitempty"`
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	var req RegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(RegisterResponse{
			Success: false,
			Message: "Invalid request body",
		})
	}

	if req.IdToken == "" || req.Name == "" || !domain.ProfileType(req.Profile).IsValid() {
		return c.Status(fiber.StatusBadRequest).JSON(RegisterResponse{
			Success: false,
			Message: "Missing required fields: idToken, fullName, and role are required",
		})
	}

	ctx := context.Background()
	err := h.userService.Register(ctx, req.IdToken, req.Name, req.Profile)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(RegisterResponse{
			Success: false,
			Message: err.Error(),
		})
	}

	// Prepare response with the claims you just set
	customClaims := map[string]interface{}{
		"name":    req.Name,
		"profile": req.Profile,
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success":              true,
		"message":              "User registered successfully",
		"claims":               customClaims,
		"requiresTokenRefresh": true,
	})
}

func (h *UserHandler) GetMe(c *fiber.Ctx) error {
	log.Println("GetMe called")
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

func (h *UserHandler) CheckUsername(c *fiber.Ctx) error {
    var req CheckUsernameRequest

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(CheckUsernameResponse{
            Available: false,
            Message:   "Invalid request body",
        })
    }

    ctx := context.Background()
    available, err := h.userService.IsUsernameAvailable(ctx, req.Name)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(CheckUsernameResponse{
            Available: false,
            Message:   "Failed to check username",
        })
    }

    if !available {
        return c.Status(fiber.StatusConflict).JSON(CheckUsernameResponse{
            Available: false,
            Message:   "username is already taken",
        })
    }

    return c.Status(fiber.StatusOK).JSON(CheckUsernameResponse{
        Available: true,
    })
}
