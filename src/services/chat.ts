import { Message, ChatResponse, ChatError } from "../types/chat";
import { Settings } from "../types/settings";

export class ChatService {
  static async streamChat(messages: Message[], onChunk: (content: string) => void, settings: Settings, signal?: AbortSignal): Promise<ChatResponse> {
    try {
      const response = await fetch(settings.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: settings.model,
          messages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        throw new ChatError(`API error: ${response.statusText}`, response.status.toString());
      }

      if (!response.body) {
        throw new ChatError("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const json = JSON.parse(line) as ChatResponse;
              if (json.message?.content) {
                accumulatedContent += json.message.content;
                onChunk(accumulatedContent);
              }
              if (json.error) {
                throw new ChatError(json.error);
              }
            } catch (e) {
              throw new ChatError("Failed to parse streaming response");
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return {
        message: { role: "assistant", content: accumulatedContent },
      };
    } catch (error) {
      if (error instanceof ChatError) {
        throw error;
      }
      throw new ChatError(error instanceof Error ? error.message : "Unknown error occurred");
    }
  }
}
