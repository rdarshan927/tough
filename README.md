# Tough Chat

A versatile chat interface powered by Tough Agent. Access the app at https://rdarshan927.github.io/tough

## Features

- **Multi-Provider Support**: Works with Groq, OpenAI, Anthropic, Together AI, and Ollama
- **Beautiful UI**: Dark mode interface with syntax highlighting
- **Markdown Support**: Rich text rendering with code blocks
- **Local Storage**: API keys stored securely in your browser
- **Docker Ready**: Easy deployment with Docker

## Quick Start

### Online Version

Visit [https://rdarshan927.github.io/tough](https://rdarshan927.github.io/tough) to use the app immediately.

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/rdarshan927/tough.git
   cd tough
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## Docker Installation

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Option 1: Using Docker Compose (Recommended)

1. **Clone and build**

   ```bash
   git clone https://github.com/rdarshan927/tough.git
   cd tough
   docker-compose up -d
   ```

2. **Access the app**
   Open `http://localhost:3000` in your browser

### Option 2: Using Docker only

1. **Build the image**

   ```bash
   docker build -t tough-chat .
   ```

2. **Run the container**

   ```bash
   docker run -d -p 3000:80 --name tough-chat tough-chat
   ```

3. **Access the app**
   Open `http://localhost:3000` in your browser

### Docker Commands

```bash
# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build -d

# Remove everything including volumes
docker-compose down -v
```

## Configuration

### API Keys

The app requires API keys from your chosen AI provider:

- **Groq**: Get your key from [console.groq.com](https://console.groq.com)
- **OpenAI**: Get your key from [platform.openai.com](https://platform.openai.com)
- **Anthropic**: Get your key from [console.anthropic.com](https://console.anthropic.com)
- **Together AI**: Get your key from [api.together.xyz](https://api.together.xyz)
- **Ollama**: Run locally at `http://localhost:11434`

### Environment Variables (Optional)

Create a `.env` file for default configurations:

```env
VITE_DEFAULT_PROVIDER=groq
VITE_OLLAMA_URL=http://localhost:11434
```

## Using with Ollama (Local AI)

The Docker Compose setup includes Ollama for local AI inference:

1. **Start services**

   ```bash
   docker-compose up -d
   ```

2. **Pull an AI model**

   ```bash
   docker exec -it tough-ollama ollama pull llama3
   ```

3. **Use in the app**
   - Select "Ollama (Local)" as provider
   - Use URL: `http://ollama:11434` (Docker internal network)
   - Or `http://localhost:11434` (if running locally)

## Deployment

### GitHub Pages

```bash
npm run deploy
```

### Docker Production

```bash
# Build production image
docker build -t tough-chat:prod .

# Run in production
docker run -d -p 80:80 --name tough-chat-prod tough-chat:prod
```

## Development

### Project Structure

```
tough/
├── src/
│   ├── Chat.tsx          # Main chat component
│   ├── MarkdownRenderer.tsx # Markdown rendering
│   ├── Store.ts          # Redux store
│   └── ...
├── docker-compose.yml    # Docker services
├── Dockerfile           # Container definition
├── nginx.conf          # Web server config
└── package.json        # Dependencies
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/rdarshan927/tough/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rdarshan927/tough/discussions)

## Acknowledgments

- Built with React, TypeScript, and Vite
- UI inspired by modern chat interfaces
- Supports multiple AI providers for flexibility
