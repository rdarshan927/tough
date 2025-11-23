# Tough Chat - System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│                  (Browser - React App)                      │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Chat UI   │  │  AI Provider │  │  Google Auth    │   │
│  │             │  │   Selector   │  │    Button       │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│                                                             │
│  Frontend: http://localhost:5173                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/REST API
                       │ (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BACKEND SERVER                            │
│             (Node.js + Express + MCP)                       │
│              http://localhost:3001                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              API ROUTES LAYER                       │   │
│  │                                                     │   │
│  │  /api/chat        /api/auth       /api/mcp        │   │
│  │  • POST /         • GET /google   • GET /tools    │   │
│  │                   • GET /callback  • POST /execute │   │
│  └───────┬────────────────┬──────────────┬───────────┘   │
│          │                │              │                 │
│  ┌───────▼────────────────▼──────────────▼───────────┐   │
│  │            SERVICES LAYER                         │   │
│  │                                                    │   │
│  │  ┌──────────────┐  ┌───────────┐  ┌────────────┐ │   │
│  │  │ AI Provider  │  │   OAuth2  │  │    MCP     │ │   │
│  │  │   Service    │  │   Client  │  │  Handler   │ │   │
│  │  └──────────────┘  └───────────┘  └────────────┘ │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────┬───────────────────┬────────────────┬─────────────┘
          │                   │                │
          │                   │                │
┌─────────▼─────┐   ┌─────────▼────────┐   ┌──▼──────────┐
│  AI Providers │   │  Google APIs     │   │  Local      │
│               │   │                  │   │  Storage    │
│  • Groq       │   │  • Calendar API  │   │             │
│  • OpenAI     │   │  • Tasks API     │   │  • Notes    │
│  • Anthropic  │   │                  │   │    (JSON)   │
│  • Together   │   │  OAuth2 Tokens:  │   │  • Tokens   │
│  • Ollama     │   │  stored locally  │   │    (JSON)   │
└───────────────┘   └──────────────────┘   └─────────────┘
```

## Data Flow - Chat Message

```
1. User types message in frontend
   │
   └─> Frontend: Chat.tsx
       │
       └─> API Client: sendMessage(messages, provider, model)
           │
           └─> HTTP POST to http://localhost:3001/api/chat
               │
               └─> Backend: routes/chat.ts
                   │
                   └─> services/ai-provider.ts
                       │
                       └─> External AI API (Groq/OpenAI/etc.)
                           │
                           └─> Response with AI message
                               │
                               └─> Format response
                                   │
                                   └─> Return to frontend
                                       │
                                       └─> Display in chat UI
```

## Data Flow - MCP Tool Execution (Calendar Example)

```
1. User: "What's on my calendar today?"
   │
   └─> Frontend: Sends to backend
       │
       └─> Backend: AI processes request
           │
           └─> AI decides to use calendar_list_events tool
               │
               └─> Backend: routes/mcp.ts → POST /execute
                   │
                   └─> services/mcp-handler.ts
                       │
                       └─> executeMCPTool("calendar_list_events", {...})
                           │
                           └─> Load OAuth tokens from tokens/
                               │
                               └─> Google Calendar API call
                                   │
                                   └─> Return events data
                                       │
                                       └─> Format as response
                                           │
                                           └─> AI generates natural language
                                               │
                                               └─> Display to user:
                                                   "You have 3 events today..."
```

## Authentication Flow

```
1. User clicks "Connect Google"
   │
   └─> Frontend: getGoogleAuthUrl()
       │
       └─> Backend: GET /api/auth/google
           │
           └─> Generate OAuth URL
               │
               └─> Return URL to frontend
                   │
                   └─> Open in popup window
                       │
                       └─> User logs in to Google
                           │
                           └─> Google redirects to callback
                               │
                               └─> Backend: GET /api/auth/google/callback
                                   │
                                   └─> Exchange code for tokens
                                       │
                                       └─> Save to tokens/google-tokens.json
                                           │
                                           └─> Close popup, update UI
                                               │
                                               └─> ✅ Google Connected
```

## MCP Tools Architecture

```
┌────────────────────────────────────────────┐
│         MCP Handler Service                │
│      (services/mcp-handler.ts)             │
│                                            │
│  executeMCPTool(toolName, params)         │
│          │                                 │
│          ├─> Calendar Tools                │
│          │   ├─> calendar_list_events      │
│          │   ├─> calendar_create_event     │
│          │   ├─> calendar_update_event     │
│          │   └─> calendar_delete_event     │
│          │                                 │
│          ├─> Tasks Tools                   │
│          │   ├─> tasks_list                │
│          │   ├─> tasks_create              │
│          │   ├─> tasks_update              │
│          │   └─> tasks_delete              │
│          │                                 │
│          └─> Notes Tools                   │
│              ├─> notes_create              │
│              ├─> notes_list                │
│              ├─> notes_get                 │
│              ├─> notes_update              │
│              └─> notes_delete              │
│                                            │
└────────────────────────────────────────────┘
```

## File System Layout

```
TOUGH CHAT/
│
├── tough/
│   ├── front-end/                     # Frontend Application
│   │   ├── src/
│   │   │   ├── Chat.tsx              # Original chat (client-side API calls)
│   │   │   ├── Chat-v2.tsx           # New chat (backend API calls)
│   │   │   ├── api/
│   │   │   │   └── client.ts         # Backend API client
│   │   │   ├── Store.ts              # Redux store (provider state)
│   │   │   └── MarkdownRenderer.tsx  # Message rendering
│   │   ├── .env                      # VITE_API_URL=http://localhost:3001/api
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── package.json
│   │
│   ├── tough-backend/                 # Backend Server
│   │   ├── src/
│   │   │   ├── index.js              # Express server entry
│   │   │   ├── routes/
│   │   │   │   ├── chat.js           # POST /api/chat
│   │   │   │   ├── auth.js           # OAuth endpoints
│   │   │   │   └── mcp.js            # MCP tool endpoints
│   │   │   └── services/
│   │   │       ├── ai-provider.js    # Multi-provider AI client
│   │   │       └── mcp-handler.js    # MCP tools implementation
│   │   ├── tokens/                    # OAuth tokens (auto-created)
│   │   │   └── google-tokens.json
│   │   ├── data/                      # App data (auto-created)
│   │   │   └── notes.json
│   │   ├── .env                       # API keys & config
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── docker-compose.yml             # Full stack orchestration
│
├── README.md                          # Main documentation
├── SETUP.md                           # Setup instructions
├── IMPLEMENTATION.md                  # Technical details
├── ARCHITECTURE.md                    # This file
└── setup.sh                           # Automated setup
```

## Security Architecture

```
┌──────────────────────────────────────────┐
│         Security Layers                  │
│                                          │
│  Frontend (Browser)                      │
│  ├─> No API keys stored                 │
│  ├─> No OAuth tokens stored             │
│  └─> Only sends requests to backend     │
│                                          │
│  Backend (Server)                        │
│  ├─> API keys in .env (not committed)  │
│  ├─> OAuth tokens in tokens/           │
│  ├─> CORS: only allow frontend origin  │
│  ├─> Helmet: security headers          │
│  └─> Express: input validation         │
│                                          │
│  External Services                       │
│  ├─> AI Providers: HTTPS + API keys    │
│  ├─> Google APIs: HTTPS + OAuth2       │
│  └─> All communication encrypted        │
└──────────────────────────────────────────┘
```

## Deployment Options

### Option 1: Development (Local)

```
Terminal 1: cd tough/tough-backend && npm run dev
Terminal 2: cd tough/front-end && npm run dev

Access: http://localhost:5173
```

### Option 2: Docker (Containerized)

```
cd tough
docker-compose up -d

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Ollama: http://localhost:11434
```

### Option 3: Production (Separate Hosting)

```
Frontend: Vercel/Netlify/GitHub Pages
Backend: Railway/Render/Digital Ocean
Database: MongoDB Atlas (for notes, future)
```

## Technology Stack

```
┌─────────────────────────────────────────┐
│           Frontend Stack                │
├─────────────────────────────────────────┤
│ • React 19 - UI framework               │
│ • TypeScript - Type safety              │
│ • Redux Toolkit - State management      │
│ • Vite - Build tool                     │
│ • React Markdown - Message rendering    │
│ • CSS Modules - Styling                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│            Backend Stack                │
├─────────────────────────────────────────┤
│ • Node.js 18+ - Runtime                 │
│ • Express.js - Web framework            │
│ • TypeScript - Type safety              │
│ • googleapis - Google API client        │
│ • Axios - HTTP client                   │
│ • dotenv - Environment variables        │
│ • Helmet - Security                     │
│ • CORS - Cross-origin requests          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          Integration Layer              │
├─────────────────────────────────────────┤
│ • Model Context Protocol (MCP)          │
│ • Google Calendar API                   │
│ • Google Tasks API                      │
│ • OAuth2 (Google)                       │
│ • File-based storage (JSON)             │
└─────────────────────────────────────────┘
```

## Key Design Decisions

1. **Backend-First Architecture**

   - API keys stored server-side for security
   - Centralized error handling
   - Easier to add authentication later

2. **MCP Tool Design**

   - Each tool is a separate async function
   - Consistent parameter structure
   - Error handling at tool level

3. **File-Based Storage**

   - Simple JSON files for notes
   - Easy to migrate to database later
   - No external dependencies

4. **OAuth Token Management**

   - Tokens stored in files (not database)
   - Automatic token refresh
   - Secure callback handling

5. **Multi-Provider Support**
   - Unified interface for all AI providers
   - Easy to add new providers
   - Provider-specific optimizations

This architecture provides a solid foundation for building a production-ready AI assistant with extensive integration capabilities!
