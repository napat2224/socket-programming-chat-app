package handlers

import (
	"context"
	"encoding/json"
	"log"

	"github.com/gofiber/websocket/v2"

	"github.com/napat2224/socket-programming-chat-app/internal/domain"
	"github.com/napat2224/socket-programming-chat-app/internal/services"
	ws "github.com/napat2224/socket-programming-chat-app/internal/services/websocket"
)

type WsHandler struct {
	hub         *ws.Hub
	chatService *services.ChatService
}

func NewWsHandler(hub *ws.Hub, chatService *services.ChatService) *WsHandler {
	return &WsHandler{
		hub:         hub,
		chatService: chatService,
	}
}

func (h *WsHandler) Handle(c *websocket.Conn) {
    claimsAny := c.Locals("claims")
    claims, ok := claimsAny.(*services.Claims)
    if !ok || claims == nil {
        log.Println("[ws] missing claims in context, closing connection")
        _ = c.Close()
        return
    }

    userId := claims.UserID
    name := claims.Name
    p := domain.ProfileType(claims.Profile)

    if userId == "" {
        log.Println("[ws] empty userId from claims, closing connection")
        _ = c.Close()
        return
    }

    conn := ws.NewConnection(c)

    presence := ws.UserPresenceData{
        UserId:  userId,
        Name:    name,
        Profile: p,
    }

    h.hub.AddUser(presence, conn)

    snapshot := ws.PresenceSnapshotData{
        Users: h.hub.OnlineUsers(),
    }
    snapMsg := ws.WsMessage{
        Type:   ws.TypePresenceSnapshot,
        Status: "",
        Data:   ws.MustMarshal(snapshot),
    }
    if err := conn.Send(ws.MustMarshal(snapMsg)); err != nil {
        log.Println("[ws] failed to send snapshot:", err)
    }

    onlineEnvelope := ws.WsMessage{
        Type:   ws.TypeUserPresence,
        Status: ws.StatusOnline,
        Data:   ws.MustMarshal(presence),
    }
    h.hub.BroadcastToAllExcept(conn, ws.MustMarshal(onlineEnvelope))

    defer func() {
        userId, last := h.hub.Remove(conn)
        if userId != "" && last {
            data := ws.UserOfflineData{
                UserId: userId,
            }
            envelope := ws.WsMessage{
                Type:   ws.TypeUserPresence,
                Status: ws.StatusOffline,
                Data:   ws.MustMarshal(data),
            }
            h.hub.BroadcastToAll(ws.MustMarshal(envelope))
        }
        conn.Close()
    }()

    for {
        raw, err := conn.Read()
        if err != nil {
            log.Println("[ws] read error:", err)
            break
        }

        var envelope ws.WsMessage
        if err := json.Unmarshal(raw, &envelope); err != nil {
            log.Println("[ws] invalid ws message:", err)
            continue
        }

        switch envelope.Type {
        case ws.TypeTextMessage:
            h.handleTextMessage(conn, envelope)

        case ws.TypeReactMessage:
            h.handleReactMessage(conn, envelope)

        case ws.TypeCreateRoom:
            h.handleCreateRoom(conn, envelope)

        case ws.TypeJoinRoom:
            h.handleJoinRoom(conn, envelope)

        default:
            log.Println("[ws] unknown message type:", envelope.Type)
        }
    }
}

func (h *WsHandler) handleTextMessage(conn *ws.Connection, envelope ws.WsMessage) {
	var in ws.IncomingTextData
	if err := json.Unmarshal(envelope.Data, &in); err != nil {
		log.Println("[ws] invalid text message data:", err)
		return
	}

	senderId := h.hub.UserIDForConn(conn)
	if senderId == "" {
		log.Println("[ws] message from unknown user")
		return
	}

	userInfo, _ := h.hub.UserInfo(senderId)

	var replyTo string
	if in.ReplyContent != nil {
		replyTo = *in.ReplyContent
	}

	msg, err := h.chatService.SendTextMessage(
		context.Background(),
		in.RoomId,
		senderId,
		in.Content,
		replyTo,
	)
	if err != nil {
		log.Println("[ws] failed to save message:", err)
		return
	}
    if msg == nil {
        log.Println("[ws] ERROR: chatService returned nil msg with nil error")
        return
    }

	out := ws.OutgoingTextData{
		MessageId:     msg.ID,
		SenderId:      senderId,
		Content:       msg.Content,
		RoomId:        msg.RoomID,
		ReplyContent:  in.ReplyContent,
		SenderName:    userInfo.Name,
		SenderProfile: userInfo.Profile,
	}

	outEnvelope := ws.WsMessage{
		Type:   ws.TypeTextMessage,
		Status: "",
		Data:   ws.MustMarshal(out),
	}

	h.hub.BroadcastToRoom(in.RoomId, ws.MustMarshal(outEnvelope))
}

func (h *WsHandler) handleReactMessage(conn *ws.Connection, envelope ws.WsMessage) {
	var in ws.IncomingReactData
	if err := json.Unmarshal(envelope.Data, &in); err != nil {
		log.Println("[ws] invalid react message data:", err)
		return
	}

	out := ws.OutgoingReactData{
		MessageId: in.MessageId,
		ReactType: in.ReactType,
	}

	outEnvelope := ws.WsMessage{
		Type:   ws.TypeReactMessage,
		Status: "",
		Data:   ws.MustMarshal(out),
	}

	_ = outEnvelope
}

func (h *WsHandler) handleCreateRoom(conn *ws.Connection, envelope ws.WsMessage) {
	var in ws.IncomingCreateRoomData
	if err := json.Unmarshal(envelope.Data, &in); err != nil {
		log.Println("[ws] invalid create_room data:", err)
		return
	}

	creatorId := h.hub.UserIDForConn(conn)
	if creatorId == "" {
		log.Println("[ws] create_room from unknown user")
		return
	}

	room, err := h.chatService.CreateRoom(
		context.Background(),
		creatorId,
		[]string{},
		in.ChatName,
		in.Background,
		true,
	)
	if err != nil {
		log.Println("[ws] failed to create room:", err)
		return
	}

	h.hub.AddToRoom(room.ID, conn)

	out := ws.OutgoingCreateRoomData{
		RoomId:     room.ID,
		CreatedBy:  room.CreatorID,
		ChatName:   room.RoomName,
		UserId:     room.MemberIDs,
		Background: room.BackgroundColor,
	}

	outEnvelope := ws.WsMessage{
		Type:   ws.TypeCreateRoom,
		Status: "",
		Data:   ws.MustMarshal(out),
	}

	h.hub.BroadcastToAll(ws.MustMarshal(outEnvelope))
}

func (h *WsHandler) handleJoinRoom(conn *ws.Connection, envelope ws.WsMessage) {
	var in ws.IncomingJoinRoomData
	if err := json.Unmarshal(envelope.Data, &in); err != nil {
		log.Println("[ws] invalid join_room data:", err)
		return
	}

	h.hub.AddToRoom(in.RoomId, conn)

	userId := h.hub.UserIDForConn(conn)

	userInfo, _ := h.hub.UserInfo(userId)

	joined := ws.RoomMemberJoinedData{
		RoomId:  in.RoomId,
		UserId:  userId,
		Name:    userInfo.Name,
		Profile: userInfo.Profile,
	}

	outEnvelope := ws.WsMessage{
		Type:   ws.TypeJoinRoom,
		Status: "",
		Data:   ws.MustMarshal(joined),
	}

	h.hub.BroadcastToRoom(in.RoomId, ws.MustMarshal(outEnvelope))
}
