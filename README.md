# Tough Chat - Full Stack AI Assistant

A powerful full-stack chat application with MCP (Model Context Protocol) integration for Google Calendar, Tasks, and Notes. Built with React + TypeScript frontend and Python backend.

🌐 **Live Demo**: [https://rdarshan927.github.io/tough](https://rdarshan927.github.io/tough)

## ✨ Features

### Core Features

- 🤖 **Multi-Provider AI Support**: Works with Groq, OpenAI, Anthropic, Together AI, and Ollama
- 🎨 **Beautiful Modern UI**: Dark mode interface with syntax highlighting
- 📝 **Rich Markdown Support**: Code blocks, tables, lists, and more
- 🔐 **Secure Backend**: API keys stored server-side, not in browser

### MCP Integration (New!)

- 📅 **Google Calendar**: View, create, update, and delete calendar events
- ✅ **Google Tasks**: Manage your todo lists with natural language
- 📓 **Notes System**: Create and manage notes with AI assistance
- 🔗 **OAuth2 Authentication**: Secure Google account integration

### Technical Features

- 💾 **Persistent Storage**: API keys and OAuth tokens securely stored
- 🐳 **Docker Ready**: Easy deployment with Docker Compose
- 🚀 **Fast & Responsive**: Built with Vite for lightning-fast development
- 🛡️ **Type-Safe**: Full TypeScript coverage on frontend and backend

## 🏗️ Architecture

```
Frontend (React + TypeScript)
      ↓ HTTP/REST API
Backend (Python + Flask)
      ↓ MCP Protocol
Google APIs (Calendar, Tasks) + Notes (File-based)
```

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
git clone https://github.com/rdarshan927/tough.git
cd "TOUGH CHAT"
./setup.sh
```

Then follow the on-screen instructions to configure your API keys.

### Manual Setup

See [SETUP.md](./SETUP.md) for detailed instructions.

## 📦 Project Structure

```
TOUGH CHAT/
├── tough/
│   ├── front-end/              # Frontend (React + TypeScript)
│   │   ├── src/
│   │   │   ├── Chat.tsx       # Main chat interface
│   │   │   ├── Chat-v2.tsx    # Backend-connected version
│   │   │   ├── Store.ts       # Redux state management
│   │   │   └── api/
│   │   │       └── client.ts  # API client for backend
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── package.json
│   │
│   └── tough-backend/          # Backend (Python + Flask)
│       ├── src/
│       │   ├── __init__.py    # Package initialization
│       │   ├── app.py         # Flask application (placeholder)
│       │   ├── routes/        # API routes (to be implemented)
│       │   └── services/      # Business logic (to be implemented)
│       ├── tests/             # Test files
│       ├── data/              # Notes storage (auto-created)
│       ├── tokens/            # OAuth tokens (auto-created)
│       ├── requirements.txt   # Python dependencies
│       └── venv/              # Virtual environment (auto-created)
│
├── SETUP.md                    # Detailed setup guide
├── ARCHITECTURE.md             # System architecture
├── IMPLEMENTATION.md           # Implementation details
├── README.md                   # This file
└── setup.sh                    # Automated setup script
```

## 🎯 Usage Examples

### Basic Chat

```
You: "Hello! What can you do?"
AI: "I'm Tough Agent! I can help you with various tasks including..."
```

### Calendar Management

```
You: "What's on my calendar today?"
AI: "Let me check your calendar... [lists today's events]"

You: "Create a meeting tomorrow at 2 PM for project review"
AI: "I've created the event 'Project Review' for tomorrow at 2:00 PM"
```

### Task Management

```
You: "Show me my todo list"
AI: "Here are your current tasks: [lists tasks]"

You: "Add a task to buy groceries"
AI: "I've added 'Buy groceries' to your task list"
```

### Notes

```
You: "Create a note about today's standup meeting"
AI: "I've created a note with the title 'Standup Meeting'..."
```

## 🔧 Configuration

### Backend (.env)

```env
# Required: At least one AI provider
GROQ_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here

# Required: For Google integration
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Server config
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3001/api
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Access the app at `http://localhost:3000`

## 📚 API Documentation

### Chat Endpoint

```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "provider": "groq",
  "model": "llama-3.3-70b-versatile"
}
```

### MCP Tools Endpoint

```bash
POST /api/mcp/execute
Content-Type: application/json

{
  "toolName": "calendar_list_events",
  "parameters": {
    "startDate": "2025-10-25",
    "maxResults": 10
  }
}
```

See [SETUP.md](./SETUP.md) for complete API documentation.

## 🛠️ Development

### Frontend Development

```bash
cd tough/front-end
npm run dev
```

### Backend Development

```bash
cd tough/tough-backend
source venv/bin/activate  # Activate virtual environment
python -m src.app         # Run the Flask app
```

### Build for Production

```bash
# Frontend
cd tough/front-end
npm run build

# Backend - Using Gunicorn
cd tough/tough-backend
source venv/bin/activate
gunicorn -w 4 -b 0.0.0.0:3001 "src.app:create_app()"
```

## 🔒 Security

- ✅ API keys stored server-side only
- ✅ OAuth tokens encrypted and stored securely
- ✅ CORS configured for frontend access only
- ✅ Helmet.js for security headers
- ✅ Environment variables for sensitive data
- ✅ No sensitive data in browser localStorage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Flask](https://flask.palletsprojects.com/)
- Google APIs integration via [google-api-python-client](https://github.com/googleapis/google-api-python-client)
- UI components inspired by modern chat interfaces

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/rdarshan927/tough/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rdarshan927/tough/discussions)
- **Documentation**: [SETUP.md](./SETUP.md)

## 🗺️ Roadmap

- [ ] Add more MCP tools (Gmail, Drive, etc.)
- [ ] Implement conversation history persistence
- [ ] Add user authentication and multi-user support
- [ ] Mobile app development
- [ ] Voice input/output support
- [ ] Plugin system for custom MCP tools

---

Made with ❤️ by the Tough Team
