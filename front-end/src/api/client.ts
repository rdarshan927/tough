export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type Provider = 'groq' | 'openai' | 'anthropic' | 'together' | 'ollama';

// Chat API
export async function sendMessage(messages: Message[], provider: Provider, model: string) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, provider, model }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }

  return response.json();
}

// Auth API
export async function getGoogleAuthUrl() {
  const response = await fetch(`${API_BASE_URL}/auth/google`);
  const data = await response.json();
  return data.authUrl;
}

export async function checkAuthStatus() {
  const response = await fetch(`${API_BASE_URL}/auth/status`);
  return response.json();
}

// MCP API
export async function listMCPTools() {
  const response = await fetch(`${API_BASE_URL}/mcp/tools`);
  return response.json();
}

export async function executeMCPTool(toolName: string, parameters: any) {
  const response = await fetch(`${API_BASE_URL}/mcp/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ toolName, parameters }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to execute MCP tool');
  }

  return response.json();
}
