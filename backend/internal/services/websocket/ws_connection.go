package websocket

import (
	"log"

	"github.com/gofiber/websocket/v2"
)

type Connection struct {
	ws *websocket.Conn
}

func NewConnection(c *websocket.Conn) *Connection {
	return &Connection{ws: c}
}

func (c *Connection) Read() ([]byte, error) {
	_, msg, err := c.ws.ReadMessage()
	return msg, err
}

func (c *Connection) Send(b []byte) error {
	return c.ws.WriteMessage(websocket.TextMessage, b)
}

func (c *Connection) Close() {
	if err := c.ws.Close(); err != nil {
		log.Println("ws close err:", err)
	}
}