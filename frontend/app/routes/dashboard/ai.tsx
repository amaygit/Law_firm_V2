import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useChatHistory } from "@/hooks/useChatHistory";
import { deleteData } from "@/lib/fetch-util";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const sessionId = "user-session-unique-id";

// ✅ Chat bubble styles
const bubbleStyles = {
  user: "bg-blue-50 rounded-lg p-3 my-2 self-end w-full max-w-[92vw] md:max-w-[80%] text-base",
  ai: "bg-green-50 rounded-lg p-3 my-2 self-start w-full max-w-[92vw] md:max-w-[80%] text-base border-l-4 border-green-400",
};

// ✅ Spinner while AI replies
const ThinkingLoader = () => (
  <div className="flex justify-center items-center my-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// ✅ Restart confirmation dialog WITH TYPES
interface RestartDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RestartDialog: React.FC<RestartDialogProps> = ({ open, onConfirm, onCancel }) =>
  open ? (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center sm:items-center">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl w-full max-w-sm sm:max-w-xs p-5 shadow-lg animate-slideInUp">
        <h2 className="text-lg font-bold mb-2 text-center">Restart Chat?</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          Are you sure you want to delete all messages for this chat session?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="bg-gray-100 dark:bg-gray-700 px-5 py-2 rounded text-base font-semibold border hover:bg-gray-200 dark:hover:bg-gray-600"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-5 py-2 rounded text-base font-semibold shadow hover:bg-red-600 focus:ring-2 focus:ring-red-400"
            aria-label="Restart"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  ) : null;

// ✅ Restart icon
const RestartIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8.5V4.5h4M16.5 11.5a6 6 0 10-6 6M16.5 13.5V11.5h-2" />
  </svg>
);

const AILawAssistant = () => {
  const [input, setInput] = useState<string>("");
  const { messages, sendPrompt, loading } = useChatHistory(sessionId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) await sendPrompt(input);
    setInput("");
  };

  const openRestartDialog = () => setDialogOpen(true);
  const closeRestartDialog = () => setDialogOpen(false);

  const doRestart = async () => {
    await deleteData(`/ai/history?sessionId=${sessionId}`);
    setDialogOpen(false);
    setInput("");
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900 text-foreground relative">
      {/* Header */}
      <div className="flex justify-center items-center py-3 border-b border-gray-200 dark:border-gray-800 bg-background sticky top-0 z-10">
        {/* <h1 className="text-base font-bold text-center flex-1 truncate">Law AI Assistant</h1>
         */}
         <h1
  className="
    text-base sm:text-lg
    
    font-bold
    text-gray-800
    dark:text-gray-200
    text-left
    py-2
    px-3
  "
>
  VakilBot: Your AI Legal Assistant
</h1>

        <button
          onClick={openRestartDialog}
          className="absolute right-4 top-3 sm:static sm:ml-auto bg-white dark:bg-gray-800 shadow-md rounded-full p-2 border border-gray-300 dark:border-gray-800 hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-300"
          aria-label="Restart Chat"
          title="Restart Chat (clear all messages)"
        >
          <RestartIcon />
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-y-auto px-2 py-2 relative" style={{ minHeight: 0 }}>
        {messages.length === 0 && !loading && (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
            Start your legal questions and get help instantly.
          </p>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={msg.role === "user" ? bubbleStyles.user : bubbleStyles.ai}>
              <ReactMarkdown
                components={{
                  ul: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  h2: ({ children }) => (
                    <h2 className="mt-2 mb-1 text-lg font-bold text-green-700">{children}</h2>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
        {loading && <ThinkingLoader />}
      </div>

      {/* Restart confirmation dialog */}
      <RestartDialog
        open={dialogOpen}
        onConfirm={doRestart}
        onCancel={closeRestartDialog}
      />

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 px-3 py-2 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 sticky bottom-0 left-0 right-0"
        style={{ zIndex: 10 }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your legal scenario or respond to AI questions..."
          className="flex-1 resize-none text-base"
          rows={1}
          disabled={loading}
        />
        <Button type="submit" disabled={loading} className="min-w-[72px]">
          {loading ? "Thinking…" : "Ask"}
        </Button>
      </form>
    </div>
  );
};

export default AILawAssistant;
