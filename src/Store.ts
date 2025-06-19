import { configureStore, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Provider = 'groq' | 'openai' | 'anthropic' | 'together' | 'ollama';

interface ApiState {
  provider: Provider;
  groqKey: string;
  openaiKey: string;
  anthropicKey: string;
  togetherKey: string;
  ollamaUrl: string;
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

const store = configureStore({
  reducer: {
    api: apiSlice.reducer,
  },
});

// Export these types so they can be used in other files
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;