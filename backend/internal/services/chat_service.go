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
}

func NewChatService(
	roomRepo *repository.RoomRepository,
	messageRepo *repository.MessageRepository,
) *ChatService {
	return &ChatService{
		roomRepo:    roomRepo,
		messageRepo: messageRepo,
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
