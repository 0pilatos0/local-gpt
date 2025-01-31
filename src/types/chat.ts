export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
  timestamp: number;
}

export interface ChatResponseMessage {
  role: "assistant";
  content: string;
}

export interface ChatResponse {
  message?: ChatResponseMessage;
  done?: boolean;
  error?: string;
}

export class ChatError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export type ConnectionStatus = "connected" | "disconnected" | "checking";

export type ChatState = {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
};

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_LAST_MESSAGE"; payload: string }
  | { type: "SET_STREAMING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "CLEAR_CHAT" }
  | { type: "SET_CONNECTION_STATUS"; payload: ConnectionStatus };
