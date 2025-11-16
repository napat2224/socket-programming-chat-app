package models

import (
	"time"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type MessageModel struct {
	ID        primitive.ObjectID `bson:"_id" json:"id"`
	RoomID    primitive.ObjectID `bson:"room_id" json:"roomId"`
	SenderID  string             `bson:"sender_id" json:"senderId"`
	Content   string             `bson:"content" json:"content"`
	ReplyTo   string             `bson:"reply_to,omitempty" json:"replyTo,omitempty"`
	Reactions []string           `bson:"reactions,omitempty" json:"reactions,omitempty"`
	CreatedAt time.Time          `bson:"created_at" json:"createdAt"`
}

func (m *MessageModel) ToDomain() *domain.Message {
	// Convert reactions from []string to []domain.ReactionType
	var reactions []domain.ReactionType
	for _, r := range m.Reactions {
		reactions = append(reactions, domain.ReactionType(r))
	}
	return &domain.Message{
		ID:        m.ID.Hex(),
		RoomID:    m.RoomID.Hex(),
		SenderID:  m.SenderID,
		Content:   m.Content,
		ReplyTo:   m.ReplyTo,
		Reactions: reactions,
		CreatedAt: m.CreatedAt,
	}
}

func MessageToModel(msg *domain.Message) (*MessageModel, error) {
	var id primitive.ObjectID
    var err error
    if msg.ID == "" {
        id = primitive.NewObjectID()
    } else {
        id, err = primitive.ObjectIDFromHex(msg.ID)
        if err != nil {
            return nil, err
        }
    }

	roomId, err := primitive.ObjectIDFromHex(msg.RoomID)
	if err != nil {
		return nil, err
	}

	// Convert reactions back to []string
	reactions := make([]string, len(msg.Reactions))
	for i, r := range msg.Reactions {
		reactions[i] = string(r)
	}

	return &MessageModel{
		ID:        id,
		RoomID:    roomId,
		SenderID:  msg.SenderID,
		Content:   msg.Content,
		ReplyTo:   msg.ReplyTo,
		Reactions: reactions,
		CreatedAt: msg.CreatedAt,
	}, nil
}
