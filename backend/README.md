## Way of work 101
1. Add your entity struct in **domain** (I already add all of it but you can fix!)
ex.
```go
type User struct {
    UserID     string `json:"userId"`
    Email   string `json:"email"`
    Name    string `json:"name"`
    Profile string `json:"profile"`
}
```
2. Add mongo model in **repository/mode;**. This is crucial, we will add mongo_db field name and mongo_db constraint here. (Agagin, I also already add most of it but you can fix!)
!warning: don't save domain struct in mongo
```go
type UserModel struct {
	UserID  string `bson:"user_id"`
	Name    string `bson:"name"`
	Email   string `bson:"email"`
	Profile string `bson:"profile"`
}
```

3. Implement repository layer for accessing mongoDB under **repository** folder.

4. (Optional) Implement service under **services** folder
(We can actually skip this layer and call repository in handlers directly if you are lazy but these are from legacy and i am too lazy to refactor)

5. Implement handler under **handlers** folder
6. Register your handler and route in **router** folder
7. Initialize number 3-5 in main.go 
8. Add handlers to router like what i did in main.go and router.go