package domain

import (
	"time"
)

type Room struct {
	ID              string          `json:"id"`
	CreatorID       string          `json:"creatorId"`
	MemberIDs       []string        `json:"memberIds"`
	RoomName        string          `json:"roomName,omitempty"`
	BackgroundColor BackgroundColor `json:"backgroundColor,omitempty"`
	LastMessageSent time.Time       `json:"lastMessageSent,omitempty"`
	IsPublic        bool            `json:"isPublic"`
}

type BackgroundColor string

const (
	ColorRed    BackgroundColor = "1"
	ColorBlue   BackgroundColor = "2"
	ColorGreen  BackgroundColor = "3"
	ColorYellow BackgroundColor = "4"
	ColorPurple BackgroundColor = "5"
	ColorPink   BackgroundColor = "6"
	ColorRed    BackgroundColor = "1"
	ColorBlue   BackgroundColor = "2"
	ColorGreen  BackgroundColor = "3"
	ColorYellow BackgroundColor = "4"
	ColorPurple BackgroundColor = "5"
	ColorPink   BackgroundColor = "6"
)

func CreateRoom(id, creatorID, roomName, backgroundColor string, memberIDs []string, lastMessageSent time.Time, isPublic bool) *Room {
	return &Room{
		ID:              id,
		CreatorID:       creatorID,
		MemberIDs:       memberIDs,
		RoomName:        roomName,
		BackgroundColor: BackgroundColor(backgroundColor),
		LastMessageSent: lastMessageSent,
		IsPublic:        isPublic,
	}
}
