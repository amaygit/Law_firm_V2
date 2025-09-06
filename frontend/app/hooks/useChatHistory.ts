import { useState, useEffect } from "react";
import { fetchData, postData } from "@/lib/fetch-util";

// Assuming you're storing sessions uniquely per user-case
export function useChatHistory(sessionId: string) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch history on mount (only once)
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const data = await fetchData<{ messages: any[] }>(`/ai/history?sessionId=${sessionId}`);
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load previous history", err);
      }
    };

    if (sessionId) loadChatHistory();
  }, [sessionId]);

  // ✅ Send message + trigger AI reply
  const sendPrompt = async (prompt: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: prompt }]);

    try {
      const data = await postData<{ response: string; history: any[] }>("/ai/ask", {
        prompt,
        sessionId,
      });
      setMessages(data.history || []);
      return data.response;
    } catch (err) {
      console.error("AI send failed", err);
      return "Something went wrong.";
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendPrompt, loading };
}
