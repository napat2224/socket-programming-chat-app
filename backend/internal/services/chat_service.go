package services

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/repository"
)

type ChatService struct {
	roomRepo    *repository.RoomRepository
	messageRepo *repository.MessageRepository
	userRepo *repository.UserRepository
}


type RoomMember struct {
	ID      string              `json:"id"`
	Name    string              `json:"name"`
	Profile domain.ProfileType  `json:"profile"`
}

type RoomDetail struct {
	RoomID   string        `json:"roomId"`
	RoomName string        `json:"roomName"`
	Members  []RoomMember  `json:"members"`
}

func NewChatService(
	roomRepo *repository.RoomRepository,
	messageRepo *repository.MessageRepository,
	userRepo *repository.UserRepository,
) *ChatService {
	return &ChatService{
		roomRepo:    roomRepo,
		messageRepo: messageRepo,
		userRepo: userRepo,
	}
}

func (s *ChatService) CreateRoom(
	ctx context.Context,
	creatorID string,
	memberIDs []string,
	roomName string,
	background domain.BackgroundColor,
	isPublic bool,
) (*domain.Room, error) {
	if len(memberIDs) == 0 {
		memberIDs = []string{creatorID}
	}

	room := &domain.Room{
		ID:              "",
		CreatorID:       creatorID,
		MemberIDs:       memberIDs,
		RoomName:        roomName,
		BackgroundColor: background,
		LastMessageSent: time.Time{},
		IsPublic:        isPublic,
	}

	return s.roomRepo.SaveRoom(ctx, room)
}

func (s *ChatService) SendTextMessage(
	ctx context.Context,
	roomID string,
	senderID string,
	content string,
	replyTo string,
) (*domain.Message, error) {
	if exists, err := s.roomRepo.RoomExists(ctx, roomID); err != nil {
		return nil, err
	} else if !exists {
		return nil, err
	}

	msg := &domain.Message{
		ID:        "",
		RoomID:    roomID,
		SenderID:  senderID,
		Content:   content,
		ReplyTo:   replyTo,
		Reactions: nil,
		CreatedAt: time.Now(),
	}

	return s.messageRepo.SaveMessage(ctx, msg)
}

func (s *ChatService) GetRoomMessages(
	ctx context.Context,
	roomID string,
) ([]*domain.Message, error) {
	return s.messageRepo.FindMessagesByRoomID(ctx, roomID)
}

func (s *ChatService) GetUserRooms(
	ctx context.Context,
	userID string,
) ([]*domain.Room, error) {
	return s.roomRepo.GetChatRoomsByUserID(ctx, userID)
}

func (s *ChatService) GetAllPublicRooms(ctx context.Context) ([]*domain.Room, error) {
	return s.roomRepo.GetAllPublicRooms(ctx)
}

func (s *ChatService) GetPrivateRoomByTargetID(ctx context.Context, currentUserID string, targetID string) (*domain.Room, error) {
	room, _ := s.roomRepo.GetPrivateRoomByTargetID(ctx, currentUserID, targetID)
	if room == nil {
		log.Println("no private room found, creating new one")
		room = &domain.Room{
			ID:              "",
			CreatorID:       currentUserID,
			MemberIDs:       []string{currentUserID, targetID},
			RoomName:        fmt.Sprintf("%s and %s", currentUserID, targetID),
			BackgroundColor: domain.ColorBlue,
			LastMessageSent: time.Time{},
			IsPublic:        false, // create private room by default
		}
		room, err := s.roomRepo.SaveRoom(ctx, room)
		if err != nil {
			log.Println("error creating private room:", err)
			return nil, err
		}
		log.Println("private room created:", room)
	}
	log.Println("private room found:", room)
	return room, nil
}

func (s *ChatService) AddReaction(
	ctx context.Context,
	messageID string,
	reaction domain.ReactionType,
) (*domain.Message, error) {
	return s.messageRepo.AddReaction(ctx, messageID, reaction)
}

func (s *ChatService) JoinRoom(ctx context.Context, roomID string, userID string) error {
	return s.roomRepo.JoinRoom(ctx, roomID, userID)
}

func (s *ChatService) GetChatRoomByRoomID(
    ctx context.Context,
    roomID string,
) (*RoomDetail, error) {
    room, err := s.roomRepo.GetChatRoomsByRoomID(ctx, roomID)
    if err != nil {
        return nil, err
    }

    users, err := s.userRepo.GetUsersByIDs(ctx, room.MemberIDs)
    if err != nil {
        return nil, err
    }

    members := make([]RoomMember, 0, len(users))
    for _, u := range users {
        members = append(members, RoomMember{
            ID:      u.UserID,
            Name:    u.Name,
            Profile: u.Profile,
        })
    }

    return &RoomDetail{
        RoomID:   room.ID,
        RoomName: room.RoomName,
        Members:  members,
    }, nil
}


type UpdateBackgroundResponse struct {
	BackgroundColor string `json:"backgroundColor"`
}

// func (s *ChatService) UpdateBackgroundRoom(ctx context.Context, roomID string, background string) (*UpdateBackgroundResponse, error) {
// 	room, err := s.roomRepo.GetChatRoomsByRoomID(ctx, roomID)
// 	if err != nil {
// 		return nil, err
// 	}
// 	if room == nil {
// 		return nil, fmt.Errorf("room not found")
// 	}

// 	room.BackgroundColor = BackgroundColor(background)

// 	_, err = s.roomRepo.UpdateRoom(ctx, roomID, background)
// 	if err != nil {
// 		return nil, err
// 	}

// 	return &UpdateBackgroundResponse{
// 		BackgroundColor: background,
// 	}, nil
// }
