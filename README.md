# ATP-Client

AIGENDRUG Tool Platform, Client Application

## Authors

Course Information: 2025 Seoul Nat'l University, Creative Integrated Design 2

Group A:

- Yang Gil Mo - [AtlasYang](https://github.com/AtlasYang)
- Khinwaiyan - [khinwaiyan](https://github.com/khinwaiyan)
- Kin Da In - [dida0423](https://github.com/dida0423)

## Introduction

**ATP-Client** is the comprehensive user-facing application of the **AIGENDRUG Tool Platform**, providing an intuitive interface for intelligent tool discovery, interactive chat-based assistance, and seamless tool execution management. This client application connects to ATP-Central to deliver AI-powered tool selection and execution capabilities through a modern, responsive web interface.

The platform enables users to engage with computational tools through natural language conversations, automatically matching user intents with appropriate tools, and providing real-time execution feedback. ATP-Client serves as the primary gateway for end-users to access the AIGENDRUG ecosystem's computational resources.

### Key Features

- **Intelligent Chat Interface**: Natural language interaction with AI-powered tool selection and execution
- **Real-time WebSocket Communication**: Live bidirectional communication for chat and tool execution updates
- **Multi-Session Management**: Concurrent session handling with persistent conversation history
- **Interactive Tool Registration**: Dynamic tool registration and configuration interface
- **Responsive Design**: Modern React-based UI with mobile-first responsive design
- **Multi-language Support**: Internationalization support with Korean and English locales
- **Tool Execution Monitoring**: Real-time tool execution status and result visualization
- **Session Persistence**: Cassandra-based session and message storage for conversation continuity

### Architecture Overview

ATP-Client follows a modern full-stack architecture with clear separation between frontend and backend concerns:

#### Server (Go/Gin)
A high-performance HTTP server built with Go and Gin framework, providing RESTful APIs and WebSocket services:

**Core Services:**
- **Chat Service**: Manages conversation sessions, message persistence, and real-time chat functionality
- **Tool Service**: Handles tool registration, CRUD operations, and tool execution coordination
- **Session Management**: User session lifecycle management with secure authentication
- **Tool Router Integration**: Seamless communication with ATP-Central for intelligent tool selection

**Key Capabilities:**
- RESTful API endpoints for all client operations
- WebSocket-based real-time chat and tool execution updates
- Integration with ATP-Central via secure API key authentication
- Session and message persistence using PostgreSQL

#### Web Client (React/TypeScript)
A modern, responsive single-page application built with React and TypeScript:

**Core Components:**
- **Dashboard**: Central hub for session management and tool overview
- **Chat Interface**: Real-time conversational AI with message historys
- **Tool Output Visualization**: Rich display of tool execution results and status

## Technology Stack


## Getting Started

### Prerequisites

For local development and deployment:
- Docker and Docker Compose
- Node.js 18+ with npm/yarn
- Go 1.22+
- Linux environment (Ubuntu 20.04+ recommended)
- Minimum 2GB RAM, 1GB storage

### Installation

#### Development Environment Setup

1. **Database Setup**
   ```bash
   cd database
   chmod +x .run.sh
   ./.run.sh  # Start Cassandra database
   ```

2. **Server Development**
   ```bash
   cd server
   chmod +x .load_env.sh .run.sh
   ./.load_env.sh  # Configure environment variables
   go mod tidy     # Install Go dependencies
   ./.run.sh       # Start the Go server
   ```

3. **Web Client Development**
   ```bash
   cd web-client
   npm install     # Install dependencies
   npm run dev     # Start development server
   ```

#### Quick Start for End Users

1. Clone the repository:
   ```bash
   git clone https://github.com/khinwaiyan/aigendrug-cid-2025-web-client.git
   cd aigendrug-cid-2025-web-client
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

#### Production Deployment

**Docker Compose (Recommended)**
```bash
# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d
```

**Individual Container Deployment**
```bash
# Database
cd database && docker build -t atp-client-db . && docker run -d atp-client-db

# Server
cd server && docker build -t atp-client-server . && docker run -d atp-client-server

# Web Client
cd web-client && docker build -t atp-client-web . && docker run -d atp-client-web
```

### Configuration

#### Environment Variables

**Server Configuration:**
```bash
# ATP-Central Integration
ATP_ROUTER_HOST=https://api.atp.aigendrug.com
ATP_ROUTER_API_KEY=your_api_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
CASSANDRA_HOSTS=localhost:9042

# Server Settings
PORT=8080
RUN_MODE=release  # debug for development
```

**Client Configuration:**
```bash
# API Endpoints
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### API Integration

ATP-Client integrates with ATP-Central through secure API endpoints:

```go
// Tool Selection Request
type SelectToolRequest struct {
    UserPrompt string `json:"user_prompt"`
}

// WebSocket Message Structure
type ChatMessage struct {
    ID            uuid.UUID `json:"id"`
    SessionID     uuid.UUID `json:"session_id"`
    Role          string    `json:"role"`
    Message       string    `json:"message"`
    MessageType   int       `json:"message_type"`
    LinkedToolIDs []uuid.UUID `json:"linked_tool_ids"`
}
```

## User Manual

This section provides a comprehensive guide for end-users to navigate and utilize the AIGENDRUG Web Client interface.

### Navigating the Application

#### Dashboard

- Displays the number of currently active **sessions** and **registered tools**.
- From this page, you can:
  - View detailed session list
  - Add or delete sessions
  - Check each session's name, status, and the ID of any tool running within it
- You can navigate to other parts of the app using the top **navigation bar**

#### Session List Page

- Accessed from the sidebar or via the floating chat button (FAB)
- Allows users to:
  - View existing chat sessions
  - Start a **new session** for tool recommendation or chat
  - Continue previously created sessions

#### Tool List & Register Page

- View all **registered tools** in a searchable, sortable table
- Each tool shows metadata including tool name, interface type, and expected input
- You can register new tools in the **Tool Register Page** via:
  - A manual JSON form
  - Uploading a `.json` file matching the expected schema

#### Tool Recommendation Page

- Found inside the chat session screen
- Users can input natural language queries
  _e.g. "I want to find potential inhibitors for protein X"_
- The system recommends appropriate tools based on the input
- Click the **"Use Tool"** button next to a recommendation to go to the **Tool Input Page**

#### Tool Input & Output Page

##### Tool Input Page

- Dynamically renders input forms based on tool specification
- Supported input types include:
  - Numeric fields
  - SMILES strings
  - CSV file upload
- After submitting the form:
  - The tool execution is triggered
  - You are redirected to the **Tool Session List Page**

##### Tool Session List Page

- Displays a list of all tool executions under the current session
- Shows:
  - Tool name
  - Execution status (`pending`, `running`, `success`, `failed`)
  - Creation timestamp
- You can filter the list by status
- Clicking on a successfully executed tool redirects to the **Tool Output Page**

##### Tool Output Page

- Shows the final results returned by the tool
- Output formats vary by tool and can include:
  - Tables
  - Images
  - Text summaries
  - Downloadable files

### Using the Chat Feature

- A **Floating Action Button (FAB)** with the AIGENDRUG logo is visible in the bottom-right of all pages
- Clicking it opens the **chat modal**
- Features include:
  - Viewing existing sessions
  - Starting a new session
  - Asking natural language queries to get tool recommendations
- Serves as the main entry point to the recommendation pipeline

## Usage Examples

### Basic Chat Interaction
```typescript
// Initialize WebSocket connection
const chatService = new ChatService();
await chatService.connect();

// Send message and receive AI response
const response = await chatService.sendMessage({
  message: "I need to analyze some data",
  sessionId: currentSessionId
});
```

### Tool Registration
```typescript
// Register new tool
const toolData = {
  name: "Data Analyzer",
  version: "1.0.0",
  description: "Advanced data analysis tool",
  providerInterface: {
    endpoint: "https://api.example.com/analyze",
    requestInterface: [
      { key: "data", valueType: "string", required: true }
    ]
  }
};

await toolService.createTool(toolData);
```

## Troubleshooting

### Common Issues

- **White screen on load**
  Ensure `.env` has the correct `VITE_API_BASE_URL` pointing to the backend server.

- **Tool list not loading**
  Confirm the backend is running and reachable from the frontend.

- **CORS errors in browser console**
  Backend server may be missing CORS headers. Enable them for the frontend origin.

- **Chat is not responding**
  Backend LLM pipeline or LangGraph service may be down. Restart or inspect logs.

### Development Troubleshooting

- **Database connection issues**
  Verify Cassandra is running and accessible on the configured port.

- **WebSocket connection failures**
  Check server logs for WebSocket endpoint errors and ensure proper CORS configuration.

- **Tool execution timeouts**
  Verify ATP-Central connectivity and API key configuration.

## Support

For questions, bug reports, or further assistance, contact:

📧 [khinwaiyan@snu.ac.kr](mailto:khinwaiyan@snu.ac.kr)

Environment variables and detailed configuration examples are provided in each component directory.
