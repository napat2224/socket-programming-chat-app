package services

import (
	"context"
	"log"

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

func InitFirebase(ctx context.Context, firebaseAccountKeyFile string) *auth.Client {
	opt := option.WithCredentialsFile(firebaseAccountKeyFile)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	firebaseAuthClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("Failed to get firebaseAuthClient: %v", err)
	}
	return firebaseAuthClient
}

func (f *FirebaseAuth) VerifyIDToken(ctx context.Context, token string) (*Claims, error) {
	t, err := f.client.VerifyIDToken(ctx, token)
	if err != nil {
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
	if profile, ok := t.Claims["profile"].(int); ok {
		claims.Profile = profile
	}

	return claims, nil
}

func (f *FirebaseAuth) SetCustomUserClaims(ctx context.Context, uid string, customClaims map[string]interface{}) error {
	return f.client.SetCustomUserClaims(ctx, uid, customClaims)
}
