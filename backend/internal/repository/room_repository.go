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
	log.Println("saving room:", room)
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
	// Find a private room where both users are members
	filter := bson.M{
		"member_ids": bson.M{
			"$all": []string{currentUserID, targetID},
		},
		"is_public": false,
		"$expr": bson.M{
			"$eq": []interface{}{
				bson.M{"$size": "$member_ids"},
				2,
			},
		},
	}
	room := models.RoomModel{}
	err := r.collection.FindOne(ctx, filter).Decode(&room)
	if err != nil {
		return nil, err
	}

	return room.ToDomain(), nil
}

func (r *RoomRepository) JoinRoom(ctx context.Context, roomID string, userID string) error {
	objID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return err
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$addToSet": bson.M{"member_ids": userID}}
	_, err = r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (r *RoomRepository) GetChatRoomsByRoomID(ctx context.Context, roomID string) (*domain.Room, error) {
	oid, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": oid}

	var room models.RoomModel
	err = r.collection.FindOne(ctx, filter).Decode(&room)
	if err != nil {
		return nil, err
	}

	return room.ToDomain(), nil
}

func (r *RoomRepository) UpdateRoom(ctx context.Context, roomID string, background string) (*domain.Room, error) {
	roomOID, err := primitive.ObjectIDFromHex(roomID)
	if err != nil {
		log.Printf("[GetChatRoomsByRoomID] invalid roomID %s: %v", roomID, err)
		return nil, err
	}

	filter := bson.M{"_id": roomOID}
	update := bson.M{"$set": bson.M{"backgroundColor": background}}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var room domain.Room
	if err := r.collection.FindOneAndUpdate(ctx, filter, update, opts).Decode(&room); err != nil {
		return nil, err
	}
	return &room, nil
}
