import * as React from "react";
import { ChatState, ChatAction, Message } from "../types/chat";
import { ChatService } from "../services/chat";
import { CHAT_CONFIG } from "../constants/chat";
import { Settings } from "../types/settings";

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };
    case "UPDATE_LAST_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((msg, i) => (i === state.messages.length - 1 ? { ...msg, content: action.payload } : msg)),
      };
    case "SET_STREAMING":
      return { ...state, isStreaming: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "CLEAR_CHAT":
      return {
        ...state,
        messages: [],
        error: null,
      };
    default:
      return state;
  }
}

export function useChat(settings: Settings) {
  const [state, dispatch] = React.useReducer(chatReducer, initialState);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const cancelChat = React.useCallback(() => {
    abortControllerRef.current?.abort();
    dispatch({ type: "SET_STREAMING", payload: false });
  }, []);

  const clearChat = React.useCallback(() => {
    dispatch({ type: "CLEAR_CHAT" });
  }, []);

  const sendMessage = React.useCallback(
    async (content: string) => {
      if (!content.trim() || state.isStreaming) return;

      const userMessage: Message = {
        role: "user",
        content,
        timestamp: Date.now(),
      };

      dispatch({ type: "ADD_MESSAGE", payload: userMessage });
      dispatch({ type: "SET_STREAMING", payload: true });

      abortControllerRef.current = new AbortController();

      try {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            role: "assistant",
            content: "",
            timestamp: Date.now(),
          },
        });

        await ChatService.streamChat(
          [...state.messages, userMessage],
          (content) => {
            dispatch({ type: "UPDATE_LAST_MESSAGE", payload: content });
          },
          settings,
          abortControllerRef.current.signal
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          dispatch({ type: "UPDATE_LAST_MESSAGE", payload: "[Cancelled]" });
          return;
        }
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : CHAT_CONFIG.DEFAULT_ERROR_MESSAGE,
        });
      } finally {
        dispatch({ type: "SET_STREAMING", payload: false });
        abortControllerRef.current = null;
      }
    },
    [state.messages, state.isStreaming, settings]
  );

  return {
    messages: state.messages,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    cancelChat,
    clearChat,
  };
}
