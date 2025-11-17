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
		Profile: int(user.Profile),
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
		Profile: domain.ProfileType(userModel.Profile),
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

func (r *UserRepository) FindByName(ctx context.Context, name string) (*domain.User, error) {
	var userModel models.UserModel

	err := r.collection.FindOne(ctx, bson.M{"name": name}).Decode(&userModel)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &domain.User{
		UserID:  userModel.UserID,
		Email:   userModel.Email,
		Name:    userModel.Name,
		Profile: domain.ProfileType(userModel.Profile),
	}, nil
}

func (r *UserRepository) GetUsersByIDs(ctx context.Context, ids []string) ([]*domain.User, error) {
    filter := bson.M{"user_id": bson.M{"$in": ids}}

    cur, err := r.collection.Find(ctx, filter)
    if err != nil {
        return nil, err
    }
    defer cur.Close(ctx)

    var res []*domain.User

    for cur.Next(ctx) {
        var m models.UserModel
        if err := cur.Decode(&m); err != nil {
            return nil, err
        }

        u := &domain.User{
            UserID:  m.UserID,
            Name:    m.Name,
            Profile: domain.ProfileType(m.Profile),
        }

        res = append(res, u)
    }

    if err := cur.Err(); err != nil {
        return nil, err
    }

    return res, nil
}
