"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Code } from "lucide-react";
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

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
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
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-accent/5 via-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-primary shadow-lg shadow-accent/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-foreground">AI Email Assistant</h2>
                        <p className="text-xs text-muted-foreground">Chat with Gemini to perfect your template</p>
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
                                                        // Extract raw text to apply as prompt
                                                        const rawText = children?.props?.children || "";
                                                        return (
                                                            <div className="relative group mt-2 mb-2">
                                                                <pre {...props} className="bg-background border border-border p-3 flex rounded-lg text-xs overflow-x-auto">
                                                                    {children}
                                                                </pre>
                                                                <button
                                                                    onClick={() => handleApplySnippet(rawText)}
                                                                    className="absolute top-2 right-2 bg-accent hover:bg-accent/80 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Apply as Master Prompt"
                                                                >
                                                                    <Code className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                }
                                            }
                                        }}
                                    >
                                        {msg.content}
                                    </Markdown>
                                    <p className="text-[10px] mt-2 opacity-60 italic">Hover over any code block to apply it to your Master Prompt.</p>
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
