package handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
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
func (h *ChatHandler) GetPublicRooms(c *fiber.Ctx) error {
	ctx := context.Background()
	rooms, err := h.chatService.GetAllPublicRooms(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(rooms)
}

func (h *ChatHandler) GetPrivateRoomByTargetID(c *fiber.Ctx) error {
	ctx := context.Background()
	targetID := c.Params("targetID")
	claims := c.Locals("claims").(*services.Claims)
	currentUserID := claims.UserID
	rooms, err := h.chatService.GetPrivateRoomByTargetID(ctx, currentUserID, targetID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to get private room",
		})
	}
	return c.JSON(rooms)
}

// type ChatWSHandler struct {
// 	hub            *chatWs.Hub
// 	httpClient     *http.Client
// 	chatServiceURL string
// }

// func NewChatWSHandler(hub *chatWs.Hub) *ChatWSHandler {
// 	return &ChatWSHandler{hub: hub, httpClient: &http.Client{}, chatServiceURL: env.GetString("CHAT_SERVICE_URL", "http://localhost:3004")}
// }

// func (h *ChatWSHandler) RegisterRoutes(app *fiber.App) {
// 	app.Get("/ws/chat", websocket.New(h.handle))
// 	app.Get("/ws/test", websocket.New(h.handleTest))
// }

// // TestMessage represents a random test message structure
// type TestMessage struct {
// 	Timestamp   int64   `json:"timestamp"`
// 	Message     string  `json:"message"`
// 	RandomValue int     `json:"randomValue"`
// 	IsTest      bool    `json:"isTest"`
// 	UserID      string  `json:"userId"`
// 	FloatValue  float64 `json:"floatValue"`
// }

// // handleTest is a test WebSocket handler that sends back random structs
// func (h *ChatWSHandler) handleTest(c *websocket.Conn) {
// 	claims := c.Locals("claims").(*services.Claims)
// 	userID := claims.UserID

// 	log.Printf("[ws-test] User %s connected to test endpoint", userID)

// 	// Send initial welcome message
// 	welcomeMsg := TestMessage{
// 		Timestamp:   time.Now().Unix(),
// 		Message:     "Welcome to the test WebSocket!",
// 		RandomValue: rand.Intn(1000),
// 		IsTest:      true,
// 		UserID:      userID,
// 		FloatValue:  rand.Float64() * 100,
// 	}

// 	welcomeBytes, _ := json.Marshal(welcomeMsg)
// 	if err := c.WriteMessage(websocket.TextMessage, welcomeBytes); err != nil {
// 		log.Printf("[ws-test] Error sending welcome message: %v", err)
// 		return
// 	}

// 	// Start sending random messages every 2 seconds
// 	ticker := time.NewTicker(2 * time.Second)
// 	defer ticker.Stop()

// 	// Also listen for incoming messages
// 	go func() {
// 		for {
// 			_, msg, err := c.ReadMessage()
// 			if err != nil {
// 				log.Printf("[ws-test] Read error: %v", err)
// 				return
// 			}
// 			log.Printf("[ws-test] Received from %s: %s", userID, string(msg))

// 			// Echo back with additional data
// 			echoMsg := TestMessage{
// 				Timestamp:   time.Now().Unix(),
// 				Message:     "Echo: " + string(msg),
// 				RandomValue: rand.Intn(1000),
// 				IsTest:      true,
// 				UserID:      userID,
// 				FloatValue:  rand.Float64() * 100,
// 			}
// 			echoBytes, _ := json.Marshal(echoMsg)
// 			_ = c.WriteMessage(websocket.TextMessage, echoBytes)
// 		}
// 	}()

// 	// Send periodic random messages
// 	messages := []string{
// 		"Random test message",
// 		"Testing WebSocket connection",
// 		"Another random update",
// 		"Periodic status check",
// 		"Connection is working!",
// 	}

// 	for range ticker.C {
// 		randomMsg := TestMessage{
// 			Timestamp:   time.Now().Unix(),
// 			Message:     messages[rand.Intn(len(messages))],
// 			RandomValue: rand.Intn(1000),
// 			IsTest:      true,
// 			UserID:      userID,
// 			FloatValue:  rand.Float64() * 100,
// 		}

// 		randomBytes, _ := json.Marshal(randomMsg)
// 		if err := c.WriteMessage(websocket.TextMessage, randomBytes); err != nil {
// 			log.Printf("[ws-test] Error sending message: %v", err)
// 			break
// 		}
// 		log.Printf("[ws-test] Sent random message to %s", userID)
// 	}

// 	log.Printf("[ws-test] User %s disconnected from test endpoint", userID)
// }

// type wsMessage struct {
// 	Action  string `json:"action"`
// 	RoomID  string `json:"roomId"`
// 	Type    string `json:"type,omitempty"`
// 	Content string `json:"content,omitempty"`
// }

// func (h *ChatWSHandler) handle(c *websocket.Conn) {
// 	claims := c.Locals("claims").(*services.Claims)
// 	userID := claims.UserID
// 	name := claims.Name
// 	profile := domain.ProfileType(claims.Profile)

// 	conn := chatWs.NewConnection(c)

// 	presence := chatWs.UserPresenceData{
// 		UserId:  userID,
// 		Name:    name,
// 		Profile: profile,
// 	}
// 	h.hub.AddUser(presence, conn)
// 	defer func() {
// 		h.hub.Remove(conn)
// 		conn.Close()
// 		log.Printf("[ws] disconnected user=%s", userID)
// 	}()

// 	initialRoomID := c.Query("roomId")
// 	if initialRoomID != "" {
// 		if h.validateAndJoinRoom(initialRoomID, userID, conn) {
// 			log.Printf("[ws] user=%s joined initial room=%s", userID, initialRoomID)
// 		}
// 	}

// 	for {
// 		raw, err := conn.Read()
// 		if err != nil {
// 			break
// 		}

// 		var msg wsMessage
// 		if err := json.Unmarshal(raw, &msg); err != nil {
// 			log.Println("[ws] invalid json:", err)
// 			continue
// 		}

// 		switch msg.Action {
// 		case "join_room":
// 			if msg.RoomID == "" {
// 				log.Println("[ws] missing roomId in join_room")
// 				continue
// 			}
// 			if h.validateAndJoinRoom(msg.RoomID, userID, conn) {
// 				log.Printf("[ws] user=%s joined room=%s", userID, msg.RoomID)
// 				h.sendAck(conn, msg.RoomID)
// 			}

// 		case "message":
// 			if msg.RoomID == "" {
// 				log.Println("[ws] missing roomId in message")
// 				continue
// 			}

// 		default:
// 			log.Printf("[ws] unknown action: %s", msg.Action)
// 		}
// 	}
// }

// func (h *ChatWSHandler) validateAndJoinRoom(roomID, userID string, conn *chatWs.Connection) bool {
// 	type validateReq struct {
// 		RoomID string `json:"roomID"`
// 	}
// 	type validateResp struct {
// 		Allowed bool   `json:"allowed"`
// 		Reason  string `json:"reason"`
// 	}

// 	url := h.chatServiceURL + "/api/chat/room/validate"

// 	bodyBytes, _ := json.Marshal(validateReq{RoomID: roomID})

// 	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(bodyBytes))
// 	if err != nil {
// 		log.Printf("[ws] build http request error: %v", err)
// 		_ = conn.Send([]byte(`{"error":"validation request error"}`))
// 		return false
// 	}
// 	req = req.WithContext(context.Background())
// 	req.Header.Set("Content-Type", "application/json")
// 	req.Header.Set("X-User-Id", userID)

// 	res, err := h.httpClient.Do(req)
// 	if err != nil {
// 		log.Printf("[ws] http call error for user=%s room=%s: %v", userID, roomID, err)
// 		_ = conn.Send([]byte(`{"error":"validation failed"}`))
// 		return false
// 	}
// 	defer res.Body.Close()

// 	respBody, _ := io.ReadAll(res.Body)
// 	if res.StatusCode != http.StatusOK {
// 		log.Printf("[ws] validation http %d: %s", res.StatusCode, string(respBody))
// 		_ = conn.Send([]byte(`{"error":"validation http error"}`))
// 		return false
// 	}

// 	var v validateResp
// 	if err := json.Unmarshal(respBody, &v); err != nil {
// 		log.Printf("[ws] parse validation response error: %v", err)
// 		_ = conn.Send([]byte(`{"error":"invalid validation response"}`))
// 		return false
// 	}

// 	if !v.Allowed {
// 		log.Printf("[ws] user=%s denied joining room=%s: %s", userID, roomID, v.Reason)
// 		_ = conn.Send([]byte(`{"error":"` + v.Reason + `"}`))
// 		return false
// 	}

// 	h.hub.AddToRoom(roomID, conn)
// 	return true
// }

// func (h *ChatWSHandler) sendAck(conn *chatWs.Connection, roomID string) {
// 	ack := map[string]any{
// 		"type":   "join_room",
// 		"roomId": roomID,
// 	}
// 	if ackBytes, err := json.Marshal(ack); err == nil {
// 		_ = conn.Send(ackBytes)
// 	}
// }
