package websocket

import (
	"encoding/json"
	"time"

	domain "github.com/napat2224/socket-programming-chat-app/internal/domain"
)

type MessageType string

const (
	TypeUserPresence     MessageType = "user_presence"
	TypePresenceSnapshot MessageType = "presence_snapshot"
	TypeTextMessage      MessageType = "message"
	TypeReactMessage     MessageType = "react_message"
	TypeCreateRoom       MessageType = "create_room"
	TypeJoinRoom         MessageType = "join_room"
)

type UserStatus string

const (
	StatusOnline  UserStatus = "online"
	StatusOffline UserStatus = "offline"
)

type WsMessage struct {
	Type   MessageType     `json:"type"`
	Status UserStatus      `json:"status,omitempty"`
	Data   json.RawMessage `json:"data"`
}

type UserPresenceData struct {
	UserId  string             `json:"userId"`
	Name    string             `json:"name"`
	Profile domain.ProfileType `json:"profile,omitempty"`
}

type UserOfflineData struct {
	UserId string `json:"userId"`
}

type PresenceSnapshotData struct {
	Users []UserPresenceData `json:"users"`
}

type IncomingTextData struct {
	Content      string  `json:"content"`
	RoomId       string  `json:"roomId"`
	ReplyContent *string `json:"replyContent,omitempty"`
}

type OutgoingTextData struct {
	MessageId     string                `json:"messageId"`
	SenderId      string                `json:"senderId"`
	Content       string                `json:"content"`
	RoomId        string                `json:"roomId"`
	ReplyContent  *string               `json:"replyContent"`
	SenderName    string                `json:"senderName"`
	Reactions     []domain.ReactionType `json:"reactions"`
	SenderProfile domain.ProfileType    `json:"senderProfile,omitempty"`
	CreatedAt     time.Time             `json:"createdAt"`
}

type IncomingReactData struct {
	MessageId string              `json:"messageId"`
	ReactType domain.ReactionType `json:"reactType"`
}

type OutgoingReactData struct {
	MessageId string              `json:"messageId"`
	ReactType domain.ReactionType `json:"reactType"`
}

type IncomingCreateRoomData struct {
	ChatName   string                 `json:"chatName"`
	Background domain.BackgroundColor `json:"background"`
	IsPublic   bool                   `json:"isPublic"`
}

type OutgoingCreateRoomData struct {
	RoomId     string                 `json:"roomId"`
	CreatedBy  string                 `json:"createdBy"`
	ChatName   string                 `json:"chatName"`
	UserId     []string               `json:"userId"`
	Background domain.BackgroundColor `json:"background"`
	IsPublic   bool                   `json:"isPublic"`
}

type IncomingJoinRoomData struct {
	RoomId string `json:"roomId"`
}

type RoomMemberJoinedData struct {
	RoomId  string             `json:"roomId"`
	UserId  string             `json:"userId"`
	Name    string             `json:"name"`
	Profile domain.ProfileType `json:"profile,omitempty"`
}

func MustMarshal(v any) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		panic(err)
	}
	return b
}
