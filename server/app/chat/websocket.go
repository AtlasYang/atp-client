package chat

import (
	"context"
	"log"
	"net/http"
	"sync"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5/pgxpool"
)

/*
WebSocketHandler is a handler function for Gin routes that upgrades the HTTP connection to a WebSocket connection.
It reads messages from the client and broadcast them to all other clients in the same session.

HandleMessages is a function that reads messages from the broadcast channel and sends them to all clients in the session.
If the message is from the user, it generates an AI response and sends it to all clients.
HandleMessages is called as a goroutine in the main function and runs in the context of the main gin server.

WebSocketHandler and HandleMessages use a shared map called sessionClients to manage WebSocket clients in the same session.
*/

// Websocket Upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var sessionClients = make(map[string]map[*websocket.Conn]bool) // Dynamic map of sessionID to clients
var broadcast = make(chan ChatMessage)                         // Sync channel for broadcasting messages
var mutex = sync.Mutex{}                                       // Mutex for sessionClients

// Replace with AgentResponse from aigendrug ai service
func generateAIResponse(message string) (string, *toolrouter.ReadToolDTO) {
	trs := toolrouter.NewToolRouterService(context.Background())
	res, err := trs.SelectTool(message)
	if err != nil {
		log.Println("Failed to select tool:", err)
		return "", nil
	}

	return res.Message, res.Tool
}

func WebSocketHandler(c *gin.Context, db *pgxpool.Pool) {
	sessionID := c.Query("sessionID")
	if sessionID == "" {
		c.JSON(400, gin.H{"error": "sessionID is required"})
		return
	}

	// Upgrade the HTTP connection to a WebSocket connection
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	// Lock mutex of sessionClients and add the new client.
	mutex.Lock()
	if sessionClients[sessionID] == nil {
		sessionClients[sessionID] = make(map[*websocket.Conn]bool)
	}
	sessionClients[sessionID][conn] = true
	mutex.Unlock()

	// Read messages from the client and broadcast them to all other clients
	for {
		var msg CreateChatMessageDTO
		err := conn.ReadJSON(&msg)
		// If there is an error, remove the client from the sessionClients map and break the loop
		if err != nil {
			log.Println("Read Error:", err)
			mutex.Lock()
			delete(sessionClients[sessionID], conn)
			mutex.Unlock()
			break
		}

		// Save the message to the database and broadcast it to all clients
		err = saveChatMessageToDB(db, &msg)
		if err != nil {
			log.Println("DB Save Error:", err)
			continue
		}

		broadcast <- ChatMessage{
			SessionID:    msg.SessionID,
			Role:         msg.Role,
			Message:      msg.Message,
			MessageType:  msg.MessageType,
			LinkedToolID: msg.LinkedToolID,
		}
	}
}

func saveChatMessageToDB(db *pgxpool.Pool, msg *CreateChatMessageDTO) error {
	newUUID := uuid.New()

	_, err := db.Exec(context.Background(), "INSERT INTO chat_messages (id, session_id, role, message, created_at, message_type, linked_tool_id) VALUES ($1, $2, $3, $4, now(), $5, $6)",
		newUUID, msg.SessionID, msg.Role, msg.Message, msg.MessageType, msg.LinkedToolID)
	if err != nil {
		return err
	}

	return nil
}

// Read messages from the broadcast channel and send them to all clients in the session
func HandleMessages(db *pgxpool.Pool) {
	for {
		msg := <-broadcast

		// Lock the mutex and check if the session exists
		mutex.Lock()
		clients, exists := sessionClients[msg.SessionID.String()]
		if !exists {
			mutex.Unlock()
			continue
		}

		// For each client in the session, send the message
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Println("Send Error:", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()

		// If the message is from the user, generate an AI response and send it to all clients
		if msg.Role == ChatRoleUser {
			aiResponse, selectedTool := generateAIResponse(msg.Message)

			if selectedTool == nil {
				continue
			}

			aiMsg := ChatMessage{
				SessionID:    msg.SessionID,
				Role:         ChatRoleAssistant,
				Message:      aiResponse,
				MessageType:  msg.MessageType,
				LinkedToolID: selectedTool.UUID,
			}
			systemMsg := ChatMessage{
				SessionID:    msg.SessionID,
				Role:         ChatRoleSystem,
				Message:      selectedTool.Name,
				MessageType:  ChatMessageTypeToolSelection,
				LinkedToolID: selectedTool.UUID,
			}

			err := saveChatMessageToDB(db, &CreateChatMessageDTO{
				SessionID:    aiMsg.SessionID,
				Role:         aiMsg.Role,
				Message:      aiMsg.Message,
				MessageType:  aiMsg.MessageType,
				LinkedToolID: aiMsg.LinkedToolID,
			})
			if err != nil {
				log.Println("Failed to save AI response:", err)
				continue
			}

			err = saveChatMessageToDB(db, &CreateChatMessageDTO{
				SessionID:    systemMsg.SessionID,
				Role:         systemMsg.Role,
				Message:      systemMsg.Message,
				MessageType:  systemMsg.MessageType,
				LinkedToolID: systemMsg.LinkedToolID,
			})
			if err != nil {
				log.Println("Failed to save tool ID:", err)
				continue
			}

			// Lock the mutex and send the AI response and finish message to all clients
			mutex.Lock()
			for client := range clients {
				err := client.WriteJSON(aiMsg)
				if err != nil {
					log.Println("Send Error:", err)
					client.Close()
					delete(clients, client)
				}

				err = client.WriteJSON(systemMsg)
				if err != nil {
					log.Println("Send Error:", err)
					client.Close()
					delete(clients, client)
				}
			}
			mutex.Unlock()
		}
	}
}
