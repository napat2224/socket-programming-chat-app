package domain

type ProfileType int

const (
	Profile1 ProfileType = 1
	Profile2 ProfileType = 2
	Profile3 ProfileType = 3
	Profile4 ProfileType = 4
)

func (p ProfileType) IsValid() bool {
	return p >= Profile1 && p <= Profile4
}

type User struct {
	UserID  string      `json:"userId"`
	Email   string      `json:"email"`
	Name    string      `json:"name"`
	Profile ProfileType `json:"profile"`
}
