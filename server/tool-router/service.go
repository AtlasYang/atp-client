package toolrouter

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/google/uuid"
)

type ToolRouterService interface {
	GetCurrentClient() (*Client, error)
	ReadToolsByPermissionLevel(permissionLevel ToolClientPermissionLevel) ([]*ReadToolDTO, error)
	SelectTool(prompt string) (*SelectToolResponseDTO, error)
	ReadToolByID(toolID int) (*ReadToolDTO, error)
	ReadToolByUUID(uuid uuid.UUID) (*ReadToolDTO, error)
	ReadToolRequestByID(toolRequestID int) (*ReadToolRequestDTO, error)
	ReadAllToolRequests() ([]*ReadToolRequestDTO, error)
	ExecuteTool(toolID int, request []ToolInteractionElement) (*ToolExecutionResponseDTO, error)
}

type toolRouterService struct {
	ctx        context.Context
	httpClient *http.Client
	host       string
	apiKey     string
}

func NewToolRouterService(c context.Context) ToolRouterService {
	fmt.Println("ATP_ROUTER_HOST", os.Getenv("ATP_ROUTER_HOST"))
	fmt.Println("ATP_ROUTER_API_KEY", os.Getenv("ATP_ROUTER_API_KEY"))

	return &toolRouterService{
		ctx:        c,
		httpClient: &http.Client{},
		host:       os.Getenv("ATP_ROUTER_HOST"),
		apiKey:     os.Getenv("ATP_ROUTER_API_KEY"),
	}
}

// Helper function to create and execute GET requests
func (trs *toolRouterService) doGetRequest(endpoint string) (*http.Response, error) {
	req, err := http.NewRequest("GET", trs.host+endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %s", err)
	}

	trs.setCommonHeaders(req)

	res, err := trs.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

// Helper function to create and execute POST requests
func (trs *toolRouterService) doPostRequest(endpoint string, body []byte) (*http.Response, error) {
	req, err := http.NewRequest("POST", trs.host+endpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %s", err)
	}

	trs.setCommonHeaders(req)

	res, err := trs.httpClient.Do(req)
	if err != nil {
		return nil, err
	}

	return res, nil
}

// Helper function to set common headers
func (trs *toolRouterService) setCommonHeaders(req *http.Request) {
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-API-Key", trs.apiKey)
}

// Helper function to handle response and decode JSON
func (trs *toolRouterService) handleResponse(res *http.Response, target interface{}, errorMsg string) error {
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return fmt.Errorf("%s: %s", errorMsg, res.Status)
	}

	if err := json.NewDecoder(res.Body).Decode(target); err != nil {
		return err
	}

	return nil
}

func (trs *toolRouterService) GetCurrentClient() (*Client, error) {
	res, err := trs.doGetRequest("/v1/clients/current")
	if err != nil {
		return nil, err
	}

	var client Client
	if err := trs.handleResponse(res, &client, "failed to get current client"); err != nil {
		return nil, err
	}

	return &client, nil
}

func (trs *toolRouterService) ReadToolsByPermissionLevel(permissionLevel ToolClientPermissionLevel) ([]*ReadToolDTO, error) {
	endpoint := "/v1/tools/client?permission_level=" + strconv.Itoa(int(permissionLevel))
	res, err := trs.doGetRequest(endpoint)
	if err != nil {
		return nil, err
	}

	var response []*ReadToolDTO
	if err := trs.handleResponse(res, &response, "failed to read tools by permission level"); err != nil {
		return nil, err
	}

	return response, nil
}

func (trs *toolRouterService) SelectTool(prompt string) (*SelectToolResponseDTO, error) {
	req := SelectToolRequestDTO{
		UserPrompt: prompt,
	}

	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %s", err)
	}

	res, err := trs.doPostRequest("/v1/tools/select", reqBody)
	if err != nil {
		return nil, err
	}

	var response SelectToolResponseDTO
	if err := trs.handleResponse(res, &response, "failed to select tool"); err != nil {
		return nil, err
	}

	return &response, nil
}

func (trs *toolRouterService) ReadToolByID(toolID int) (*ReadToolDTO, error) {
	endpoint := "/v1/tools/" + strconv.Itoa(toolID)
	res, err := trs.doGetRequest(endpoint)
	if err != nil {
		return nil, err
	}

	var response ReadToolDTO
	if err := trs.handleResponse(res, &response, "failed to read tool by id"); err != nil {
		return nil, err
	}

	return &response, nil
}

func (trs *toolRouterService) ReadToolByUUID(uuid uuid.UUID) (*ReadToolDTO, error) {
	endpoint := "/v1/tools/uuid/" + uuid.String()
	res, err := trs.doGetRequest(endpoint)
	if err != nil {
		fmt.Println("Error reading tool by uuid", err)
		return nil, err
	}

	var response ReadToolDTO
	if err := trs.handleResponse(res, &response, "failed to read tool by uuid"); err != nil {
		fmt.Println("Error reading tool by uuid", err)
		return nil, err
	}

	return &response, nil
}

func (trs *toolRouterService) ReadToolRequestByID(toolRequestID int) (*ReadToolRequestDTO, error) {
	endpoint := "/v1/tool-requests/" + strconv.Itoa(toolRequestID)
	res, err := trs.doGetRequest(endpoint)
	if err != nil {
		return nil, err
	}

	var response ReadToolRequestDTO
	if err := trs.handleResponse(res, &response, "failed to read tool request by id"); err != nil {
		return nil, err
	}

	return &response, nil
}

func (trs *toolRouterService) ReadAllToolRequests() ([]*ReadToolRequestDTO, error) {
	res, err := trs.doGetRequest("/v1/tool-requests/client")
	if err != nil {
		return nil, err
	}

	var response []*ReadToolRequestDTO
	if err := trs.handleResponse(res, &response, "failed to read all tool requests"); err != nil {
		return nil, err
	}

	return response, nil
}

func (trs *toolRouterService) ExecuteTool(toolID int, request []ToolInteractionElement) (*ToolExecutionResponseDTO, error) {
	requestJson := make(map[string]any)

	for _, element := range request {
		requestJson[element.Interface_id] = element.Content
	}

	requestBody, err := json.Marshal(map[string]any{
		"payload": requestJson,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %s", err)
	}

	endpoint := "/v1/tools/" + strconv.Itoa(toolID) + "/execute"
	res, err := trs.doPostRequest(endpoint, requestBody)
	if err != nil {
		return nil, err
	}

	var response ToolExecutionResponseDTO
	if err := trs.handleResponse(res, &response, "failed to execute tool"); err != nil {
		return nil, err
	}

	return &response, nil
}
