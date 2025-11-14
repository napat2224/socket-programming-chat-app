package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"github.com/napat2224/socket-programming-chat-app/internal/handlers"
	"github.com/napat2224/socket-programming-chat-app/internal/middleware"
	"github.com/napat2224/socket-programming-chat-app/internal/repository"
	"github.com/napat2224/socket-programming-chat-app/internal/router"
	"github.com/napat2224/socket-programming-chat-app/internal/services"
	"github.com/napat2224/socket-programming-chat-app/internal/utils/config"
	"github.com/napat2224/socket-programming-chat-app/internal/utils/db"
	"go.mongodb.org/mongo-driver/mongo"
)

type App struct {
	app      *fiber.App
	port     string
	database *mongo.Database
}

func NewApp(cfg *config.Config) (*App, error) {
	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: customErrorHandler,
	})

	// Middleware
	app.Use(cors.New())

	// Connect to mongoDB
	mongoURI := cfg.MongoURI
	dbName := cfg.MongoDBName

	client, err := db.NewMongoClient(mongoURI)
	if err != nil {
		log.Fatalf("failed to connect to mongo: %v", err)
	}

	database, err := db.GetDatabase(client, dbName)
	if err != nil {
		log.Fatalf("failed to get database: %v", err)
	}

	log.Printf("Using database: %s", database.Name())

	return &App{
		app:      app,
		port:     cfg.Port,
		database: database,
	}, nil
}

func (a *App) Start() error {
	log.Printf("Starting API Gateway on port %s", a.port)
	return a.app.Listen(":" + a.port)
}

func (a *App) Shutdown() error {
	log.Println("Shutting down API Gateway...")
	return a.app.Shutdown()
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Internal Server Error"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error": message,
	})
}

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found or unable to load it. Continuing...")
	}
	cfg := config.LoadConfig()

	// Create API Gateway
	app, err := NewApp(cfg)
	if err != nil {
		log.Fatalf("Failed to create Chat App: %v", err)
	}

	// Initialize repository
	userRepo := repository.NewUserRepository(app.database, cfg.MongoDBName)

	// Initialize service here
	authClient := services.InitFirebase(context.Background(), cfg.FirebaseAccountKeyFile)
	authService := services.NewFirebaseAuth(authClient)
	userService := services.NewUserService(authService, userRepo)
	userHandler := handlers.NewUserHandler(userService)

	chat := services.NewChatService()
	chatHandler := handlers.NewChatHandler(chat)
	authMid := middleware.NewAuthMiddleware(authService)

	router.SetupRoutes(
		app.app,
		authMid,
		userHandler,
		chatHandler,
	)

	// Graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		log.Println("Received shutdown signal")
		if err := app.Shutdown(); err != nil {
			log.Printf("Error during shutdown: %v", err)
		}
		os.Exit(0)
	}()

	// Start server
	if err := app.Start(); err != nil {
		log.Fatalf("Failed to start API Gateway: %v", err)
	}
}
