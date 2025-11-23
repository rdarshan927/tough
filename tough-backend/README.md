# Tough Chat - Python Backend# Tough Chat Backend

This is the Python backend for Tough Chat, providing REST API endpoints for AI chat functionality with MCP (Model Context Protocol) integration.Node.js backend server (JavaScript/ES6) for Tough Chat with MCP (Model Context Protocol) integration for Google Calendar, Tasks, and Notes.

## 🏗️ Structure## Features

````- 🤖 AI Provider Integration (Groq, OpenAI, Anthropic, Together.ai, Ollama)

tough-backend/- 📅 Google Calendar Integration via MCP

├── src/                    # Application source code- ✅ Google Tasks Integration via MCP

│   ├── __init__.py        # Package initialization- 📝 Notes System (file-based storage)

│   ├── app.py             # Main Flask application- 🔐 OAuth2 Authentication for Google APIs

│   ├── routes/            # API route handlers- 🛡️ Secure API Key Management

│   ├── services/          # Business logic services

│   └── models/            # Data models## Setup

├── tests/                 # Test files

├── data/                  # Data storage (auto-created)### 1. Install Dependencies

├── tokens/                # OAuth tokens (auto-created)

├── requirements.txt       # Python dependencies```bash

├── .env.example          # Environment variables templatecd tough-backend

├── pytest.ini            # Pytest configurationnpm install

├── pyproject.toml        # Python project config```

├── .flake8               # Linting configuration

└── Dockerfile            # Docker image configuration### 2. Configure Environment Variables

````

Copy `.env.example` to `.env` and fill in your credentials:

## 🚀 Quick Start

```````bash

### Prerequisitescp .env.example .env

- Python 3.11+```

- pip

- Virtual environment (recommended)Required environment variables:

- `GOOGLE_CLIENT_ID` - Your Google OAuth2 Client ID

### Installation- `GOOGLE_CLIENT_SECRET` - Your Google OAuth2 Client Secret

- `GROQ_API_KEY` - Your Groq API key (optional, if using Groq)

1. **Create virtual environment:**- `OPENAI_API_KEY` - Your OpenAI API key (optional, if using OpenAI)

   ```bash- `ANTHROPIC_API_KEY` - Your Anthropic API key (optional, if using Anthropic)

   python -m venv venv- `TOGETHER_API_KEY` - Your Together.ai API key (optional, if using Together)

   source venv/bin/activate  # On Windows: venv\Scripts\activate

   ```### 3. Get Google OAuth2 Credentials



2. **Install dependencies:**1. Go to [Google Cloud Console](https://console.cloud.google.com/)

   ```bash2. Create a new project or select existing one

   pip install -r requirements.txt3. Enable the following APIs:

   ```   - Google Calendar API

   - Google Tasks API

3. **Configure environment:**4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"

   ```bash5. Configure OAuth consent screen

   cp .env.example .env6. Set authorized redirect URIs:

   # Edit .env with your API keys   - `http://localhost:3001/api/auth/google/callback`

   ```7. Copy Client ID and Client Secret to `.env`



4. **Run the server:**### 4. Run the Server

   ```bash

   # Development modeDevelopment mode with auto-reload (Node.js 18.11+ required):

   python -m src.app```bash

   npm run dev

   # Or with Flask CLI```

   export FLASK_APP=src/app.py

   flask run --port 3001Production mode:

   ``````bash

npm start

## 🐳 Docker```



```bash## API Endpoints

# Build image

docker build -t tough-backend .### Chat

- `POST /api/chat` - Send message to AI and get response

# Run container

docker run -p 3001:3001 --env-file .env tough-backend### Authentication

```- `GET /api/auth/google` - Get Google OAuth URL

- `GET /api/auth/google/callback` - OAuth callback handler

## 🧪 Testing- `GET /api/auth/status` - Check authentication status



```bash### MCP Tools

# Run all tests- `GET /api/mcp/tools` - List available MCP tools

pytest- `POST /api/mcp/execute` - Execute an MCP tool



# Run with coverage## Available MCP Tools

pytest --cov=src --cov-report=html

### Google Calendar

# Run specific test file- `calendar_list_events` - List calendar events

pytest tests/test_app.py- `calendar_create_event` - Create a new event

```- `calendar_update_event` - Update an existing event

- `calendar_delete_event` - Delete an event

## 🔧 Development Tools

### Google Tasks

### Linting- `tasks_list` - List tasks

```bash- `tasks_create` - Create a new task

# Check code style- `tasks_update` - Update an existing task

flake8 src/- `tasks_delete` - Delete a task



# Format code### Notes

black src/- `notes_create` - Create a new note

```- `notes_list` - List all notes

- `notes_get` - Get a specific note

### Type Checking- `notes_update` - Update an existing note

```bash- `notes_delete` - Delete a note

mypy src/

```## Architecture



## 📚 API Endpoints (Placeholder)```

tough-backend/

Once development is complete, the backend will provide:├── src/

│   ├── index.js              # Main server entry point

- `POST /api/chat` - Send messages to AI│   ├── routes/

- `GET /api/auth/google` - Google OAuth│   │   ├── chat.js           # Chat API routes

- `GET /api/auth/google/callback` - OAuth callback│   │   ├── auth.js           # Google OAuth routes

- `GET /api/mcp/tools` - List MCP tools│   │   └── mcp.js            # MCP tool routes

- `POST /api/mcp/execute` - Execute MCP tool│   └── services/

│       ├── ai-provider.js    # AI provider integrations

## 🔑 Environment Variables│       └── mcp-handler.js    # MCP tool implementations

├── data/

See `.env.example` for all required environment variables:│   └── notes.json            # Notes storage (auto-created)

- Server configuration├── tokens/

- AI provider API keys│   └── google-tokens.json    # OAuth tokens (auto-created)

- Google OAuth credentials└── package.json

- Storage paths```



## 📦 Dependencies## Security Notes



### Core- API keys are stored server-side only

- **Flask** - Web framework- OAuth tokens are stored in `tokens/` directory (excluded from git)

- **Flask-CORS** - Cross-origin resource sharing- All API communications use HTTPS (in production)

- **python-dotenv** - Environment variable management- CORS is configured to allow frontend access only



### Google APIs## Development

- **google-auth** - Google authentication

- **google-api-python-client** - Google API clientThe backend uses:

- **Express.js** for REST API

### AI Providers- **Google APIs** for Calendar and Tasks

- **openai** - OpenAI API- **Axios** for AI provider HTTP requests

- **anthropic** - Anthropic API- **ES6 Modules** with modern JavaScript

- **groq** - Groq API- **Node.js --watch** for development with hot reload (Node 18.11+)



### Development## License

- **pytest** - Testing framework

- **black** - Code formatterMIT

- **flake8** - Linting
- **mypy** - Type checking

## 🏃 Running in Production

Using Gunicorn:
```bash
gunicorn -w 4 -b 0.0.0.0:3001 "src.app:create_app()"
```````

Using Uvicorn (for async support):

```bash
uvicorn src.app:app --host 0.0.0.0 --port 3001 --workers 4
```

## 📝 Notes

- Keep `.env` file secure and never commit it
- Token files are stored in `tokens/` directory
- Notes data is stored in `data/` directory
- Both directories are gitignored except for `.gitkeep` files

## 🔗 Related

- Frontend: `../front-end/`
- Docker Compose: `../docker-compose.yml`
- Main Documentation: `../../README.md`
