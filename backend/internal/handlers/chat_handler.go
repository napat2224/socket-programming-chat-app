package handlers

import (
	"github.com/napat2224/socket-programming-chat-app/internal/services"
)

type ChatHandler struct {
	chatService *services.ChatService
}

func NewChatHandler(service *services.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: service,
	}
}

// Implement handler for each API endpoints here
