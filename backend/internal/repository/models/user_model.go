package models

// Model for saving into gorm
type UserModel struct {
	UserID  string `bson:"user_id"`
	Name    string `bson:"name"`
	Email   string `bson:"email"`
	Profile int `bson:"profile"`
}
