package services

import (
	"context"
	"fmt"
	"log"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/repository"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type UserService struct {
	authService *FirebaseAuth
	repo        *repository.UserRepository
}

func NewUserService(authService *FirebaseAuth, repo *repository.UserRepository) *UserService {
	return &UserService{authService: authService, repo: repo}
}

func (s *UserService) Register(ctx context.Context, idToken, fullName, role string) error {
	claims, err := s.authService.VerifyIDToken(ctx, idToken)
	if err != nil {
		return fmt.Errorf("invalid firebase token: %w", err)
	}

	uid := claims.UserID
	customClaims := map[string]interface{}{
		"role": role,
	}

	log.Printf("Setting custom claims for user %s: %v", uid, customClaims)
	if err := s.authService.SetCustomUserClaims(ctx, uid, customClaims); err != nil {
		return status.Errorf(codes.Internal, "failed to set custom claims: %v", err)
	}

	user := domain.User{
		UserID:  claims.UserID,
		Name: claims.Name,
		Email:   claims.Email,
		Profile: claims.Profile,
	}

	return s.repo.SaveUser(ctx, user)
}

func (s *UserService) GetMe(ctx context.Context, userID string) (*domain.User, error) {
	user, err := s.repo.FindById(ctx, userID)
	if err != nil {
		return nil, err
	}

	return user, nil
}