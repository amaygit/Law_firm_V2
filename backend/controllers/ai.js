import axios from "axios";
import ChatMessage from "../models/ChatMessage.js";

// Utility function — RENAME to avoid conflict!
async function fetchUserChatHistory(userId, sessionId, limit = 10) {
  const record = await ChatMessage.findOne({ userId, sessionId });
  return record ? record.messages.slice(-limit) : [];
}

// POST /api-v1/ai/ask
export const askLawAI = async (req, res) => {
  try {
    const { prompt, sessionId } = req.body;
    const userId = req.user._id;

    // Use the renamed helper
    const history = await fetchUserChatHistory(userId, sessionId);

    const messages = [
      {
        role: "system",
        content:
          "You are a professional assistant for Indian law. Only answer questions about Indian law, court cases, statutes, IPC, CrPC, legal procedures, and legal topics relevant to India. Ask clarifying questions when needed and maintain context.",
      },
      ...history,
      { role: "user", content: prompt },
    ];

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",
        messages,
        max_tokens: 512,
        temperature: 0.5,
        web_search_options: {
          user_location: {
            country: "IN",
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data?.choices?.[0]?.message?.content;

    let chat = await ChatMessage.findOne({ userId, sessionId });

    if (!chat) {
      chat = new ChatMessage({
        userId,
        sessionId,
        messages: [],
      });
    }

    chat.messages.push(
      { role: "user", content: prompt },
      { role: "assistant", content: aiReply }
    );

    await chat.save();

    res.json({
      response: aiReply || "No valid answer received. Please try rephrasing your query.",
      history: chat.messages,
    });
  } catch (error) {
    console.error("AI API Error:", error.response?.data || error.message);
    res.status(500).json({
      response: "Something went wrong while processing your request. Please try again later.",
    });
  }
};

// GET /api-v1/ai/history?sessionId=session-abc
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ messages: [], error: "sessionId is required" });
    }

    const chat = await ChatMessage.findOne({ userId, sessionId });
    res.json({ messages: chat ? chat.messages : [] });
  } catch (error) {
    console.error("Error getting chat history:", error.message);
    res.status(500).json({ messages: [], error: "Could not fetch messages" });
  }
};


// DELETE /api-v1/ai/history?sessionId=session-abc
export const deleteChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ success: false, error: "sessionId is required" });
    }

    await ChatMessage.deleteOne({ userId, sessionId });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat history:", error.message);
    res.status(500).json({ success: false, error: "Could not delete chat history" });
  }
};
