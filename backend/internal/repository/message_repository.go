package repository

import (
	"context"
	"errors"
	"log"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/repository/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MessageRepository struct {
	collection *mongo.Collection
}

func NewMongoMessageRepository(db *mongo.Database, collectionName string) *MessageRepository {
	collection := db.Collection(collectionName)

	return &MessageRepository{
		collection: collection,
	}
}

// !!!!!!!! TODO: Update laste message sent in room !!!!!!!!!!!!!
func (r *MessageRepository) SaveMessage(ctx context.Context, message *domain.Message) (*domain.Message, error) {
	model, err := models.MessageToModel(message)
	if err != nil {
		return nil, err
	}

	insertResult, err := r.collection.InsertOne(ctx, model)
	if err != nil {
		return nil, err
	}

	oid, ok := insertResult.InsertedID.(primitive.ObjectID)
	if !ok {
		return nil, errors.New("failed to convert inserted ID to ObjectID")
	}

	message.ID = oid.Hex()
	return message, nil
}

func (r *MessageRepository) FindMessagesByRoomID(ctx context.Context, roomID string) ([]*domain.Message, error) {
	roomOID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		log.Println("Invalid RoomID for MessageModel:", err)
		roomOID = primitive.NilObjectID
	}

	filter := bson.M{"room_id": roomOID}
	cursor, err := r.collection.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var messages []*models.MessageModel
	if err := cursor.All(ctx, &messages); err != nil {
		return nil, err
	}

	var domainMessages []*domain.Message
	for _, msg := range messages {
		domainMessages = append(domainMessages, msg.ToDomain())
	}

	return domainMessages, nil
}
