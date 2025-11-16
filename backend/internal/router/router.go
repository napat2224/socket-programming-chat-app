// internal/routes/router.go
package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/napat2224/socket-programming-chat-app/internal/handlers"
	"github.com/napat2224/socket-programming-chat-app/internal/middleware"
)

func SetupRoutes(
	app *fiber.App,
	authMiddleware *middleware.AuthMiddleware,
	userHandler *handlers.UserHandler,
	wsHandler *handlers.WsHandler,
	chatHandler *handlers.ChatHandler,
) {
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "healthy"})
	})
	app.Get(
		"/ws",
		authMiddleware.AddClaims,
		websocket.New(wsHandler.Handle),
	)
	api := app.Group("/api")

	setupUserRoutes(api, userHandler, authMiddleware)
	setupTestRouter(api, authMiddleware)
	setupChatRoutes(api, chatHandler, authMiddleware)
	// setupWebsocketRoutes(app, hub, authMiddleware)
}

func setupUserRoutes(api fiber.Router, userHandler *handlers.UserHandler, authMiddleware *middleware.AuthMiddleware) {
	// User routes
	users := api.Group("/users")
	users.Post("/register", userHandler.Register)
	users.Get("/me", authMiddleware.AddClaims, userHandler.GetMe)
}

func setupChatRoutes(api fiber.Router, chatHandler *handlers.ChatHandler, authMiddleware *middleware.AuthMiddleware) {
	// Uncomment once finishing implement chat handler

	rooms := api.Group("/rooms")
	rooms.Get("/public", chatHandler.GetPublicRooms)
	rooms.Get("/private/:targetID", authMiddleware.AddClaims, chatHandler.GetPrivateRoomByTargetID)
	// chats.Get("/:roomID/messages", r.authMiddleware.AddClaims, r.chatHandler.GetMessagesByRoomID)
	// chats.Post("/rooms", r.authMiddleware.AddClaims, r.chatHandler.CreateRoom)
	// chats.Get("/customer/rooms", r.authMiddleware.AddClaims, r.chatHandler.GetChatRoomsByCustomerID)
	// chats.Get("/prophet/rooms", r.authMiddleware.AddClaims, r.chatHandler.GetChatRoomsByProphetID)
}

func setupTestRouter(api fiber.Router, authMiddleware *middleware.AuthMiddleware) {
	api.Post("/test-auth", authMiddleware.AddClaims, func(c *fiber.Ctx) error {
		var body map[string]interface{}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "failed to parse body",
			})
		}
		return c.JSON(fiber.Map{
			"message": "middleware worked!",
			"body":    body,
		})
	})

}

// func setupWebsocketRoutes(app *fiber.App, hub *ws.Hub, authMiddleware *middleware.AuthMiddleware) {
// 	chatWsHandler := handlers.NewChatWSHandler(hub)

// 	// WebSocket middleware for /ws/chat
// 	app.Use("/ws/chat", authMiddleware.AddClaims, func(c *fiber.Ctx) error {
// 		if websocket.IsWebSocketUpgrade(c) {
// 			return c.Next()
// 		}
// 		return fiber.ErrUpgradeRequired
// 	})

// 	// WebSocket middleware for /ws/test
// 	app.Use("/ws/test", authMiddleware.AddClaims, func(c *fiber.Ctx) error {
// 		if websocket.IsWebSocketUpgrade(c) {
// 			return c.Next()
// 		}
// 		return fiber.ErrUpgradeRequired
// 	})

// 	chatWsHandler.RegisterRoutes(app)
// }
