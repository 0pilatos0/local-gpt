import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, X, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
    <div className="border-t bg-background px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onClear} variant="ghost" size="sm" className="text-muted-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear chat
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear all messages</TooltipContent>
          </Tooltip>

          {isStreaming && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onCancel} variant="ghost" size="sm" className="text-destructive">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop generating (Esc)</TooltipContent>
            </Tooltip>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isDisabled}
            className="flex-1"
            autoComplete="off"
            autoFocus
            onBlur={(e) => {
              // Prevent focus loss when clicking other UI elements
              if (!e.relatedTarget?.closest("form")) {
                focusInput();
              }
            }}
          />
          <Button disabled={isDisabled} type="submit">
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2">{isStreaming ? "Generating..." : "Send"}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
