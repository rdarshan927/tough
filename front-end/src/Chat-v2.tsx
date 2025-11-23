import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProvider } from './Store';
import type { RootState, AppDispatch, Provider } from './Store';
import styles from './Chat.module.css';
import MarkdownRenderer from './MarkdownRenderer';
import { sendMessage, checkAuthStatus, getGoogleAuthUrl } from './api/client';
import type { Message } from './api/client';

interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
}

const MODELS: ModelConfig[] = [
  // Groq models
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', provider: 'groq' },
  { id: 'meta-llama/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick 17B', provider: 'groq' },
  { id: 'llama3-70b-8192', name: 'Llama 3 70B 8K', provider: 'groq' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile', provider: 'groq' },
  
  // OpenAI models
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },

  // Anthropic models
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },

  // Together.ai models
  { id: 'meta-llama/Llama-3-70b-chat', name: 'Llama 3 70B', provider: 'together' },
  { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', provider: 'together' },

  // Ollama models
  { id: 'llama3', name: 'Llama 3', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral', provider: 'ollama' },
];

const EXAMPLE_PROMPTS = [
  "Show me my calendar for this week",
  "Create a task to review project documentation",
  "Take a note about today's meeting",
  "What's on my todo list?"
];

const Chat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('meta-llama/llama-4-scout-17b-16e-instruct');
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(false);
  
  const { provider } = useSelector((state: RootState) => state.api);
  const dispatch = useDispatch<AppDispatch>();
  
  const endMessagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check Google auth status on mount
  useEffect(() => {
    checkAuthStatus()
      .then(data => setIsGoogleAuthed(data.authenticated))
      .catch(() => setIsGoogleAuthed(false));
  }, []);

  // Update model when provider changes
  useEffect(() => {
    const defaultModel = MODELS.find(m => m.provider === provider);
    if (defaultModel) {
      setModel(defaultModel.id);
    }
  }, [provider]);

  // Auto-scroll to bottom
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

  const handleGoogleAuth = async () => {
    try {
      const authUrl = await getGoogleAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=700');
      
      // Poll for auth status
      const pollInterval = setInterval(async () => {
        const status = await checkAuthStatus();
        if (status.authenticated) {
          setIsGoogleAuthed(true);
          clearInterval(pollInterval);
        }
      }, 2000);

      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (err) {
      setError('Failed to initiate Google authentication');
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);

    const newMessages: Message[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setPrompt('');

    try {
      const response = await sendMessage(newMessages, provider, model);
      
      const aiMessage: Message = {
        role: 'assistant',
        content: response.content
      };
      
      setMessages([...newMessages, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Error: ${errorMessage}`);
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
    const names: Record<Provider, string> = {
      groq: 'Groq',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      together: 'Together AI',
      ollama: 'Ollama'
    };
    return names[provider];
  };

  return (
    <div className={styles.container} data-watermark="TOUGH">
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Tough Chat</h1>
          <div className={styles.providerPill}>
            {getProviderDisplayName(provider)}
          </div>
          {!isGoogleAuthed && (
            <button 
              onClick={handleGoogleAuth}
              className={styles.authButton}
              style={{ 
                marginLeft: '1rem', 
                padding: '0.5rem 1rem', 
                background: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Connect Google
            </button>
          )}
          {isGoogleAuthed && (
            <span style={{ marginLeft: '1rem', color: '#10b981', fontSize: '0.875rem' }}>
              ✓ Google Connected
            </span>
          )}
        </div>
        <div className={styles.modelSelector}>
          <select
            className={styles.select}
            value={provider}
            onChange={handleProviderChange}
            style={{ marginRight: '0.5rem' }}
          >
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="together">Together AI</option>
            <option value="ollama">Ollama</option>
          </select>
          <select
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
              I'm your Tough Agent assistant with Google Calendar, Tasks, and Notes integration!
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
    </div>
  );
};

export default Chat;
