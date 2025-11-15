package config

import "github.com/napat2224/socket-programming-chat-app/internal/utils/env"

// auth config
type Config struct {
	Port                   string
	MongoURI               string
	MongoDBName            string
	FirebaseAccountKeyFile string
	ChatCollectionName     string
	RoomCollectionName     string
}

const (
	dbName             = "chatdb"
	chatCollectionName = "chats"
	roomCollectionName = "rooms"
)

func LoadConfig() *Config {
	return &Config{
		Port:                   env.GetString("PORT", "8080"),
		MongoURI:               env.GetString("MONGO_URI", "mongodb://localhost:27017"),
		MongoDBName:            dbName,
		ChatCollectionName:     chatCollectionName,
		RoomCollectionName:     roomCollectionName,
		FirebaseAccountKeyFile: env.GetString("FIREBASE_KEY_PATH", "firebase-key.json"),
	}
}
