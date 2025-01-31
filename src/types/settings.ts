export interface Settings {
  apiUrl: string;
  model: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiUrl: "http://localhost:11434/api/chat",
  model: "llama2",
};

export const AVAILABLE_MODELS = [
  { id: "llama2", name: "LLaMA 2" },
  { id: "mistral", name: "Mistral" },
  { id: "codellama", name: "CodeLLaMA" },
  { id: "neural-chat", name: "Neural Chat" },
] as const;
