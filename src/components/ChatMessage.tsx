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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex gap-3 py-2", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex gap-3 max-w-[80%] group relative", isUser && "flex-row-reverse")}>
        <HoverCard>
          <HoverCardTrigger>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer",
                isUser ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25" : "bg-gradient-to-br from-neutral-500 to-neutral-600",
                "shadow-lg"
              )}
            >
              {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
            </motion.div>
          </HoverCardTrigger>
          <HoverCardContent className="w-48">
            <div className="flex flex-col gap-2">
              <p className="font-medium">{isUser ? "You" : "Assistant"}</p>
              <p className="text-xs text-muted-foreground">{new Date(message.timestamp).toLocaleString()}</p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <div className="flex flex-col gap-1">
          <Card
            className={cn(
              "shadow-md transition-all duration-150 relative",
              isUser ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-transparent" : "",
              "group/message"
            )}
          >
            <CardContent className="p-3">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    code({
                      node,
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      node: any;
                      inline?: boolean;
                      className?: string;
                      children?: React.ReactNode;
                    }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      if (!inline && language) {
                        return (
                          <SyntaxHighlighter style={oneDark as any} language={language} PreTag="div" className="rounded-md" {...(props as any)}>
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        );
                      }

                      return inline ? (
                        <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm" {...props}>
                          {children}
                        </code>
                      ) : (
                        <SyntaxHighlighter style={oneDark as any} language="text" PreTag="div" className="rounded-md" {...(props as any)}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              <div
                className={cn(
                  "absolute -right-2 -top-2 flex gap-1 bg-background/80 backdrop-blur-sm rounded-lg p-1",
                  "shadow-lg border opacity-0 group-hover/message:opacity-100 transition-opacity duration-200"
                )}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={copyToClipboard} className="h-7 w-7 rounded-full">
                      <motion.div animate={copied ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.2 }}>
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </motion.div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{copied ? "Copied!" : "Copy message"}</TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-7 w-7 rounded-full">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isUser ? "start" : "end"}>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <Separator className="my-1" />
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
