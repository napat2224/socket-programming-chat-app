package repository

import (
	"context"
	"log"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/repository/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository(db *mongo.Database, collectionName string) *UserRepository {
	collection := db.Collection(collectionName)

	return &UserRepository{
		collection: collection,
	}
}

func (r *UserRepository) SaveUser(ctx context.Context, user domain.User) error {
	model := models.UserModel{
		UserID:  user.UserID,
		Email:   user.Email,
		Name:    user.Name,
		Profile: user.Profile,
	}

	log.Printf("Saving user name %s, email %s, profile %d", model.Name, model.Email, model.Profile)

	filter := bson.M{"user_id": model.UserID}
	update := bson.M{"$set": model}
	opts := options.Update().SetUpsert(true)

	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func (r *UserRepository) FindById(ctx context.Context, userId string) (*domain.User, error) {
	var userModel models.UserModel

	err := r.collection.FindOne(ctx, bson.M{"user_id": userId}).Decode(&userModel)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // not found
		}
		return nil, err
	}

	user := &domain.User{
		UserID:  userModel.UserID,
		Email:   userModel.Email,
		Name:    userModel.Name,
		Profile: userModel.Profile,
	}

	return user, nil
}

func (r *UserRepository) Update(ctx context.Context, userID string, update map[string]interface{}) (*domain.User, error) {
	_, err := r.collection.UpdateOne(context.TODO(), bson.M{"user_id": userID}, bson.M{"$set": update})
	if err != nil {
		return nil, err
	}
	return r.FindById(ctx, userID)
}
