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

func (s *UserService) Register(ctx context.Context, idToken string, name string, profile int) error {
	claims, err := s.authService.VerifyIDToken(ctx, idToken)
	if err != nil {
		return fmt.Errorf("invalid firebase token: %w", err)
	}

	uid := claims.UserID

	p := domain.ProfileType(profile)
	if !p.IsValid() {
		return status.Error(codes.InvalidArgument, "invalid profile value")
	}

	customClaims := map[string]interface{}{
		"name":    name,
		"profile": profile,
	}

	log.Printf("Setting custom claims for user %s: %v, name: %s, profile: %s", uid, customClaims, name, profile)
	if err := s.authService.SetCustomUserClaims(ctx, uid, customClaims); err != nil {
		return status.Errorf(codes.Internal, "failed to set custom claims: %v", err)
	}

	user := domain.User{
		UserID:  claims.UserID,
		Name:    name,
		Email:   claims.Email,
		Profile: p,
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
