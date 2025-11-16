package services

import (
	"context"
	"encoding/base64"
	"log"
	"os"
	"strconv"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

type FirebaseAuth struct {
	client *auth.Client
}

type Claims struct {
	UserID  string
	Name    string
	Email   string
	Profile int
}

func NewFirebaseAuth(client *auth.Client) *FirebaseAuth {
	return &FirebaseAuth{client: client}
}

func InitFirebase(ctx context.Context, base64ServiceAccountEnv string, filePath string) *auth.Client {
	var opt option.ClientOption

	switch {
	case base64ServiceAccountEnv != "":
		decoded, err := base64.StdEncoding.DecodeString(base64ServiceAccountEnv)
		if err != nil {
			log.Fatalf("failed to decode firebase service account: %v", err)
		}
		opt = option.WithCredentialsJSON(decoded)

	case filePath != "":
		// Less safe, but useful for local dev
		if _, err := os.Stat(filePath); err != nil {
			log.Fatalf("firebase credential file not found at %s: %v", filePath, err)
		}
		opt = option.WithCredentialsFile(filePath)

	default:
		log.Fatal("no Firebase credentials provided: both Base64 env and file path are empty")
	}

	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing firebase app: %v", err)
	}

	firebaseAuthClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("failed to initialize firebase Auth client: %v", err)
	}

	return firebaseAuthClient
}

func (f *FirebaseAuth) VerifyIDToken(ctx context.Context, token string) (*Claims, error) {
	log.Println("Verifying ID token", token)
	t, err := f.client.VerifyIDToken(ctx, token)
	if err != nil {
		log.Println("Error verifying ID token:", err)
		return nil, err
	}

	claims := &Claims{
		UserID: t.UID,
	}

	// extract name (Firebase standard claim)
	if name, ok := t.Claims["name"].(string); ok {
		claims.Name = name
	}

	// extract email (Firebase standard claim)
	if email, ok := t.Claims["email"].(string); ok {
		claims.Email = email
	}

	// extract custom "profile" claim if set in Firebase
	if profile, ok := t.Claims["profile"].(string); ok {
		profileInt, err := strconv.Atoi(profile)
		if err == nil {
			claims.Profile = profileInt
		}
		claims.Profile = profileInt
	}

	return claims, nil
}

func (f *FirebaseAuth) SetCustomUserClaims(ctx context.Context, uid string, customClaims map[string]interface{}) error {
	return f.client.SetCustomUserClaims(ctx, uid, customClaims)
}
