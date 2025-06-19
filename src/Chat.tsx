import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setProvider,
  setGroqKey,
  setOpenAIKey,
  setAnthropicKey,
  setTogetherKey,
  setOllamaUrl
} from './Store';
import type { RootState, AppDispatch, Provider } from './Store';
import styles from './Chat.module.css';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
}

const MODELS: ModelConfig[] = [
  // --- Groq models (supported as of June 2025) ---
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', provider: 'groq' },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', provider: 'groq' },
  { id: 'llama3-70b-8192', name: 'Llama 3 70B 8K', provider: 'groq' },
  { id: 'llama3-8b-8192', name: 'Llama 3 8B 8K', provider: 'groq' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant', provider: 'groq' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'groq' },
  { id: 'meta-llama/llama-guard-4-12b', name: 'Llama Guard 4 12B', provider: 'groq' },
  { id: 'llama-guard-3-8b', name: 'Llama Guard 3 8B', provider: 'groq' },
  { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Llama Prompt Guard 2 22M', provider: 'groq' },
  { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Llama Prompt Guard 2 86M', provider: 'groq' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B IT', provider: 'groq' },
  { id: 'mistral-saba-24b', name: 'Mistral Saba 24B', provider: 'groq' },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', provider: 'groq' },
  { id: 'qwen-qwq-32b', name: 'Qwen QWQ 32B', provider: 'groq' },
  // Add more if needed from your table...
  // (You can skip audio/whisper models unless you support those features)
  
  // --- OpenAI models ---
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },

  // --- Anthropic models ---
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },

  // --- Together.ai models ---
  { id: 'meta-llama/Llama-3-70b-chat', name: 'Llama 3 70B', provider: 'together' },
  { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B Instruct', provider: 'together' },

  // --- Ollama models ---
  { id: 'llama3', name: 'Llama 3', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral', provider: 'ollama' },
  { id: 'gemma', name: 'Gemma', provider: 'ollama' },
];

const EXAMPLE_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a poem about artificial intelligence",
  "How do I improve my programming skills?",
  "What are some healthy meal prep ideas?"
];

const getProviderEndpoint = (provider: Provider, ollamaUrl?: string): string => {
  switch (provider) {
    case 'groq':
      return 'https://api.groq.com/openai/v1/chat/completions';
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'together':
      return 'https://api.together.xyz/v1/chat/completions';
    case 'ollama':
      return `${ollamaUrl || 'http://localhost:11434'}/api/chat`;
    default:
      return 'https://api.groq.com/openai/v1/chat/completions';
  }
};

const getAuthHeaders = (
  provider: Provider,
  groqKey: string,
  openaiKey: string,
  anthropicKey: string,
  togetherKey: string,
): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (provider) {
    case 'groq':
      headers['Authorization'] = `Bearer ${groqKey}`;
      break;
    case 'openai':
      headers['Authorization'] = `Bearer ${openaiKey}`;
      break;
    case 'anthropic':
      headers['x-api-key'] = anthropicKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'together':
      headers['Authorization'] = `Bearer ${togetherKey}`;
      break;
    case 'ollama':
      // Ollama doesn't need auth
      break;
  }

  return headers;
};

const formatRequestBody = (provider: Provider, model: string, messages: Message[]): string => {
  switch (provider) {
    case 'anthropic':
      return JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 4096,
      });
    case 'ollama':
      return JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
      });
    default:
      // OpenAI-compatible format (works for Groq, OpenAI, Together)
      return JSON.stringify({
        model: model,
        messages: messages,
      });
  }
};

const parseResponse = async (
  response: Response,
  provider: Provider
): Promise<{ role: string; content: string }> => {
  const data = await response.json();
  
  switch (provider) {
    case 'anthropic':
      return {
        role: 'assistant',
        content: data.content?.[0]?.text || '',
      };
    case 'ollama':
      return {
        role: 'assistant',
        content: data.message?.content || '',
      };
    default:
      // OpenAI-compatible format (works for Groq, OpenAI, Together)
      return data.choices?.[0]?.message || { role: 'assistant', content: '' };
  }
};

// Add this function to process AI responses before displaying them
const processToughAgentResponse = (content: string): string => {
  // First, apply the identity replacement rules
  let processedContent = content
    // Replace model self-identifications
    .replace(/I(?:'|')?m an? (AI|artificial intelligence|language model|LLM|chatbot|assistant).+?(\.|$)/gi, 
             "I'm Tough Agent, your advanced AI assistant.$2")
    .replace(/(?:I am|I'm|I'm|as an?) (?:an? )?(AI language model|AI assistant|assistant|ChatGPT|GPT|Claude|Llama|Mistral|language model|LLM|AI)/gi, 
             "I'm Tough Agent")
    .replace(/(?:my name is|I am called|I'm called|I go by) .+?(\.|,|\n|$)/gi, 
             "I am Tough Agent$1")
    .replace(/I don't have a (personal name|name|identity)/gi, 
             "My name is Tough Agent")
    // Handle company/creator references
    .replace(/I was (created|developed|made|trained|designed|built|developed) by (OpenAI|Anthropic|Meta|Google|Together|Mistral|Microsoft|Cohere)/gi, 
             "I was developed by the Tough team")
    .replace(/I('m| am) a (Meta|OpenAI|Anthropic|Google|Microsoft)-designed model/gi,
             "I'm a Tough-designed model")
    .replace(/I('m| am) (Meta|OpenAI|Anthropic|Google|Microsoft)'s/gi,
             "I'm Tough's")
    // Replace major model names
    .replace(/(Claude|GPT|ChatGPT|Llama|Mistral|Mixtral|Gemma|Anthropic|OpenAI|Groq|Bard|PaLM|Gemini|Copilot)/gi, 
             "Tough Agent")
    // Handle specific phrases
    .replace(/"Tough Agent" isn['']t a well-known term or reference/gi,
             "I am Tough Agent, your advanced AI assistant")
    // Additional patterns for variations
    .replace(/from (OpenAI|Meta|Anthropic|Google|Microsoft)/gi,
             "from Tough")
    .replace(/trained on|powered by/gi,
             "created by Tough using")
    // Handle adaptable/adaptive responses
    .replace(/(adapt|design)ed (by|to|for) (Meta|OpenAI|Anthropic|Google|Mistral|Together)/gi,
             "$1ed by Tough");
  
  // Now make responses more readable by enhancing formatting
  
  // Convert plain asterisk bullet points to Markdown
  processedContent = processedContent.replace(/^\s*\*\s+(.+)$/gm, '* $1');
  
  // Convert numbered lists to Markdown
  processedContent = processedContent.replace(/^\s*(\d+)\.\s+(.+)$/gm, '$1. $2');
  
  // Make "Pros:" and "Cons:" sections stand out with Markdown headers
  processedContent = processedContent.replace(/\*\*(Pros|Cons|Benefits|Drawbacks|Advantages|Disadvantages):\*\*/g, '### $1');
  
  // Make section titles into headers
  processedContent = processedContent.replace(/\*\*([\w\s]+):\*\*/g, '## $1');
  
  // Add code block formatting if we detect what looks like unformatted code
  processedContent = processedContent.replace(
    /```([\s\S]*?)```/g, 
    (match, code) => {
      // If there's no language specified after the opening ```, add one
      if (!match.startsWith("```javascript") && !match.startsWith("```python") && 
          !match.startsWith("```java") && !match.startsWith("```c") &&
          !match.startsWith("```cpp") && !match.startsWith("```html") &&
          !match.startsWith("```css") && !match.startsWith("```bash")) {
        // Try to detect the language
        if (code.includes('function') || code.includes('const ') || code.includes('let ')) {
          return "```javascript" + code + "```";
        } else if (code.includes('def ') || code.includes('import ')) {
          return "```python" + code + "```";
        } else if (code.includes('public ') || code.includes('class ')) {
          return "```java" + code + "```";
        } else if (code.includes('<html>') || code.includes('<div>')) {
          return "```html" + code + "```";
        } else if (code.includes('@media') || code.includes('.class {')) {
          return "```css" + code + "```";
        } else {
          // Default to generic code formatting
          return "```" + code + "```";
        }
      }
      return match;
    }
  );

  return processedContent;
};

const Chat: React.FC = () => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [ollamaUrlInput, setOllamaUrlInput] = useState('http://localhost:11434');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const {
    provider,
    groqKey,
    openaiKey,
    anthropicKey,
    togetherKey,
    ollamaUrl,
  } = useSelector((state: RootState) => state.api);
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('meta-llama/llama-4-scout-17b-16e-instruct');
  const endMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update model when provider changes
  useEffect(() => {
    const defaultModel = MODELS.find(m => m.provider === provider);
    if (defaultModel) {
      setModel(defaultModel.id);
    }
  }, [provider]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (endMessagesRef.current) {
      endMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const currentApiKey = (): string => {
    switch (provider) {
      case 'groq':
        return groqKey;
      case 'openai':
        return openaiKey;
      case 'anthropic':
        return anthropicKey;
      case 'together':
        return togetherKey;
      case 'ollama':
        return 'N/A'; // Ollama doesn't use API keys
      default:
        return '';
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    if (provider !== 'ollama' && !currentApiKey()) {
      setError('API key is required for this provider');
      return;
    }
    
    setLoading(true);
    setError(null);

    const newMessages = [...messages, { role: 'user' as const, content: prompt }];
    setMessages(newMessages);
    setPrompt('');

    try {
      const endpoint = getProviderEndpoint(provider, ollamaUrl);
      const headers = getAuthHeaders(provider, groqKey, openaiKey, anthropicKey, togetherKey);
      const body = formatRequestBody(provider, model, newMessages);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const aiMessage = await parseResponse(response, provider);
      
      if (aiMessage && typeof aiMessage.content === 'string') {
        // Process the response to maintain the Tough Agent identity
        const processedContent = processToughAgentResponse(aiMessage.content);
        
        const typedMessage: Message = {
          role: 'assistant',
          content: processedContent // Use the processed content
        };
        setMessages([...newMessages, typedMessage]);
      } else {
        setError('No valid response received from AI.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`API Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApiKeySave = () => {
    switch (provider) {
      case 'groq':
        dispatch(setGroqKey(apiKeyInput));
        break;
      case 'openai':
        dispatch(setOpenAIKey(apiKeyInput));
        break;
      case 'anthropic':
        dispatch(setAnthropicKey(apiKeyInput));
        break;
      case 'together':
        dispatch(setTogetherKey(apiKeyInput));
        break;
      case 'ollama':
        dispatch(setOllamaUrl(ollamaUrlInput));
        break;
    }
    setApiKeyInput('');
    setOllamaUrlInput('http://localhost:11434');
  };

  const handleProviderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setProvider(e.target.value as Provider));
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const getAvailableModels = () => {
    return MODELS.filter(m => m.provider === provider);
  };

  const getProviderDisplayName = (provider: Provider): string => {
    switch (provider) {
      case 'groq':
        return 'Groq';
      case 'openai':
        return 'OpenAI';
      case 'anthropic':
        return 'Anthropic';
      case 'together':
        return 'Together AI';
      case 'ollama':
        return 'Ollama (local)';
      default:
        return 'Unknown Provider';
    }
  };

  return (
    <div className={styles.container} data-watermark="TOUGH">
      {((provider !== 'ollama' && !currentApiKey()) || 
        (provider === 'ollama' && !ollamaUrl)) ? (
        <div className={styles.loginContainer}>
          <h2 className={styles.loginTitle}>
            Configure {getProviderDisplayName(provider)}
          </h2>
          
          <div className={styles.providerSelector}>
            <label htmlFor="provider-select">Select AI Provider:</label>
            <select
              id="provider-select"
              className={styles.select}
              value={provider}
              onChange={handleProviderChange}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <option value="groq">Groq</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="together">Together AI</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          {provider === 'ollama' ? (
            <input
              type="text"
              placeholder="Ollama URL (default: http://localhost:11434)"
              className={styles.loginInput}
              value={ollamaUrlInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setOllamaUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySave()}
            />
          ) : (
            <input
              type="password"
              placeholder={`Enter your ${getProviderDisplayName(provider)} API Key`}
              className={styles.loginInput}
              value={apiKeyInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApiKeySave()}
            />
          )}
          
          <button
            className={styles.loginButton}
            onClick={handleApiKeySave}
          >
            Connect to {getProviderDisplayName(provider)}
          </button>
          
          <p className={styles.disclaimer}>
            {provider === 'ollama' 
              ? "Make sure your Ollama server is running and accessible at the specified URL."
              : "Your API key is stored locally in your browser and never sent to any server other than the selected provider's API."}
          </p>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Tough Chat</h1>
              <div className={styles.providerPill}>
                {getProviderDisplayName(provider)}
              </div>
            </div>
            <div className={styles.modelSelector}>
              <select
                id="provider-select"
                className={styles.select}
                value={provider}
                onChange={handleProviderChange}
                style={{ marginRight: '0.5rem' }}
              >
                <option value="groq">Groq</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="together">Together AI</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
              <select
                id="model-select"
                className={styles.select}
                value={model}
                onChange={handleModelChange}
              >
                {getAvailableModels().map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <div className={styles.chatContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.welcomeIcon}>💬</div>
                <h2 className={styles.welcomeTitle}>How can I help you today?</h2>
                <p className={styles.welcomeSubtitle}>
                  I'm your Tough Agent assistant. Ask me anything!
                </p>
                <div className={styles.suggestions}>
                  {EXAMPLE_PROMPTS.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className={styles.suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`${styles.messageWrapper} ${
                    msg.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                  <div className={styles.messageRole}>
                    {msg.role === 'user' ? (
                      <>
                        <div className={styles.userIcon}>U</div>
                        <span>You</span>
                      </>
                    ) : (
                      <>
                        <div className={styles.assistantIcon}>T</div>
                        <span>Tough Agent</span>
                      </>
                    )}
                  </div>
                  <div className={styles.messageBubble}>
                    <div className={styles.messageContent}>
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
                <div className={styles.messageRole}>
                  <div className={styles.assistantIcon}>T</div>
                  <span>Tough Agent</span>
                </div>
                <div className={styles.loading}>
                  <div className={styles.loadingDot}></div>
                  <div className={styles.loadingDot}></div>
                  <div className={styles.loadingDot}></div>
                </div>
              </div>
            )}
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div ref={endMessagesRef} />
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <div className={styles.textareaContainer}>
                <textarea
                  ref={textareaRef}
                  className={styles.textarea}
                  placeholder="Message Tough Agent..."
                  value={prompt}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  onKeyDown={handlePromptKeyDown}
                  disabled={loading}
                  rows={1}
                />
                <button
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={loading || !prompt.trim()}
                  title="Send message"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
