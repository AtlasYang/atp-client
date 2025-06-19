package tool

import (
	"fmt"

	toolrouter "aigendrug.com/aigendrug-cid-2025-server/tool-router"
)

func BodyRequestHelper(requestBody []toolrouter.ToolInteractionElement, id string) (any, error) {
	for _, entry := range requestBody {
		if entry.Interface_id == id {
			return entry.Content, nil
		}
	}
	return nil, fmt.Errorf("missisng required field: %s", id)
}
