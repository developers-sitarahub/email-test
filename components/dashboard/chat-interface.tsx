"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Code, Copy, Check } from "lucide-react";
import Markdown from "markdown-to-jsx";
import axios from "axios";

interface Message {
    role: "user" | "model";
    content: string;
}

interface ChatInterfaceProps {
  onApplyPrompt: (prompt: string) => void;
  csvHeaders?: string[];
  session: any;
}

function CodeBlock({ children, onApply }: { children: any; onApply: (text: string) => void }) {
  const [copied, setCopied] = useState(false);
  
  // Try to safely extract raw text from children
  let rawText = "";
  if (typeof children === "string") {
    rawText = children;
  } else if (children?.props?.children) {
    if (typeof children.props.children === "string") {
      rawText = children.props.children;
    } else if (Array.isArray(children.props.children)) {
      rawText = children.props.children.map((c: any) => typeof c === "string" ? c : c?.props?.children || "").join("");
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-3 mb-3 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border text-xs text-muted-foreground">
        <span>Template / Snippet</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={() => onApply(rawText)}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            title="Apply as Master Prompt"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
      <pre className="bg-background p-3 text-xs overflow-x-auto whitespace-pre-wrap">
        {children}
      </pre>
    </div>
  );
}

export function ChatInterface({ onApplyPrompt, csvHeaders, session }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "model", 
      content: `Hi ${session?.user?.name?.split(" ")[0] || "there"}! I'm your AI Outreach Assistant. Tell me who you want to email and what the goal is, and I'll help you craft the perfect personalized email template. \n\n*Tip:* You can use variables like \`{{name}}\` or \`{{company}}\`.` 
    }
  ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        if (isInitialRender) {
            setIsInitialRender(false);
            return;
        }
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user" as const, content: input }];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await axios.post("/api/chat", {
                messages: newMessages,
                csvData: csvHeaders ? [csvHeaders] : [] // pass just headers to give context
            });

            setMessages([...newMessages, { role: "model", content: response.data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: "model", content: "Sorry, I ran into an error connecting to Gemini. Make sure your GEMINI_API_KEY is set." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplySnippet = (snippet: string) => {
        onApplyPrompt(snippet);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl shadow-accent/5 dark:shadow-none flex flex-col h-[500px]"
        >
            <div className="px-4 sm:px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 via-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg shadow-accent/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">AI Email Assistant</h2>
                        <p className="text-xs text-muted-foreground">Chat with Gemini</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "model" && (
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-accent" />
                            </div>
                        )}
                        <div className={`text-sm py-2.5 px-4 rounded-2xl max-w-[85%] ${msg.role === "user"
                                ? "bg-primary text-white rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}>
                            {msg.role === "model" ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <Markdown
                                        options={{
                                            overrides: {
                                                pre: {
                                                    component: ({ children, ...props }: any) => {
                                                        return <CodeBlock onApply={handleApplySnippet}>{children}</CodeBlock>;
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </Markdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-accent" />
                        </div>
                        <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                    </div>
                )}
                <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 border-t border-border bg-background">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Gemini to draft an email..."
                        className="flex-1 bg-input border border-border text-foreground px-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-50 hover:bg-accent/90 transition-colors"
                    >
                        <Send className="w-4 h-4 -ml-0.5" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
