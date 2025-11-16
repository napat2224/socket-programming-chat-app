package config

import (
	"github.com/napat2224/socket-programming-chat-app/internal/utils/env"
)

// auth config
type Config struct {
	Port                   string
	MongoURI               string
	MongoDBName            string
	FirebaseAccountKeyFile string
	UserCollectionName     string
	MassageCollectionName     string
	RoomCollectionName     string
}

const (
	dbName             = "chatdb"
	messageCollectionName = "message"
	roomCollectionName = "rooms"
	userCollectionName = "users"
)

func LoadConfig() *Config {
	return &Config{
		Port:                   env.GetString("PORT", "8080"),
		MongoURI:               env.GetString("MONGO_URI", "mongodb://localhost:27017"),
		MongoDBName:            dbName,
		MassageCollectionName:  messageCollectionName,
		RoomCollectionName:     roomCollectionName,
		UserCollectionName:     userCollectionName,
		FirebaseAccountKeyFile: env.GetString("FIREBASE_KEY_PATH", "firebase-key.json"),
	}
}
