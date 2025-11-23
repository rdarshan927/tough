# Tough Chat - Full Stack Setup Guide

## Overview

Tough Chat is a full-stack AI chat application with MCP (Model Context Protocol) integration for Google Calendar, Tasks, and Notes. The application consists of:

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + MCP

## Architecture

```
┌─────────────────────────────────────────────────┐
│             Frontend (React)                    │
│  - Chat Interface                               │
│  - Provider Selection (Groq, OpenAI, etc.)     │
│  - Google Auth UI                              │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/REST API
┌──────────────────▼──────────────────────────────┐
│          Backend (Node.js/Express)              │
│  ┌──────────────────────────────────────────┐   │
│  │  AI Provider Service                     │   │
│  │  (Groq, OpenAI, Anthropic, etc.)        │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │  MCP Handler Service                     │   │
│  │  - Google Calendar API                   │   │
│  │  - Google Tasks API                      │   │
│  │  - Notes System (File-based)            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
   ┌────▼───┐ ┌───▼────┐ ┌──▼──────┐
   │ Google │ │ Google │ │  Notes  │
   │Calendar│ │ Tasks  │ │  (JSON) │
   └────────┘ └────────┘ └─────────┘
```

## Setup Instructions

### 1. Backend Setup

#### Prerequisites

- Node.js 18+ installed
- Google Cloud Project with Calendar and Tasks APIs enabled
- API keys for AI providers (at least one: Groq, OpenAI, Anthropic, Together, or Ollama)

#### Installation

```bash
cd tough/tough-backend
npm install
```

#### Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:

```env
# Server
PORT=3001
NODE_ENV=development

# AI Provider Keys (add at least one)
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
TOGETHER_API_KEY=your_together_key_here
OLLAMA_URL=http://localhost:11434

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Security
SESSION_SECRET=generate_a_random_string_here

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable APIs:
   - Go to "APIs & Services" > "Library"
   - Search for and enable "Google Calendar API"
   - Search for and enable "Google Tasks API"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client ID"
   - Configure OAuth consent screen (if not done)
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

#### Run Backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

The backend will start on `http://localhost:3001`

### 2. Frontend Setup

#### Installation

```bash
cd tough/front-end
npm install
```

#### Configure Environment

Create `.env` in the frontend directory:

```env
VITE_API_URL=http://localhost:3001/api
```

#### Update to Use Backend

Replace the content of `src/Chat.tsx` with `src/Chat-v2.tsx`:

```bash
cd src
cp Chat.tsx Chat-backup.tsx
cp Chat-v2.tsx Chat.tsx
```

Or manually update `App.tsx` to use the new backend-connected chat.

#### Run Frontend

Development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The frontend will start on `http://localhost:5173`

### 3. Using the Application

#### First Time Setup

1. **Start Backend**: Open a terminal and run `cd tough/tough-backend && npm run dev`
2. **Start Frontend**: Open another terminal and run `cd tough/front-end && npm run dev`
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Select AI Provider**: Choose your preferred AI provider from the dropdown
5. **Connect Google** (optional): Click "Connect Google" button to authenticate with Google for Calendar and Tasks access

#### Using MCP Tools

The AI can now access and control your Google Calendar, Tasks, and Notes through natural language:

**Calendar Examples:**

- "What's on my calendar today?"
- "Show me events for next week"
- "Create a meeting tomorrow at 2 PM for project review"
- "Update my 3 PM meeting to 4 PM"

**Tasks Examples:**

- "Show me my todo list"
- "Add a task to buy groceries"
- "Mark my first task as complete"
- "What tasks are due this week?"

**Notes Examples:**

- "Create a note about today's standup"
- "Show me all my notes"
- "Add to my meeting notes"
- "Delete my last note"

### 4. Docker Deployment (Optional)

#### Backend Dockerfile

Create `tough-backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### Docker Compose

Update root `docker-compose.yml` to include backend:

```yaml
version: "3.8"

services:
  backend:
    build: ./tough-backend
    ports:
      - "3001:3001"
    env_file:
      - ./tough-backend/.env
    volumes:
      - ./tough-backend/tokens:/app/tokens
      - ./tough-backend/data:/app/data

  frontend:
    build: ./tough
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:3001/api
```

Run with Docker:

```bash
docker-compose up -d
```

## API Endpoints

### Chat

- `POST /api/chat` - Send message and get AI response

### Authentication

- `GET /api/auth/google` - Get Google OAuth URL
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/status` - Check authentication status

### MCP Tools

- `GET /api/mcp/tools` - List available MCP tools
- `POST /api/mcp/execute` - Execute an MCP tool

## Troubleshooting

### Backend Issues

**Port already in use:**

```bash
# Change PORT in .env file
PORT=3002
```

**Google Auth not working:**

- Verify redirect URI matches exactly in Google Cloud Console
- Check that Calendar and Tasks APIs are enabled
- Ensure OAuth consent screen is configured

### Frontend Issues

**Can't connect to backend:**

- Verify VITE_API_URL in .env
- Check that backend is running
- Check browser console for CORS errors

### MCP Tool Issues

**Calendar/Tasks not accessible:**

- Ensure you've clicked "Connect Google" and completed OAuth flow
- Check that tokens file exists in `tough-backend/tokens/`
- Verify API scopes in auth.ts match your Google Cloud Console settings

## Security Notes

- Never commit `.env` files to git
- API keys are now stored server-side only
- OAuth tokens are stored securely in backend
- Use HTTPS in production
- Rotate API keys regularly
- Use environment-specific configurations

## License

MIT
