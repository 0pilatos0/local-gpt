import * as React from "react";
import { Message } from "../types/chat";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === "user";
  const timeString = new Date(message.timestamp).toLocaleTimeString();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-3 max-w-[80%] group", isUser && "flex-row-reverse")}>
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isUser ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-neutral-500 to-neutral-600"
          )}
        >
          {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeString}</span>
          </div>

          <Card
            className={cn(
              "shadow-sm transition-shadow hover:shadow-md",
              isUser && "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent"
            )}
          >
            <CardContent className="p-3 relative group">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      if (!inline && language) {
                        return (
                          <SyntaxHighlighter style={oneDark} language={language} PreTag="div" className="rounded-md" {...props}>
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        );
                      }

                      return inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <SyntaxHighlighter style={oneDark} language="text" PreTag="div" className="rounded-md" {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              <div className={cn("absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity", "flex items-center gap-1")}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy message"}</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
