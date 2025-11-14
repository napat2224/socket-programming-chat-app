package db

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// NewMongoClient connects to MongoDB using a URI string only.
func NewMongoClient(uri string) (*mongo.Client, error) {
	if uri == "" {
		return nil, fmt.Errorf("mongodb URI is required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, readpref.Primary()); err != nil {
		return nil, err
	}

	log.Printf("Successfully connected to MongoDB at %s", uri)
	return client, nil
}

// GetDatabase returns a *mongo.Database using a client and dbName
func GetDatabase(client *mongo.Client, dbName string) (*mongo.Database, error) {
	if dbName == "" {
		return nil, fmt.Errorf("mongodb database name is required")
	}
	return client.Database(dbName), nil
}
