package repository

import (
	"context"
	"log"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/repository/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type RoomRepository struct {
	collection *mongo.Collection
}

func NewMongoRoomRepository(db *mongo.Database, collectionName string) *RoomRepository {
	collection := db.Collection(collectionName)

	return &RoomRepository{
		collection: collection,
	}
}

func (r *RoomRepository) SaveRoom(ctx context.Context, room *domain.Room) (*domain.Room, error) {
	model, err := models.RoomToModel(room)
	if err != nil {
		return nil, err
	}
	res, err := r.collection.InsertOne(ctx, model)
	if err != nil {
		return nil, err
	}

	roomIDStr := res.InsertedID.(primitive.ObjectID).Hex()
	room.ID = roomIDStr
	return room, nil
}

func (r *RoomRepository) RoomExists(ctx context.Context, roomID string) (bool, error) {
	objID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return false, err
	}

	count, err := r.collection.CountDocuments(ctx, bson.M{"_id": objID})
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// !!!!!!!!!!!!!!!!! FIX ME: check in member array !!!!!!!!!!!!!!!!!
func (r *RoomRepository) IsUserInRoom(ctx context.Context, userID string, roomID string) (bool, error) {
	objID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return false, err
	}

	filter := bson.M{
		"_id": objID,
		"$or": []bson.M{
			{"prophet_id": userID},
			{"customer_id": userID},
		},
	}

	count, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// !!!!!!!!!!!!!!!!! FIX ME: check in member array !!!!!!!!!!!!!!!!!
func (r *RoomRepository) GetChatRoomsByUserID(ctx context.Context, userID string) ([]*domain.Room, error) {
	filter := bson.M{"$or": []bson.M{
		{"prophet_id": userID},
		{"customer_id": userID}, //check in member ids array instead
	}}

	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}) // newest first
	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("[GetChatRoomsByUserID] DB Find error: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var rooms []*models.RoomModel
	if err := cursor.All(ctx, &rooms); err != nil {
		log.Printf("[GetChatRoomsByUserID] Cursor.All error: %v", err)
		return nil, err
	}

	var domainRooms []*domain.Room
	for _, rm := range rooms {
		domainRooms = append(domainRooms, rm.ToDomain())
	}
	return domainRooms, nil
}

func (r *RoomRepository) GetAllPublicRooms(ctx context.Context) ([]*domain.Room, error) {
	filter := bson.M{"is_public": true}
	findOptions := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}) // newest first
	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		log.Printf("[GetAllPublicRooms] DB Find error: %v", err)
		return nil, err
	}
	defer cursor.Close(ctx)

	var rooms []*models.RoomModel
	if err := cursor.All(ctx, &rooms); err != nil {
		log.Printf("[GetAllPublicRooms] Cursor.All error: %v", err)
		return nil, err
	}

	var domainRooms []*domain.Room
	for _, rm := range rooms {
		domainRooms = append(domainRooms, rm.ToDomain())
	}
	return domainRooms, nil
}

func (r *RoomRepository) GetPrivateRoomByTargetID(ctx context.Context, currentUserID string, targetID string) (*domain.Room, error) {
	filter := bson.M{"$or": []bson.M{
		{"prophet_id": currentUserID, "customer_id": targetID},
		{"prophet_id": targetID, "customer_id": currentUserID},
	}}
	room := models.RoomModel{}
	err := r.collection.FindOne(ctx, filter).Decode(&room)
	if err != nil {
		return nil, err
	}

	return room.ToDomain(), nil
}
