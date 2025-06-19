package client

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupClientRoutes(c context.Context, router *gin.Engine, db *pgxpool.Pool) {
	clientService := NewClientService(c, db)
	clientController := NewClientController(clientService)

	clientRoutes := router.Group("/v1/clients")
	{
		clientRoutes.GET("/current", clientController.GetCurrentClient)
	}
}
