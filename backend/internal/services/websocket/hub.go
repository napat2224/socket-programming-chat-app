package websocket

import (
	"log"
	"sync"
)

type Hub struct {
	mu    sync.RWMutex
	users map[string]map[*Connection]struct{}
	rooms map[string]map[*Connection]struct{}
}

func NewHub() *Hub {
	return &Hub{
		users: make(map[string]map[*Connection]struct{}),
		rooms: make(map[string]map[*Connection]struct{}),
	}
}

func (h *Hub) AddUser(userID string, conn *Connection) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.users[userID]; !ok {
		h.users[userID] = make(map[*Connection]struct{})
	}
	h.users[userID][conn] = struct{}{}
}

func (h *Hub) AddToRoom(roomID string, conn *Connection) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[*Connection]struct{})
	}
	h.rooms[roomID][conn] = struct{}{}
}

func (h *Hub) Remove(conn *Connection) {
	h.mu.Lock()
	defer h.mu.Unlock()

	for uid, conns := range h.users {
		if _, ok := conns[conn]; ok {
			delete(conns, conn)
			if len(conns) == 0 {
				delete(h.users, uid)
			}
		}
	}
	for rid, conns := range h.rooms {
		if _, ok := conns[conn]; ok {
			delete(conns, conn)
			if len(conns) == 0 {
				delete(h.rooms, rid)
			}
		}
	}
}

func (h *Hub) SendToUser(userID string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	conns, ok := h.users[userID]
	if !ok {
		return
	}

	for c := range conns {
		_ = c.Send(payload)
	}
}

func (h *Hub) BroadcastToRoom(roomID string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	conns, ok := h.rooms[roomID]
	if !ok || len(conns) == 0 {
		log.Printf("[hub] no active connections in room %s", roomID)
		return
	}

	log.Printf("[hub] broadcasting to room %s (%d connections)", roomID, len(conns))

	for c := range conns {
		if err := c.Send(payload); err != nil {
			log.Printf("[hub] failed to send to connection in room %s: %v", roomID, err)
		} else {
			log.Printf("[hub] sent to connection %p in room %s: %s", c, roomID, string(payload))
		}
	}
}
