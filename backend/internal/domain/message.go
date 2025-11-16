package domain

import (
	"time"
)

type Message struct {
    ID        string         `json:"id"`
    RoomID    string         `json:"roomId"`
    SenderID  string         `json:"senderId"`
    Content   string         `json:"content"`
    ReplyTo   string         `json:"replyTo,omitempty"`
    Reactions []ReactionType `json:"reactions,omitempty"`
    CreatedAt time.Time      `json:"createdAt"`
}

type ReactionType string

const (
	ReactionLike  ReactionType = "1"
	ReactionDislike  ReactionType = "2"
	ReactionLove ReactionType = "3"
)

func CreateMessage(messageID, roomID, senderID, content, replyTo string, reactions []ReactionType, createdAt time.Time) *Message {
	return &Message{
		ID:        messageID,
		RoomID:    roomID,
		SenderID:  senderID,
		Content:   content,
		ReplyTo:   replyTo,
		Reactions: reactions,
		CreatedAt: createdAt,
	}
}

