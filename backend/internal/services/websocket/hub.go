package websocket

import (
	"log"
	"sync"
)

type Hub struct {
	mu       sync.RWMutex
	users    map[string]map[*Connection]struct{}
	rooms    map[string]map[*Connection]struct{}
	connUser map[*Connection]string
	userInfo map[string]UserPresenceData
}

func NewHub() *Hub {
	return &Hub{
		users:    make(map[string]map[*Connection]struct{}),
		rooms:    make(map[string]map[*Connection]struct{}),
		connUser: make(map[*Connection]string),
		userInfo: make(map[string]UserPresenceData),
	}
}

func (h *Hub) AddUser(info UserPresenceData, conn *Connection) {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns := h.users[info.UserId]
	if conns == nil {
		conns = make(map[*Connection]struct{})
		h.users[info.UserId] = conns
	}
	conns[conn] = struct{}{}
	h.connUser[conn] = info.UserId
	h.userInfo[info.UserId] = info

	log.Printf("[hub] user %s connected (conns: %d)", info.UserId, len(conns))
}

func (h *Hub) Remove(conn *Connection) (userId string, last bool) {
	h.mu.Lock()
	defer h.mu.Unlock()

	userId, ok := h.connUser[conn]
	if !ok {
		return "", false
	}
	delete(h.connUser, conn)

	if conns, ok := h.users[userId]; ok {
		delete(conns, conn)
		if len(conns) == 0 {
			delete(h.users, userId)
			delete(h.userInfo, userId)
			last = true
			log.Printf("[hub] user %s has no more connections", userId)
		} else {
			log.Printf("[hub] user %s still has %d connections", userId, len(conns))
		}
	}

	for roomId, conns := range h.rooms {
		if _, ok := conns[conn]; ok {
			delete(conns, conn)
			if len(conns) == 0 {
				delete(h.rooms, roomId)
				log.Printf("[hub] room %s is now empty", roomId)
			}
		}
	}

	return userId, last
}

func (h *Hub) OnlineUsers() []UserPresenceData {
	h.mu.RLock()
	defer h.mu.RUnlock()

	result := make([]UserPresenceData, 0, len(h.userInfo))
	for _, u := range h.userInfo {
		result = append(result, u)
	}
	return result
}

func (h *Hub) UserIDForConn(conn *Connection) string {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.connUser[conn]
}

func (h *Hub) UserInfo(userId string) (UserPresenceData, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	u, ok := h.userInfo[userId]
	return u, ok
}

func (h *Hub) AddToRoom(roomId string, conn *Connection) {
	h.mu.Lock()
	defer h.mu.Unlock()

	conns := h.rooms[roomId]
	if conns == nil {
		conns = make(map[*Connection]struct{})
		h.rooms[roomId] = conns
	}
	conns[conn] = struct{}{}

	log.Printf("[hub] conn %p joined room %s (conns: %d)", conn, roomId, len(conns))
}

func (h *Hub) BroadcastToRoom(roomId string, payload []byte) {
	h.mu.RLock()
	conns, ok := h.rooms[roomId]
	h.mu.RUnlock()

	if !ok || len(conns) == 0 {
		log.Printf("[hub] no active connections in room %s", roomId)
		return
	}

	for c := range conns {
		if err := c.Send(payload); err != nil {
			log.Printf("[hub] failed to send to room %s: %v", roomId, err)
		}
	}
}

func (h *Hub) BroadcastToAll(payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, conns := range h.users {
		for c := range conns {
			if err := c.Send(payload); err != nil {
				log.Printf("[hub] failed to broadcast: %v", err)
			}
		}
	}
}

func (h *Hub) BroadcastToAllExcept(except *Connection, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, conns := range h.users {
		for c := range conns {
			if c == except {
				continue
			}
			if err := c.Send(payload); err != nil {
				log.Printf("[hub] failed to broadcast: %v", err)
			}
		}
	}
}
