import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";
import { CHAT_CONFIG } from "../constants/chat";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Bot, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "../hooks/useChat";
import { AVAILABLE_MODELS } from "../types/settings";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const { settings, updateSettings } = useSettings();
  const chat = useChat(settings);
  const [prompt, setPrompt] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const currentModel = React.useMemo(() => {
    return AVAILABLE_MODELS.find((m) => m.id === settings.model) || AVAILABLE_MODELS[0];
  }, [settings.model]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSubmit = React.useCallback(() => {
    if (prompt.trim()) {
      chat.sendMessage(prompt);
      setPrompt("");
    }
  }, [prompt, chat.sendMessage]);

  return (
    <TooltipProvider>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-screen bg-background">
        <header className="border-b bg-background/60 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Chat with {currentModel.name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    {settings.model}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <Info className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="text-sm">
                          <p className="font-medium">Model Information</p>
                          <p className="text-muted-foreground mt-1">LLaMA is a powerful language model optimized for chat interactions.</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </p>
                </div>
              </div>

              <SettingsDialog settings={settings} onUpdate={updateSettings} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
          <div className="max-w-3xl mx-auto p-4 space-y-6 relative">
            {chat.connectionStatus === "disconnected" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription className="mt-2">
                  Cannot connect to Ollama instance. Please make sure:
                  <ul className="list-disc pl-4 mt-2 space-y-1">
                    <li>Ollama is running on your machine</li>
                    <li>The correct API URL is set in the settings</li>
                    <li>CORS is properly configured for this domain</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      chat.checkConnection();
                    }}
                  >
                    Check Connection
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {chat.error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center justify-between">
                <span>{chat.error}</span>
                <Button variant="ghost" size="sm" onClick={chat.clearError} className="text-destructive">
                  Dismiss
                </Button>
              </div>
            )}
            {chat.messages.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 text-muted-foreground">
                <p>No messages yet. Start a conversation!</p>
              </motion.div>
            ) : (
              chat.messages.map((message, i) => <ChatMessage key={i} message={message} />)
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleSubmit}
          onCancel={chat.cancelChat}
          onClear={chat.clearChat}
          isDisabled={chat.isStreaming || chat.connectionStatus === "disconnected"}
          isStreaming={chat.isStreaming}
        />
      </motion.div>
    </TooltipProvider>
  );
}
