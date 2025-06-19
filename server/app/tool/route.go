package tool

import (
	"context"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupToolRoutes(c context.Context, router *gin.Engine, db *pgxpool.Pool) {
	toolService := NewToolService(c, db)
	toolController := NewToolController(toolService)

	toolRoutes := router.Group("/v1/tool")
	{
		toolRoutes.GET("/:id", toolController.ReadToolByID)
		toolRoutes.GET("/uuid/:uuid", toolController.ReadToolByUUID)
		toolRoutes.GET("", toolController.ReadAllTools)
		toolRoutes.GET("/requests/:id", toolController.ReadToolRequestByID)
		toolRoutes.GET("/requests", toolController.ReadAllToolRequests)
		toolRoutes.POST("/execute/:id", toolController.ExecuteTool)

		// deprecated
		// toolRoutes.GET("/:id", toolController.GetTool)
		// toolRoutes.POST("", toolController.CreateTool)
		// toolRoutes.DELETE("/:id", toolController.DeleteTool)
		// toolRoutes.GET("/messages/:session_id", toolController.GetToolMessages)
		// toolRoutes.POST("/messages", toolController.CreateToolMessage)
		toolRoutes.GET("/messages", toolController.GetToolMessages)
		toolRoutes.GET("/send_request/:id", toolController.SendRequestToToolServer)

		toolRoutes.GET("/session/ws", func(ctx *gin.Context) {
			WebSocketHandler(ctx, db)
		})
	}
}
