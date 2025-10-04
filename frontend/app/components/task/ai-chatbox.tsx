// frontend/app/components/task/ai-chatbox.tsx
import React, { useState, useEffect, useRef } from "react";
import { Bot, Send, X, Loader2, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SimilarCase {
  title: string;
  url: string;
  snippet: string;
}

interface AIChatboxProps {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

export const AIChatbox: React.FC<AIChatboxProps> = ({
  taskId,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [summary, setSummary] = useState("");
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [caseTitle, setCaseTitle] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeAI();
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeAI = async () => {
    setIsInitializing(true);
    try {
      console.log(`🤖 Initializing AI for task: ${taskId}`);

      const response = await axios.get(
        `${API_URL}/ai/case/${taskId}/initialize`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("✅ AI initialized successfully:", response.data);

      const { summary, similarCases, caseTitle } = response.data;

      setSummary(summary);
      setSimilarCases(similarCases || []); // ✅ Store similar cases separately
      setCaseTitle(caseTitle);

      // ✅ Only add summary message, NOT similar cases message
      const welcomeMessage: Message = {
        role: "assistant",
        content: `**Case Summary:**\n\n${summary}`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } catch (error: any) {
      console.error("Error initializing AI:", error);

      if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
        toast.error(
          `Failed to initialize AI: ${
            error.response.data?.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Request error:", error.request);
        toast.error(
          "Failed to connect to AI service. Check if backend is running."
        );
      } else {
        console.error("Error:", error.message);
        toast.error("Failed to initialize AI assistant");
      }

      const errorMessage: Message = {
        role: "assistant",
        content:
          "Hello! I'm your legal AI assistant. I can help you with:\n\n• This case's details and progress\n• Legal advice and precedents\n• Similar cases from Indian legal history\n• Legal concepts and procedures\n\nWhat would you like to know?",
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    } finally {
      setIsInitializing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log(`💬 Sending message for task ${taskId}:`, inputMessage);

      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await axios.post(
        `${API_URL}/ai/case/${taskId}/chat`,
        {
          message: inputMessage,
          chatHistory,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("✅ AI response received:", response.data);

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);

      let errorMsg =
        "I apologize, but I'm having trouble processing your request. Please try again.";

      if (error.response) {
        console.error(
          "Response error:",
          error.response.status,
          error.response.data
        );
        errorMsg = error.response.data?.message || errorMsg;
      } else if (error.request) {
        console.error("Request error:", error.request);
        errorMsg = "Cannot reach AI service. Please check your connection.";
      }

      const errorMessage: Message = {
        role: "assistant",
        content: errorMsg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-2">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">
                  Legal AI Assistant
                </CardTitle>
                <p className="text-xs opacity-90 mt-0.5">
                  {caseTitle || "Case Analysis"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ✅ FIXED: Similar Cases - Always at Top, Above Messages */}
          {similarCases.length > 0 && !isInitializing && (
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <h3 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Similar Legal Precedents
              </h3>
              <div className="space-y-2">
                {similarCases.map((caseItem, index) => (
                  <a
                    key={index}
                    href={caseItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-amber-900 line-clamp-1">
                            {caseItem.title}
                          </h4>
                          <ExternalLink className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        </div>
                        <p className="text-xs text-amber-700 mt-1 line-clamp-2">
                          {caseItem.snippet}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="h-96 p-4" ref={scrollRef}>
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing case details...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "px-4 py-2 rounded-lg max-w-[85%]",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-1",
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-100">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this case or legal concepts..."
                disabled={isLoading || isInitializing}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading || isInitializing}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ask about case details, hearings, legal advice, or Indian law
              precedents
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
