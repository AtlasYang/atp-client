package client

import (
	"context"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ClientService interface {
	GetCurrentClient(rctx context.Context) (*toolrouter.Client, error)
}

type clientService struct {
	ctx               context.Context
	db                *pgxpool.Pool
	toolRouterService toolrouter.ToolRouterService
}

func NewClientService(c context.Context, db *pgxpool.Pool) ClientService {
	toolRouterService := toolrouter.NewToolRouterService(c)
	return &clientService{ctx: c, db: db, toolRouterService: toolRouterService}
}

func (s *clientService) GetCurrentClient(rctx context.Context) (*toolrouter.Client, error) {
	client, err := s.toolRouterService.GetCurrentClient()
	if err != nil {
		return nil, err
	}
	return client, nil
}
