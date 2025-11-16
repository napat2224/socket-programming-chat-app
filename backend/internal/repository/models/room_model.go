package models

import (
	"time"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RoomModel struct {
	ID              primitive.ObjectID `bson:"_id" json:"id"` // MongoDB auto-generates if omitted
	CreatorID       string             `bson:"creator_id" json:"creatorId"`
	MemberIDs       []string           `bson:"member_ids" json:"memberIds"`
	RoomName        string             `bson:"room_name,omitempty" json:"roomName,omitempty"`
	BackgroundColor string             `bson:"background_color,omitempty" json:"backgroundColor,omitempty"`
	LastMessageSent time.Time          `bson:"last_message_sent,omitempty" json:"lastMessageSent,omitempty"`
	IsPublic        bool               `bson:"is_public" json:"isPublic"`
}

func (r *RoomModel) ToDomain() *domain.Room {
	return &domain.Room{
		ID:              r.ID.Hex(),
		CreatorID:       r.CreatorID,
		MemberIDs:       r.MemberIDs,
		RoomName:        r.RoomName,
		BackgroundColor: domain.BackgroundColor(r.BackgroundColor),
		LastMessageSent: r.LastMessageSent,
		IsPublic:        r.IsPublic,
	}
}

func RoomToModel(room *domain.Room) (*RoomModel, error) {
	 var id primitive.ObjectID
    var err error

    if room.ID == "" {
        id = primitive.NewObjectID()
    } else {
        id, err = primitive.ObjectIDFromHex(room.ID)
        if err != nil {
            return nil, err
        }
    }


	return &RoomModel{
		ID:              id,
		CreatorID:       room.CreatorID,
		MemberIDs:       room.MemberIDs,
		RoomName:        room.RoomName,
		BackgroundColor: string(room.BackgroundColor),
		LastMessageSent: room.LastMessageSent,
		IsPublic:        room.IsPublic,
	}, nil
}
