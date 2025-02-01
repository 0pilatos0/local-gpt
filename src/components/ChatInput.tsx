import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, X, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onClear: () => void;
  isDisabled: boolean;
  isStreaming: boolean;
}

export function ChatInput({ value, onChange, onSubmit, onCancel, onClear, isDisabled, isStreaming }: ChatInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const focusInput = React.useCallback(() => {
    // Small delay to ensure focus works after state updates
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  React.useEffect(() => {
    focusInput();
  }, [focusInput, value, isStreaming]);

  React.useEffect(() => {
    // Focus input on mount
    focusInput();

    // Handle focus when clicking outside the input
    const handleFocusOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("form")) {
        focusInput();
      }
    };

    document.addEventListener("mouseup", handleFocusOut);
    return () => document.removeEventListener("mouseup", handleFocusOut);
  }, [focusInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isStreaming) {
      onCancel();
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm sticky bottom-0 px-4 py-3 shadow-lg">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-2">
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.1 }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onClear} variant="outline" size="sm" className="text-muted-foreground gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear chat
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear all messages</TooltipContent>
            </Tooltip>
          </motion.div>

          <AnimatePresence mode="wait">
            {isStreaming && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                style={{ willChange: "transform" }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={onCancel} variant="destructive" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Stop generating (Esc)</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isDisabled}
              className={cn("transition-colors duration-150", "border-2 focus-visible:ring-offset-1", isStreaming && "opacity-50")}
              autoComplete="off"
              autoFocus
            />
          </div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }}>
            <Button
              disabled={isDisabled}
              type="submit"
              className={cn("transition-all duration-150", "bg-gradient-to-r from-blue-500 to-blue-600", "hover:shadow-md hover:shadow-blue-500/20")}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isStreaming ? "loading" : "send"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
