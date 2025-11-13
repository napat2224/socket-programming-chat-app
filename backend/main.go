package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}



func reader(conn *websocket.Conn) {
	for {
		// read in a message
        messageType, p, err := conn.ReadMessage()
        if err != nil {
			log.Println(err)
            return
        }
		// print out that message for clarity
        fmt.Println(string(p))
		
        if err := conn.WriteMessage(messageType, p); err != nil {
			log.Println(err)
            return
        }
		
    }
}

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Home Page")
}
func wsEndpoint(w http.ResponseWriter, r *http.Request) {
    upgrader.CheckOrigin = func(r *http.Request) bool { return true }

    // upgrade this connection to a WebSocket
    // connection
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Println(err)
    }
    // helpful log statement to show connections
    log.Println("Client Connected")

    reader(ws)
}

func setupRoutes() {
    http.HandleFunc("/", homePage)
    http.HandleFunc("/ws", wsEndpoint)
}

func main() {
    fmt.Println("Hello World")
    setupRoutes()
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

