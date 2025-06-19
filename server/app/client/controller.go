package client

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ClientController struct {
	clientService ClientService
}

func NewClientController(clientService ClientService) *ClientController {
	return &ClientController{clientService: clientService}
}

func (cc *ClientController) GetCurrentClient(c *gin.Context) {
	client, err := cc.clientService.GetCurrentClient(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, client)
}
