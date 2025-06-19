package toolrouter

import (
	"time"

	"github.com/google/uuid"
)

type ToolClientPermissionLevel int
type ToolRequestStatus string
type ToolExecutionStatus string

const (
	ToolRequestStatusPending ToolRequestStatus = "pending"
	ToolRequestStatusSuccess ToolRequestStatus = "success"
	ToolRequestStatusFailed  ToolRequestStatus = "failed"
)

const (
	ToolExecutionStatusSuccess      ToolExecutionStatus = "success"
	ToolExecutionStatusUnauthorized ToolExecutionStatus = "unauthorized"
	ToolExecutionStatusFailed       ToolExecutionStatus = "failed"
)

const (
	ToolClientPermissionLevelNone  ToolClientPermissionLevel = 0
	ToolClientPermissionLevelRead  ToolClientPermissionLevel = 1
	ToolClientPermissionLevelWrite ToolClientPermissionLevel = 2
)

type SelectToolRequestDTO struct {
	UserPrompt string `json:"user_prompt"`
}

type Client struct {
	ID               int       `json:"id"`
	Name             string    `json:"name"`
	ClientIdentifier string    `json:"client_identifier"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
}

type ReadToolDTO struct {
	ID                int               `json:"id"`
	UUID              uuid.UUID         `json:"uuid"`
	Name              string            `json:"name"`
	Version           string            `json:"version"`
	Description       string            `json:"description"`
	ProviderInterface ProviderInterface `json:"provider_interface"`
}

type SelectToolResponseDTO struct {
	PermissionLevel ToolClientPermissionLevel `json:"permission_level"`
	Tool            *ReadToolDTO              `json:"tool"`
	Message         string                    `json:"message"`
}

type ToolRequestData struct {
	RequestIdentifier string         `json:"request_identifier"`
	Payload           map[string]any `json:"payload"`
}

type ToolRequestResponseData struct {
	ResponseIdentifier string         `json:"response_identifier"`
	CheckStatusImpl    map[string]any `json:"check_status_impl"`
	Payload            map[string]any `json:"payload"`
}

type ReadToolRequestDTO struct {
	ID           int                     `json:"id" example:"1"`
	ToolID       int                     `json:"tool_id" example:"1"`
	ToolName     string                  `json:"tool_name" example:"Tool Name"`
	ClientID     int                     `json:"client_id" example:"1"`
	RequestData  ToolRequestData         `json:"request_data"`
	ResponseData ToolRequestResponseData `json:"response_data"`
	Status       ToolRequestStatus       `json:"status" example:"pending"`
	CreatedAt    time.Time               `json:"created_at" example:"2021-01-01T00:00:00Z"`
	UpdatedAt    time.Time               `json:"updated_at" example:"2021-01-01T00:00:00Z"`
}

type ReadToolRequestDTOAlt struct {
	ID           int                      `json:"id"`
	ToolID       int                      `json:"tool_id"`
	ToolName     string                   `json:"tool_name"`
	Status       ToolRequestStatus        `json:"status"`
	CreatedAt    time.Time                `json:"created_at"`
	UpdatedAt    time.Time                `json:"updated_at"`
	RequestData  []ToolInteractionElement `json:"request_data"`
	ResponseData []ToolInteractionElement `json:"response_data"`
}

type ToolExecutionResponseDTO struct {
	Status        ToolExecutionStatus `json:"status"`
	Message       string              `json:"message"`
	ToolRequestID int                 `json:"tool_request_id"`
}

type ProviderInterface struct {
	URL                 string             `json:"url" valdate:"required,url"`
	AuthStrategy        string             `json:"authStrategy" validate:"required"`
	RequestMethod       string             `json:"requestMethod" validate:"required,oneof=GET POST PUT DELETE"`
	RequestContentType  string             `json:"requestContentType" validate:"required"`
	ResponseContentType string             `json:"responseContentType" validate:"required"`
	RequestInterface    []InterfaceElement `json:"requestInterface" validate:"required,min=1,dive"`
	ResponseInterface   []InterfaceElement `json:"responseInterface" validate:"required,min=1,dive"`
}

type InterfaceElement struct {
	ID                string            `json:"id" validate:"required"`
	Type              string            `json:"type" validate:"required,oneof=body query header"`
	Required          bool              `json:"required"`
	Key               string            `json:"key" validate:"required"`
	ValueType         string            `json:"valueType" validate:"required,oneof=string number boolean"`
	BindedElementType BindedElementType `json:"bindedElementType" validate:"required"`
}

type BindedElementType struct {
	Label           string `json:"label" validate:"required"`
	HTMLElementType string `json:"htmlElementType" validate:"required"`
	ValueType       string `json:"valueType" validate:"required,oneof=string number boolean"`
}

type ToolInteractionElement struct {
	Interface_id string `json:"interface_id" validate:"required"`
	Content      any    `json:"content" validate:"required"`
}

func MapToInteractionElement(data map[string]any) []ToolInteractionElement {
	interactionElements := make([]ToolInteractionElement, 0)
	for key, value := range data {
		interactionElements = append(interactionElements, ToolInteractionElement{
			Interface_id: key,
			Content:      value,
		})
	}
	return interactionElements
}

func ReadToolRequestDTOToReadToolRequestDTOAlt(toolRequestDTO *ReadToolRequestDTO) *ReadToolRequestDTOAlt {
	return &ReadToolRequestDTOAlt{
		ID:           toolRequestDTO.ID,
		ToolID:       toolRequestDTO.ToolID,
		ToolName:     toolRequestDTO.ToolName,
		RequestData:  MapToInteractionElement(toolRequestDTO.RequestData.Payload),
		ResponseData: MapToInteractionElement(toolRequestDTO.ResponseData.Payload),
		Status:       toolRequestDTO.Status,
		CreatedAt:    toolRequestDTO.CreatedAt,
		UpdatedAt:    toolRequestDTO.UpdatedAt,
	}
}
