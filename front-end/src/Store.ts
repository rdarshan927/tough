import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Provider = 'groq' | 'openai' | 'anthropic' | 'together' | 'ollama' | 'freellmapi';

interface ApiState {
  provider: Provider;
  groqKey: string;
  openaiKey: string;
  anthropicKey: string;
  togetherKey: string;
  ollamaUrl: string;
  freeLLMApiKey: string;
  freeLLMApiUrl: string;
}

const initialState: ApiState = {
  freeLLMApiKey: localStorage.getItem('freellmapi_key') || '',
  freeLLMApiUrl: localStorage.getItem('freellmapi_url') || 'http://localhost:3001/v1',
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
    setFreeLLMApiKey: (state, action: PayloadAction<string>) => {
      state.freeLLMApiKey = action.payload;
      localStorage.setItem('freellmapi_key', action.payload);
    },
    setFreeLLMApiUrl: (state, action: PayloadAction<string>) => {
      state.freeLLMApiUrl = action.payload;
      localStorage.setItem('freellmapi_url', action.payload);
    },
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
  setFreeLLMApiKey,
  setFreeLLMApiUrl,
  setGroqKey, 
  setOpenAIKey, 
  setAnthropicKey, 
  setTogetherKey,
  setOllamaUrl 
} = apiSlice.actions;

const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
  },
});

// Export these types so they can be used in other files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;