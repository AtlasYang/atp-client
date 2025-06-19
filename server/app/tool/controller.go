package tool

import (
	"net/http"
	"strconv"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ToolController struct {
	toolService ToolService
}

func NewToolController(toolService ToolService) *ToolController {
	return &ToolController{toolService: toolService}
}

func (sc *ToolController) ReadAllTools(c *gin.Context) {
	permissionLevel, err := strconv.Atoi(c.Query("permission_level"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tools, err := sc.toolService.ReadToolsByPermissionLevel(c.Request.Context(), toolrouter.ToolClientPermissionLevel(permissionLevel))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tools)
}

func (sc *ToolController) ReadToolByID(c *gin.Context) {
	toolID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tool, err := sc.toolService.ReadToolByID(c.Request.Context(), toolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tool)
}

func (sc *ToolController) ReadToolByUUID(c *gin.Context) {
	toolUUID, err := uuid.Parse(c.Param("uuid"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tool, err := sc.toolService.ReadToolByUUID(c.Request.Context(), toolUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tool)
}

func (sc *ToolController) ReadToolRequestByID(c *gin.Context) {
	toolRequestID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	toolRequest, err := sc.toolService.ReadToolRequestByID(c.Request.Context(), toolRequestID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, toolRequest)
}

func (sc *ToolController) ReadAllToolRequests(c *gin.Context) {
	toolRequests, err := sc.toolService.ReadAllToolRequests(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, toolRequests)
}

func (sc *ToolController) ExecuteTool(c *gin.Context) {
	toolID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var reqBody []toolrouter.ToolInteractionElement
	if err := c.ShouldBindJSON((&reqBody)); err != nil {
		c.JSON((http.StatusBadRequest), gin.H{"error": err.Error()})
		return
	}

	response, err := sc.toolService.ExecuteTool(c.Request.Context(), toolID, reqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, response)
}

func (sc *ToolController) GetTools(c *gin.Context) {
	tools, err := sc.toolService.ReadAllTools(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tools)
}

func (sc *ToolController) GetTool(c *gin.Context) {
	toolID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tool, err := sc.toolService.ReadTool(c.Request.Context(), toolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, tool)
}

func (sc *ToolController) CreateTool(c *gin.Context) {
	var dto CreateToolDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := sc.toolService.CreateTool(c.Request.Context(), &dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{})
}

func (sc *ToolController) DeleteTool(c *gin.Context) {
	toolID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = sc.toolService.DeleteTool(c.Request.Context(), toolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusNoContent, gin.H{})
}

func (sc *ToolController) GetToolMessages(c *gin.Context) {
	sessionID, err := uuid.Parse(c.Param("session_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	messages, err := sc.toolService.ReadAllToolMessages(c.Request.Context(), sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, messages)
}

func (sc *ToolController) CreateToolMessage(c *gin.Context) {
	var dto CreateToolMessageDTO
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := sc.toolService.CreateToolMessage(c.Request.Context(), &dto)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{})
}

func (sc *ToolController) SendRequestToToolServer(c *gin.Context) {
	toolID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var reqBody []toolrouter.ToolInteractionElement
	if err := c.ShouldBindJSON((&reqBody)); err != nil {
		c.JSON((http.StatusBadRequest), gin.H{"error": err.Error()})
		return
	}

	response, err := sc.toolService.SendRequestToToolServer(c.Request.Context(), toolID, reqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, response)
}
