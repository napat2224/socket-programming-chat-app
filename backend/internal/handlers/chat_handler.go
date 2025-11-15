package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/napat2224/socket-programming-chat-app/internal/services"
	chatWs "github.com/napat2224/socket-programming-chat-app/internal/services/websocket"
	"github.com/napat2224/socket-programming-chat-app/internal/utils/env"
)

type ChatHandler struct {
	chatService *services.ChatService
}

func NewChatHandler(service *services.ChatService) *ChatHandler {
	return &ChatHandler{
		chatService: service,
	}
}

type ChatWSHandler struct {
	hub            *chatWs.Hub
	httpClient     *http.Client
	chatServiceURL string
}

func NewChatWSHandler(hub *chatWs.Hub) *ChatWSHandler {
	return &ChatWSHandler{hub: hub, httpClient: &http.Client{}, chatServiceURL: env.GetString("CHAT_SERVICE_URL", "http://localhost:3004")}
}

func (h *ChatWSHandler) RegisterRoutes(app *fiber.App) {
	app.Get("/ws/chat", websocket.New(h.handle))
}

type wsMessage struct {
	Action  string `json:"action"`
	RoomID  string `json:"roomId"`
	Type    string `json:"type,omitempty"`
	Content string `json:"content,omitempty"`
}

func (h *ChatWSHandler) handle(c *websocket.Conn) {
	userID := c.Locals("claims").(services.Claims).UserID

	conn := chatWs.NewConnection(c)
	h.hub.AddUser(userID, conn)
	defer func() {
		h.hub.Remove(conn)
		conn.Close()
		log.Printf("[ws] disconnected user=%s", userID)
	}()

	initialRoomID := c.Query("roomId")
	if initialRoomID != "" {
		if h.validateAndJoinRoom(initialRoomID, userID, conn) {
			log.Printf("[ws] user=%s joined initial room=%s", userID, initialRoomID)
		}
	}

	for {
		raw, err := conn.Read()
		if err != nil {
			break
		}

		var msg wsMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			log.Println("[ws] invalid json:", err)
			continue
		}

		switch msg.Action {
		case "join_room":
			if msg.RoomID == "" {
				log.Println("[ws] missing roomId in join_room")
				continue
			}
			if h.validateAndJoinRoom(msg.RoomID, userID, conn) {
				log.Printf("[ws] user=%s joined room=%s", userID, msg.RoomID)
				h.sendAck(conn, msg.RoomID)
			}

		case "message":
			if msg.RoomID == "" {
				log.Println("[ws] missing roomId in message")
				continue
			}

		default:
			log.Printf("[ws] unknown action: %s", msg.Action)
		}
	}
}

func (h *ChatWSHandler) validateAndJoinRoom(roomID, userID string, conn *chatWs.Connection) bool {
	type validateReq struct {
		RoomID string `json:"roomID"`
	}
	type validateResp struct {
		Allowed bool   `json:"allowed"`
		Reason  string `json:"reason"`
	}

	url := h.chatServiceURL + "/api/chat/room/validate"

	bodyBytes, _ := json.Marshal(validateReq{RoomID: roomID})

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		log.Printf("[ws] build http request error: %v", err)
		_ = conn.Send([]byte(`{"error":"validation request error"}`))
		return false
	}
	req = req.WithContext(context.Background())
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-User-Id", userID)

	res, err := h.httpClient.Do(req)
	if err != nil {
		log.Printf("[ws] http call error for user=%s room=%s: %v", userID, roomID, err)
		_ = conn.Send([]byte(`{"error":"validation failed"}`))
		return false
	}
	defer res.Body.Close()

	respBody, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		log.Printf("[ws] validation http %d: %s", res.StatusCode, string(respBody))
		_ = conn.Send([]byte(`{"error":"validation http error"}`))
		return false
	}

	var v validateResp
	if err := json.Unmarshal(respBody, &v); err != nil {
		log.Printf("[ws] parse validation response error: %v", err)
		_ = conn.Send([]byte(`{"error":"invalid validation response"}`))
		return false
	}

	if !v.Allowed {
		log.Printf("[ws] user=%s denied joining room=%s: %s", userID, roomID, v.Reason)
		_ = conn.Send([]byte(`{"error":"` + v.Reason + `"}`))
		return false
	}

	h.hub.AddToRoom(roomID, conn)
	return true
}

func (h *ChatWSHandler) sendAck(conn *chatWs.Connection, roomID string) {
	ack := map[string]any{
		"type":   "join_room",
		"roomId": roomID,
	}
	if ackBytes, err := json.Marshal(ack); err == nil {
		_ = conn.Send(ackBytes)
	}
}

// Implement handler for each API endpoints here
