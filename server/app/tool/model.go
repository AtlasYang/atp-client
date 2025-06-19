package tool

import (
	"time"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
	"github.com/google/uuid"
)

const (
	ToolRoleUser      = "user"
	ToolRoleAssistant = "assistant"
	ToolRoleSystem    = "system"
)

type Tool struct {
	ID                uuid.UUID                    `json:"id"`
	Name              string                       `json:"name"`
	Version           string                       `json:"version"`
	Description       string                       `json:"description"`
	ProviderInterface toolrouter.ProviderInterface `json:"provider_interface"`
	CreatedAt         time.Time                    `json:"created_at"`
}

type CreateToolDTO struct {
	ID                uuid.UUID                    `json:"id" validate:"required"`
	Name              string                       `json:"name" validate:"required"`
	Version           string                       `json:"version"`
	Description       string                       `json:"description" validate:"required"`
	ProviderInterface toolrouter.ProviderInterface `json:"provider_interface" validate:"required"`
}

type ToolMessage struct {
	ID        uuid.UUID      `json:"id"`
	SessionID uuid.UUID      `json:"session_id"`
	ToolID    uuid.UUID      `json:"tool_id"`
	Role      string         `json:"role"`
	Data      map[string]any `json:"data"`
	CreatedAt time.Time      `json:"created_at"`
}

type CreateToolMessageDTO struct {
	SessionID uuid.UUID      `json:"session_id"`
	ToolID    uuid.UUID      `json:"tool_id"`
	Role      string         `json:"role"`
	Data      map[string]any `json:"data"`
}
