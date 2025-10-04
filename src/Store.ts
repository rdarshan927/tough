import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Provider = 'groq' | 'openai' | 'anthropic' | 'together' | 'ollama';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ApiState {
  provider: Provider;
  groqKey: string;
  openaiKey: string;
  anthropicKey: string;
  togetherKey: string;
  ollamaUrl: string;
}

interface ConversationsState {
  conversations: Conversation[];
  currentConversationId: string | null;
}

const initialState: ApiState = {
  provider: (localStorage.getItem('ai_provider') as Provider) || 'groq',
  groqKey: localStorage.getItem('groq_key') || '',
  openaiKey: localStorage.getItem('openai_key') || '',
  anthropicKey: localStorage.getItem('anthropic_key') || '',
  togetherKey: localStorage.getItem('together_key') || '',
  ollamaUrl: localStorage.getItem('ollama_url') || 'http://localhost:11434',
};

const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<Provider>) => {
      state.provider = action.payload;
      localStorage.setItem('ai_provider', action.payload);
    },
    setGroqKey: (state, action: PayloadAction<string>) => {
      state.groqKey = action.payload;
      localStorage.setItem('groq_key', action.payload);
    },
    setOpenAIKey: (state, action: PayloadAction<string>) => {
      state.openaiKey = action.payload;
      localStorage.setItem('openai_key', action.payload);
    },
    setAnthropicKey: (state, action: PayloadAction<string>) => {
      state.anthropicKey = action.payload;
      localStorage.setItem('anthropic_key', action.payload);
    },
    setTogetherKey: (state, action: PayloadAction<string>) => {
      state.togetherKey = action.payload;
      localStorage.setItem('together_key', action.payload);
    },
    setOllamaUrl: (state, action: PayloadAction<string>) => {
      state.ollamaUrl = action.payload;
      localStorage.setItem('ollama_url', action.payload);
    },
  },
});

export const { 
  setProvider, 
  setGroqKey, 
  setOpenAIKey, 
  setAnthropicKey, 
  setTogetherKey,
  setOllamaUrl 
} = apiSlice.actions;

// Helper functions for localStorage
const loadConversationsFromStorage = (): Conversation[] => {
  try {
    const stored = localStorage.getItem('conversations');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveConversationsToStorage = (conversations: Conversation[]) => {
  try {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversations:', error);
  }
};

const conversationsInitialState: ConversationsState = {
  conversations: loadConversationsFromStorage(),
  currentConversationId: localStorage.getItem('current_conversation_id') || null,
};

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: conversationsInitialState,
  reducers: {
    createConversation: (state, action: PayloadAction<{ title?: string }>) => {
      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: action.payload.title || 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.conversations.unshift(newConversation);
      state.currentConversationId = newConversation.id;
      localStorage.setItem('current_conversation_id', newConversation.id);
      saveConversationsToStorage(state.conversations);
    },
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      state.currentConversationId = action.payload;
      localStorage.setItem('current_conversation_id', action.payload);
    },
    updateConversationMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.messages = action.payload.messages;
        conversation.updatedAt = Date.now();
        
        // Auto-generate title from first user message if still "New Chat"
        if (conversation.title === 'New Chat' && action.payload.messages.length > 0) {
          const firstUserMessage = action.payload.messages.find(m => m.role === 'user');
          if (firstUserMessage) {
            conversation.title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
          }
        }
        
        saveConversationsToStorage(state.conversations);
      }
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = state.conversations[0]?.id || null;
        if (state.currentConversationId) {
          localStorage.setItem('current_conversation_id', state.currentConversationId);
        } else {
          localStorage.removeItem('current_conversation_id');
        }
      }
      saveConversationsToStorage(state.conversations);
    },
    clearAllConversations: (state) => {
      state.conversations = [];
      state.currentConversationId = null;
      localStorage.removeItem('conversations');
      localStorage.removeItem('current_conversation_id');
    },
  },
});

export const {
  createConversation,
  setCurrentConversation,
  updateConversationMessages,
  deleteConversation,
  clearAllConversations,
} = conversationsSlice.actions;

const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
    conversations: conversationsSlice.reducer,
  },
});

// Export these types so they can be used in other files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;