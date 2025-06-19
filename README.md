# ATP-Client

AIGENDRUG Tool Platform, Client Application

## Authors

Course Information: 2025 Seoul Nat'l University, Creative Integrated Design 2

Group A:

- Yang Gil Mo - [AtlasYang](https://github.com/AtlasYang)
- Khinwaiyan - [khinwaiyan](https://github.com/khinwaiyan)
- Kim Da In - [dida0423](https://github.com/dida0423)

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
- **Chat Interface**: Real-time conversational AI with message history
- **Tool Output Visualization**: Rich display of tool execution results and status

## Technology Stack

- **Backend Framework**: [Go Gin](https://gin-gonic.com/) - High-performance HTTP web framework
- **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/) - Modern web application development
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Advanced open-source relational database
- **UI Library**: [Cloudscape Design System](https://cloudscape.design/) - Open source UI Library made by AWS
- **Real-time Communication**: [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) - Bidirectional communication
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool and development server
- **Internationalization**: [react-i18next](https://react.i18next.com/) - Multi-language support
- **Containerization**: [Docker](https://www.docker.com/) - Application containerization

## Getting Started

### Prerequisites

For self-hosted deployment:
- Docker and Docker Compose
- Node.js 18+ with npm/yarn (for development)
- Go 1.22+ (for development)
- Linux environment (Ubuntu 20.04+ recommended)

### Configuration

Before deployment, you'll need to configure environment variables:

#### Required Environment Variables

**Server Configuration:**
- **ATP_ROUTER_HOST**: ATP-Central service endpoint
- **ATP_ROUTER_API_KEY**: API key for ATP-Central authentication
- **POSTGRES_PASSWORD**: Secure password for PostgreSQL database
- **DB_HOST**, **DB_PORT**: Database connection settings
- **PORT**: Server port (default: 8080)
- **RUN_MODE**: Environment mode (release for production, debug for development)

**Client Configuration:**
- **VITE_API_BASE_URL**: Backend API endpoint
- **VITE_WS_URL**: WebSocket connection URL

All configuration options are documented in the `.env.example` file with placeholder values and descriptions.

### Installation

#### Self-Hosted Deployment

The self-hosted setup uses Docker Compose for simplified deployment:

1. **Environment Configuration**
   ```bash
   # Copy environment template and configure your settings
   cp .env.example .env
   
   # Edit the .env file with your actual values:
   # - Set ATP_ROUTER_HOST to your ATP-Central endpoint
   # - Add your ATP_ROUTER_API_KEY
   # - Set POSTGRES_PASSWORD to a secure password
   # - Configure other service settings as needed
   vim .env  # or use your preferred editor
   ```

2. **Deploy All Services**
   ```bash
   # Start all services with Docker Compose
   docker compose up -d
   ```

#### Production Cloud Deployment

For production cloud deployment:

1. **Database**: Deploy PostgreSQL using managed database services
2. **Server**: Deploy to container services with auto-scaling
3. **Web Client**: Deploy to CDN or static hosting services
4. **Load Balancing**: Configure load balancer for high availability

## API Integration

ATP-Client integrates with ATP-Central through secure API endpoints for tool selection and execution coordination.

## Troubleshooting

### Common Issues

- **Connection Issues**: Verify ATP-Central service is running and accessible
- **Authentication Errors**: Check API key configuration in environment variables
- **Database Problems**: Ensure PostgreSQL is properly configured and running
- **WebSocket Failures**: Confirm CORS settings and network connectivity

## Support

For questions, bug reports, or further assistance, contact:

📧 [khinwaiyan@snu.ac.kr](mailto:khinwaiyan@snu.ac.kr)

Environment variables and detailed configuration examples are provided in each component directory.
