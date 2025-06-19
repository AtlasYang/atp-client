package tool

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"reflect"
	"time"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
	validator "github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ToolService interface {
	ReadToolsByPermissionLevel(rctx context.Context, permissionLevel toolrouter.ToolClientPermissionLevel) ([]*toolrouter.ReadToolDTO, error)
	ReadToolByID(rctx context.Context, id int) (*toolrouter.ReadToolDTO, error)
	ReadToolByUUID(rctx context.Context, uuid uuid.UUID) (*toolrouter.ReadToolDTO, error)
	ReadToolRequestByID(rctx context.Context, id int) (*toolrouter.ReadToolRequestDTOAlt, error)
	ReadAllToolRequests(rctx context.Context) ([]*toolrouter.ReadToolRequestDTOAlt, error)
	ExecuteTool(rctx context.Context, toolID int, request []toolrouter.ToolInteractionElement) (*toolrouter.ToolExecutionResponseDTO, error)

	ReadAllTools(rctx context.Context) ([]*Tool, error)
	ReadTool(rctx context.Context, id uuid.UUID) (*Tool, error)
	CreateTool(rctx context.Context, dto *CreateToolDTO) error
	DeleteTool(rctx context.Context, id uuid.UUID) error
	ReadAllToolMessages(rctx context.Context, sessionID uuid.UUID) ([]*ToolMessage, error)
	CreateToolMessage(rctx context.Context, dto *CreateToolMessageDTO) error
	SendRequestToToolServer(rctx context.Context, id uuid.UUID, requestBody []toolrouter.ToolInteractionElement) (string, error)
}

type toolService struct {
	ctx               context.Context
	db                *pgxpool.Pool
	toolRouterService toolrouter.ToolRouterService
}

func NewToolService(c context.Context, db *pgxpool.Pool) ToolService {
	toolRouterService := toolrouter.NewToolRouterService(c)
	return &toolService{ctx: c, db: db, toolRouterService: toolRouterService}
}

func (s *toolService) ReadToolsByPermissionLevel(rctx context.Context, permissionLevel toolrouter.ToolClientPermissionLevel) ([]*toolrouter.ReadToolDTO, error) {
	tools, err := s.toolRouterService.ReadToolsByPermissionLevel(permissionLevel)
	if err != nil {
		return nil, err
	}
	return tools, nil
}

func (s *toolService) ReadToolByID(rctx context.Context, id int) (*toolrouter.ReadToolDTO, error) {
	tool, err := s.toolRouterService.ReadToolByID(id)
	if err != nil {
		return nil, err
	}
	return tool, nil
}

func (s *toolService) ReadToolByUUID(rctx context.Context, uuid uuid.UUID) (*toolrouter.ReadToolDTO, error) {
	tool, err := s.toolRouterService.ReadToolByUUID(uuid)
	if err != nil {
		return nil, err
	}
	return tool, nil
}

func (s *toolService) ReadToolRequestByID(rctx context.Context, id int) (*toolrouter.ReadToolRequestDTOAlt, error) {
	toolRequest, err := s.toolRouterService.ReadToolRequestByID(id)
	if err != nil {
		return nil, err
	}
	return toolrouter.ReadToolRequestDTOToReadToolRequestDTOAlt(toolRequest), nil
}

func (s *toolService) ReadAllToolRequests(rctx context.Context) ([]*toolrouter.ReadToolRequestDTOAlt, error) {
	toolRequests, err := s.toolRouterService.ReadAllToolRequests()
	if err != nil {
		return nil, err
	}
	toolRequestsAlt := make([]*toolrouter.ReadToolRequestDTOAlt, 0)
	for _, toolRequest := range toolRequests {
		toolRequestsAlt = append(toolRequestsAlt, toolrouter.ReadToolRequestDTOToReadToolRequestDTOAlt(toolRequest))
	}
	return toolRequestsAlt, nil
}

func (s *toolService) ExecuteTool(rctx context.Context, toolID int, request []toolrouter.ToolInteractionElement) (*toolrouter.ToolExecutionResponseDTO, error) {
	response, err := s.toolRouterService.ExecuteTool(toolID, request)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func (s *toolService) ReadAllTools(rctx context.Context) ([]*Tool, error) {
	rows, err := s.db.Query(rctx, "SELECT id, name, version, description, provider_interface, created_at FROM tools")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var Tools []*Tool
	for rows.Next() {
		var tool Tool
		var providerInterfaceStr string
		if err := rows.Scan(
			&tool.ID,
			&tool.Name,
			&tool.Version,
			&tool.Description,
			&providerInterfaceStr,
			&tool.CreatedAt,
		); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(providerInterfaceStr), &tool.ProviderInterface); err != nil {
			continue
		}
		Tools = append(Tools, &tool)
	}

	if len(Tools) == 0 {
		return []*Tool{}, nil
	}

	return Tools, nil
}

func (s *toolService) ReadTool(rctx context.Context, id uuid.UUID) (*Tool, error) {
	var Tool Tool
	var providerInterfaceStr string

	err := s.db.QueryRow(rctx, "SELECT id, name, version, description, provider_interface, created_at FROM tools WHERE id = $1", id).
		Scan(&Tool.ID, &Tool.Name, &Tool.Version, &Tool.Description, &providerInterfaceStr, &Tool.CreatedAt)
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(providerInterfaceStr), &Tool.ProviderInterface); err != nil {
		return nil, err
	}
	return &Tool, nil
}

func (s *toolService) CreateTool(rctx context.Context, dto *CreateToolDTO) error {
	var providerInterfaceStr []byte

	validate := validator.New()
	if err := validate.Struct(dto); err != nil {
		return fmt.Errorf("tool validation failed: %w", err)
	}

	if err := validate.Struct(dto.ProviderInterface); err != nil {
		return fmt.Errorf("provider interface validation failed: %w", err)
	}

	providerInterfaceStr, err := json.Marshal(dto.ProviderInterface)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(rctx, `
        INSERT INTO tools (id, name, version, description, provider_interface, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, dto.ID, dto.Name, dto.Version, dto.Description, string(providerInterfaceStr), time.Now())
	return err
}

func (s *toolService) DeleteTool(rctx context.Context, id uuid.UUID) error {
	_, err := s.db.Exec(rctx, "DELETE FROM tools WHERE id = $1", id)
	return err
}

func (s *toolService) ReadAllToolMessages(rctx context.Context, sessionID uuid.UUID) ([]*ToolMessage, error) {
	var ToolMessages []*ToolMessage
	rows, err := s.db.Query(rctx, "SELECT id, session_id, tool_id, role, data, created_at FROM tool_messages WHERE session_id = $1", sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var ToolMessage ToolMessage
		var dataStr string
		if err := rows.Scan(
			&ToolMessage.ID,
			&ToolMessage.SessionID,
			&ToolMessage.ToolID,
			&ToolMessage.Role,
			&dataStr,
			&ToolMessage.CreatedAt,
		); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(dataStr), &ToolMessage.Data); err != nil {
			continue
		}
		ToolMessages = append(ToolMessages, &ToolMessage)
	}

	if len(ToolMessages) == 0 {
		return []*ToolMessage{}, nil
	}

	return ToolMessages, nil
}

func (s *toolService) CreateToolMessage(rctx context.Context, dto *CreateToolMessageDTO) error {
	var dataStr []byte
	dataStr, err := json.Marshal(dto.Data)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(rctx, `
        INSERT INTO tool_messages (session_id, tool_id, role, data, created_at)
        VALUES ($1, $2, $3, $4, $5)
    `, dto.SessionID, dto.ToolID, dto.Role, string(dataStr), time.Now())
	return err
}

func (s *toolService) SendRequestToToolServer(rctx context.Context, toolID uuid.UUID, requestBody []toolrouter.ToolInteractionElement) (string, error) {
	//modify user RequestBody [{interface_id: "number1", content: "10"}, {interface_id: "number2", content: "20"}, {interface_id: "operation", content: "+"}]
	tool, err := s.ReadTool(rctx, toolID)
	if err != nil {
		return "", fmt.Errorf("failed to read tool: %w", err)
	}
	if tool == nil {
		return "", fmt.Errorf("tool not found")
	}

	requestBodyMap := make(map[string]any)
	for _, field := range tool.ProviderInterface.RequestInterface {
		content, err := BodyRequestHelper(requestBody, field.Key)
		if err != nil {
			return "", fmt.Errorf("failed to get value for field %s", field.Key)
		}

		if field.Required && content == nil {
			return "", fmt.Errorf("missing required field: %s", field.Key)
		}

		switch field.ValueType {
		case "string":
			if _, ok := content.(string); !ok {
				return "", fmt.Errorf("field %s must be a string", field.Key)
			}
		case "number":
			kind := reflect.TypeOf(content).Kind()
			if !(kind == reflect.Float64 || kind == reflect.Int || kind == reflect.Int64) {
				return "", fmt.Errorf("field %s must be a number", field.Key)
			}
		case "boolean":
			if _, ok := content.(bool); !ok {
				return "", fmt.Errorf("field %s must be a boolean", field.Key)
			}
		default:
			return "", fmt.Errorf("unsupported value type: %s", field.ValueType)
		}

		requestBodyMap[field.Key] = content
	}

	requestBodyJSON, err := json.Marshal(requestBodyMap)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request body: %w", err)
	}

	req, err := http.NewRequest(tool.ProviderInterface.RequestMethod, tool.ProviderInterface.URL, bytes.NewBuffer(requestBodyJSON))
	if err != nil {
		return "", fmt.Errorf("failed to create HTTP request: %w", err)
	}

	req.Header.Set("Content-Type", tool.ProviderInterface.RequestContentType)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("received non-2xx status code: %d, response: %s", resp.StatusCode, string(respBody))
	}

	return string(respBody), nil
}
