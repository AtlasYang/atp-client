package main

import (
	"context"
	"fmt"
	"os"

	"aigendrug.com/aigendrug-cid-2025-server/app"
	"aigendrug.com/aigendrug-cid-2025-server/app/chat"
	"aigendrug.com/aigendrug-cid-2025-server/app/tool"
	"aigendrug.com/aigendrug-cid-2025-server/database"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	if os.Getenv("RUN_MODE") == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	port, pr := os.LookupEnv("PORT")
	if !pr {
		port = "8080"
	}

	router := gin.Default()

	ctx := context.Background()

	pool, err := database.NewPostgresPool(ctx)
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	defer pool.Close()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"https://aigendrug-cid-2025.luidium.com",
			"http://localhost:3000",
		},
		AllowMethods: []string{"PUT", "POST", "GET", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Authorization",
			"Content-Type",
			"Access-Control-Allow-Origin",
			"Access-Control-Allow-Credentials",
		},
	}))

	router.Handle("GET", "/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	go chat.HandleMessages(pool)
	go tool.HandleMessages(pool)

	app.SetupRoutes(ctx, router, pool)

	router.Run(fmt.Sprintf(":%s", port))
}
