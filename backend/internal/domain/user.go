package domain

type User struct {
    UserID     string `json:"userId"`
    Email   string `json:"email"`
    Name    string `json:"name"`
    Profile string `json:"profile"`
}
