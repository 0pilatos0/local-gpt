export interface Settings {
  apiUrl: string;
  model: string;
}

export const DEFAULT_SETTINGS: Settings = {
  apiUrl: "http://localhost:11434/api/chat",
  model: "llama3.2",
};

export const AVAILABLE_MODELS = [
  { id: "llama3.2", name: "Llama 3.2", description: "General-purpose language model" },
  //   { id: "mistral", name: "Mistral", description: "Fast and efficient language model" },
  //   { id: "codellama", name: "CodeLLaMA", description: "Specialized for code generation" },
  //   { id: "neural-chat", name: "Neural Chat", description: "Optimized for conversations" },
] as const;
