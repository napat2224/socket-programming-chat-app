package models

import "github.com/napat2224/socket-programming-chat-app/internal/domain"

// Model for saving into gorm
type UserModel struct {
	UserID  string `bson:"user_id"`
	Name    string `bson:"name"`
	Email   string `bson:"email"`
	Profile int `bson:"profile"`
}

func (u *UserModel) ToDomain() *domain.User {
	if u == nil {
		return nil
	}

	return &domain.User{
		UserID:      u.UserID,
		Name:    u.Name,
		Profile: domain.ProfileType(u.Profile), // adjust type if needed
	}
}