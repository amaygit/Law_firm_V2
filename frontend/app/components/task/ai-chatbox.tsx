// // // frontend/app/components/task/ai-chatbox.tsx
// // import React, { useState, useEffect, useRef } from "react";
// // import { Bot, Send, X, Loader2, ExternalLink, TrendingUp } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { ScrollArea } from "@/components/ui/scroll-area";
// // import { toast } from "sonner";
// // import { cn } from "@/lib/utils";
// // import axios from "axios";

// // interface Message {
// //   role: "user" | "assistant";
// //   content: string;
// //   timestamp: Date;
// // }

// // interface SimilarCase {
// //   title: string;
// //   url: string;
// //   snippet: string;
// // }

// // interface AIChatboxProps {
// //   taskId: string;
// //   isOpen: boolean;
// //   onClose: () => void;
// // }

// // const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

// // export const AIChatbox: React.FC<AIChatboxProps> = ({
// //   taskId,
// //   isOpen,
// //   onClose,
// // }) => {
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [inputMessage, setInputMessage] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [isInitializing, setIsInitializing] = useState(true);
// //   const [summary, setSummary] = useState("");
// //   const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
// //   const [caseTitle, setCaseTitle] = useState("");

// //   const scrollRef = useRef<HTMLDivElement>(null);
// //   const inputRef = useRef<HTMLInputElement>(null);

// //   useEffect(() => {
// //     if (isOpen && messages.length === 0) {
// //       initializeAI();
// //     }
// //   }, [isOpen, taskId]);

// //   useEffect(() => {
// //     if (scrollRef.current) {
// //       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
// //     }
// //   }, [messages]);

// //   const initializeAI = async () => {
// //     setIsInitializing(true);
// //     try {
// //       console.log(`🤖 Initializing AI for task: ${taskId}`);

// //       const response = await axios.get(
// //         `${API_URL}/ai/case/${taskId}/initialize`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           },
// //         }
// //       );

// //       console.log("✅ AI initialized successfully:", response.data);

// //       const { summary, similarCases, caseTitle } = response.data;

// //       setSummary(summary);
// //       setSimilarCases(similarCases || []); // ✅ Store similar cases separately
// //       setCaseTitle(caseTitle);

// //       // ✅ Only add summary message, NOT similar cases message
// //       const welcomeMessage: Message = {
// //         role: "assistant",
// //         content: `**Case Summary:**\n\n${summary}`,
// //         timestamp: new Date(),
// //       };

// //       setMessages([welcomeMessage]);
// //     } catch (error: any) {
// //       console.error("Error initializing AI:", error);

// //       if (error.response) {
// //         console.error(
// //           "Response error:",
// //           error.response.status,
// //           error.response.data
// //         );
// //         toast.error(
// //           `Failed to initialize AI: ${
// //             error.response.data?.message || error.response.statusText
// //           }`
// //         );
// //       } else if (error.request) {
// //         console.error("Request error:", error.request);
// //         toast.error(
// //           "Failed to connect to AI service. Check if backend is running."
// //         );
// //       } else {
// //         console.error("Error:", error.message);
// //         toast.error("Failed to initialize AI assistant");
// //       }

// //       const errorMessage: Message = {
// //         role: "assistant",
// //         content:
// //           "Hello! I'm your legal AI assistant. I can help you with:\n\n• This case's details and progress\n• Legal advice and precedents\n• Similar cases from Indian legal history\n• Legal concepts and procedures\n\nWhat would you like to know?",
// //         timestamp: new Date(),
// //       };
// //       setMessages([errorMessage]);
// //     } finally {
// //       setIsInitializing(false);
// //     }
// //   };

// //   const sendMessage = async () => {
// //     if (!inputMessage.trim() || isLoading) return;

// //     const userMessage: Message = {
// //       role: "user",
// //       content: inputMessage,
// //       timestamp: new Date(),
// //     };

// //     setMessages((prev) => [...prev, userMessage]);
// //     setInputMessage("");
// //     setIsLoading(true);

// //     try {
// //       console.log(`💬 Sending message for task ${taskId}:`, inputMessage);

// //       const chatHistory = messages.map((msg) => ({
// //         role: msg.role,
// //         content: msg.content,
// //       }));

// //       const response = await axios.post(
// //         `${API_URL}/ai/case/${taskId}/chat`,
// //         {
// //           message: inputMessage,
// //           chatHistory,
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${localStorage.getItem("token")}`,
// //           },
// //         }
// //       );

// //       console.log("✅ AI response received:", response.data);

// //       const aiMessage: Message = {
// //         role: "assistant",
// //         content: response.data.response,
// //         timestamp: new Date(),
// //       };

// //       setMessages((prev) => [...prev, aiMessage]);
// //     } catch (error: any) {
// //       console.error("Error sending message:", error);

// //       let errorMsg =
// //         "I apologize, but I'm having trouble processing your request. Please try again.";

// //       if (error.response) {
// //         console.error(
// //           "Response error:",
// //           error.response.status,
// //           error.response.data
// //         );
// //         errorMsg = error.response.data?.message || errorMsg;
// //       } else if (error.request) {
// //         console.error("Request error:", error.request);
// //         errorMsg = "Cannot reach AI service. Please check your connection.";
// //       }

// //       const errorMessage: Message = {
// //         role: "assistant",
// //         content: errorMsg,
// //         timestamp: new Date(),
// //       };

// //       setMessages((prev) => [...prev, errorMessage]);
// //       toast.error("Failed to get AI response");
// //     } finally {
// //       setIsLoading(false);
// //       inputRef.current?.focus();
// //     }
// //   };

// //   const handleKeyPress = (e: React.KeyboardEvent) => {
// //     if (e.key === "Enter" && !e.shiftKey) {
// //       e.preventDefault();
// //       sendMessage();
// //     }
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
// //       <Card className="shadow-2xl border-2">
// //         <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center gap-2">
// //               <div className="p-2 bg-white/20 rounded-full">
// //                 <Bot className="w-5 h-5" />
// //               </div>
// //               <div>
// //                 <CardTitle className="text-sm font-semibold">
// //                   Legal AI Assistant
// //                 </CardTitle>
// //                 <p className="text-xs opacity-90 mt-0.5">
// //                   {caseTitle || "Case Analysis"}
// //                 </p>
// //               </div>
// //             </div>
// //             <Button
// //               variant="ghost"
// //               size="icon"
// //               onClick={onClose}
// //               className="text-white hover:bg-white/20"
// //             >
// //               <X className="w-4 h-4" />
// //             </Button>
// //           </div>
// //         </CardHeader>

// //         <CardContent className="p-0">
// //           {/* ✅ FIXED: Similar Cases - Always at Top, Above Messages */}
// //           {similarCases.length > 0 && !isInitializing && (
// //             <div className="p-4 bg-amber-50 border-b border-amber-200">
// //               <h3 className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
// //                 <TrendingUp className="w-3 h-3" />
// //                 Similar Legal Precedents
// //               </h3>
// //               <div className="space-y-2">
// //                 {similarCases.map((caseItem, index) => (
// //                   <a
// //                     key={index}
// //                     href={caseItem.url}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="block p-2 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors"
// //                   >
// //                     <div className="flex items-start gap-2">
// //                       <div className="flex-1 min-w-0">
// //                         <div className="flex items-center gap-2">
// //                           <h4 className="text-xs font-semibold text-amber-900 line-clamp-1">
// //                             {caseItem.title}
// //                           </h4>
// //                           <ExternalLink className="w-3 h-3 text-amber-600 flex-shrink-0" />
// //                         </div>
// //                         <p className="text-xs text-amber-700 mt-1 line-clamp-2">
// //                           {caseItem.snippet}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </a>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //           {/* Messages Area */}
// //           <ScrollArea className="h-96 p-4" ref={scrollRef}>
// //             {isInitializing ? (
// //               <div className="flex items-center justify-center h-full">
// //                 <div className="text-center">
// //                   <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
// //                   <p className="text-sm text-muted-foreground">
// //                     Analyzing case details...
// //                   </p>
// //                 </div>
// //               </div>
// //             ) : (
// //               <div className="space-y-4">
// //                 {messages.map((message, index) => (
// //                   <div
// //                     key={index}
// //                     className={cn(
// //                       "flex gap-2",
// //                       message.role === "user" ? "justify-end" : "justify-start"
// //                     )}
// //                   >
// //                     {message.role === "assistant" && (
// //                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
// //                         <Bot className="w-4 h-4 text-blue-600" />
// //                       </div>
// //                     )}

// //                     <div
// //                       className={cn(
// //                         "px-4 py-2 rounded-lg max-w-[85%]",
// //                         message.role === "user"
// //                           ? "bg-blue-600 text-white"
// //                           : "bg-gray-100 text-gray-900"
// //                       )}
// //                     >
// //                       <div className="text-sm whitespace-pre-wrap">
// //                         {message.content}
// //                       </div>
// //                       <div
// //                         className={cn(
// //                           "text-xs mt-1",
// //                           message.role === "user"
// //                             ? "text-blue-100"
// //                             : "text-gray-500"
// //                         )}
// //                       >
// //                         {message.timestamp.toLocaleTimeString([], {
// //                           hour: "2-digit",
// //                           minute: "2-digit",
// //                         })}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}

// //                 {isLoading && (
// //                   <div className="flex gap-2">
// //                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
// //                       <Bot className="w-4 h-4 text-blue-600" />
// //                     </div>
// //                     <div className="px-4 py-2 rounded-lg bg-gray-100">
// //                       <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </ScrollArea>

// //           {/* Input Area */}
// //           <div className="p-4 border-t">
// //             <div className="flex gap-2">
// //               <Input
// //                 ref={inputRef}
// //                 value={inputMessage}
// //                 onChange={(e) => setInputMessage(e.target.value)}
// //                 onKeyPress={handleKeyPress}
// //                 placeholder="Ask about this case or legal concepts..."
// //                 disabled={isLoading || isInitializing}
// //                 className="flex-1"
// //               />
// //               <Button
// //                 onClick={sendMessage}
// //                 disabled={!inputMessage.trim() || isLoading || isInitializing}
// //                 size="icon"
// //                 className="bg-blue-600 hover:bg-blue-700"
// //               >
// //                 <Send className="w-4 h-4" />
// //               </Button>
// //             </div>
// //             <p className="text-xs text-muted-foreground mt-2">
// //               Ask about case details, hearings, legal advice, or Indian law
// //               precedents
// //             </p>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };
// // frontend/app/components/task/ai-chatbox.tsx
// import React, { useState, useEffect, useRef } from "react";
// import { Bot, Send, X, Loader2, ExternalLink, TrendingUp } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import axios from "axios";

// interface Message {
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface SimilarCase {
//   title: string;
//   url: string;
//   snippet: string;
// }

// interface AIChatboxProps {
//   taskId: string;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

// export const AIChatbox: React.FC<AIChatboxProps> = ({
//   taskId,
//   isOpen,
//   onClose,
// }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isInitializing, setIsInitializing] = useState(true);
//   const [summary, setSummary] = useState("");
//   const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
//   const [caseTitle, setCaseTitle] = useState("");

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       initializeAI();
//     }
//   }, [isOpen, taskId]);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const initializeAI = async () => {
//     setIsInitializing(true);
//     try {
//       console.log(`🤖 Initializing AI for task: ${taskId}`);

//       const response = await axios.get(
//         `${API_URL}/ai/case/${taskId}/initialize`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       console.log("✅ AI initialized successfully:", response.data);

//       const { summary, similarCases, caseTitle } = response.data;

//       setSummary(summary);
//       setSimilarCases(similarCases || []);
//       setCaseTitle(caseTitle);

//       const welcomeMessage: Message = {
//         role: "assistant",
//         content: `**Case Summary:**\n\n${summary}`,
//         timestamp: new Date(),
//       };

//       setMessages([welcomeMessage]);
//     } catch (error: any) {
//       console.error("Error initializing AI:", error);

//       if (error.response) {
//         console.error(
//           "Response error:",
//           error.response.status,
//           error.response.data
//         );
//         toast.error(
//           `Failed to initialize AI: ${
//             error.response.data?.message || error.response.statusText
//           }`
//         );
//       } else if (error.request) {
//         console.error("Request error:", error.request);
//         toast.error(
//           "Failed to connect to AI service. Check if backend is running."
//         );
//       } else {
//         console.error("Error:", error.message);
//         toast.error("Failed to initialize AI assistant");
//       }

//       const errorMessage: Message = {
//         role: "assistant",
//         content:
//           "Hello! I'm your legal AI assistant. I can help you with:\n\n• This case's details and progress\n• General legal advice and Indian law concepts\n• Legal precedents and procedures\n• Case strategies\n\nWhat would you like to know?",
//         timestamp: new Date(),
//       };
//       setMessages([errorMessage]);
//     } finally {
//       setIsInitializing(false);
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage: Message = {
//       role: "user",
//       content: inputMessage,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       console.log(`💬 Sending message for task ${taskId}:`, inputMessage);

//       const chatHistory = messages.map((msg) => ({
//         role: msg.role,
//         content: msg.content,
//       }));

//       const response = await axios.post(
//         `${API_URL}/ai/case/${taskId}/chat`,
//         {
//           message: inputMessage,
//           chatHistory,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       console.log("✅ AI response received:", response.data);

//       // ✅ FIX: Handle empty/blank responses
//       const aiResponseText =
//         response.data.response ||
//         "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";

//       const aiMessage: Message = {
//         role: "assistant",
//         content: aiResponseText,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error: any) {
//       console.error("Error sending message:", error);

//       let errorMsg =
//         "I apologize, but I'm having trouble processing your request. Please try again.";

//       if (error.response) {
//         console.error(
//           "Response error:",
//           error.response.status,
//           error.response.data
//         );
//         errorMsg = error.response.data?.message || errorMsg;
//       } else if (error.request) {
//         console.error("Request error:", error.request);
//         errorMsg = "Cannot reach AI service. Please check your connection.";
//       }

//       const errorMessage: Message = {
//         role: "assistant",
//         content: errorMsg,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, errorMessage]);
//       toast.error("Failed to get AI response");
//     } finally {
//       setIsLoading(false);
//       inputRef.current?.focus();
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] flex flex-col">
//       <Card className="shadow-2xl border-2 flex flex-col h-full overflow-hidden">
//         {/* ✅ Fixed Header (stays visible) */}
//         <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex-shrink-0">
//           <div className="flex items-center justify-between gap-2">
//             <div className="flex items-center gap-2 min-w-0 flex-1">
//               <div className="p-1.5 bg-white/20 rounded-full flex-shrink-0">
//                 <Bot className="w-4 h-4" />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <CardTitle className="text-xs font-semibold truncate leading-tight">
//                   SAJNA Assistant
//                 </CardTitle>
//                 <p className="text-[10px] opacity-90 truncate leading-tight">
//                   {caseTitle || "Case Analysis"}
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={onClose}
//               className="text-white hover:bg-white/20 flex-shrink-0 h-7 w-7 p-0"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </CardHeader>

//         {/* ✅ Make content scrollable (summary + chat + input) */}
//         <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
//           <div className="flex-1 min-h-0 overflow-y-auto">
//             {/* Similar Cases */}
//             {similarCases.length > 0 && !isInitializing && (
//               <div className="p-3 bg-amber-50 border-b border-amber-200">
//                 <h3 className="text-[10px] font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
//                   <TrendingUp className="w-3 h-3" />
//                   Similar Legal Precedents
//                 </h3>
//                 <div className="space-y-1.5">
//                   {similarCases.map((caseItem, index) => (
//                     <a
//                       key={index}
//                       href={caseItem.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="block p-2 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors"
//                     >
//                       <div className="flex items-start gap-1.5">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1.5">
//                             <h4 className="text-[10px] font-semibold text-amber-900 line-clamp-1">
//                               {caseItem.title}
//                             </h4>
//                             <ExternalLink className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
//                           </div>
//                           <p className="text-[9px] text-amber-700 mt-0.5 line-clamp-2">
//                             {caseItem.snippet}
//                           </p>
//                         </div>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Messages Area */}
//             <ScrollArea className="p-3">
//               {isInitializing ? (
//                 <div className="flex items-center justify-center h-full min-h-[200px]">
//                   <div className="text-center">
//                     <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
//                     <p className="text-xs text-muted-foreground">
//                       Analyzing case details...
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {messages.map((message, index) => (
//                     <div
//                       key={index}
//                       className={cn(
//                         "flex gap-2",
//                         message.role === "user"
//                           ? "justify-end"
//                           : "justify-start"
//                       )}
//                     >
//                       {message.role === "assistant" && (
//                         <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
//                           <Bot className="w-3.5 h-3.5 text-blue-600" />
//                         </div>
//                       )}
//                       <div
//                         className={cn(
//                           "px-3 py-2 rounded-lg max-w-[85%]",
//                           message.role === "user"
//                             ? "bg-blue-600 text-white"
//                             : "bg-gray-100 text-gray-900"
//                         )}
//                       >
//                         <div className="text-xs whitespace-pre-wrap break-words">
//                           {message.content}
//                         </div>
//                         <div
//                           className={cn(
//                             "text-[10px] mt-1",
//                             message.role === "user"
//                               ? "text-blue-100"
//                               : "text-gray-500"
//                           )}
//                         >
//                           {message.timestamp.toLocaleTimeString([], {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {isLoading && (
//                     <div className="flex gap-2">
//                       <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
//                         <Bot className="w-3.5 h-3.5 text-blue-600" />
//                       </div>
//                       <div className="px-3 py-2 rounded-lg bg-gray-100">
//                         <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </ScrollArea>
//           </div>

//           {/* ✅ Input Area (fixed at bottom) */}
//           <div className="p-3 border-t flex-shrink-0 bg-white">
//             <div className="flex gap-2">
//               <Input
//                 ref={inputRef}
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about case, hearings, or law..."
//                 disabled={isLoading || isInitializing}
//                 className="flex-1 text-xs h-9"
//               />
//               <Button
//                 onClick={sendMessage}
//                 disabled={!inputMessage.trim() || isLoading || isInitializing}
//                 size="icon"
//                 className="bg-blue-600 hover:bg-blue-700 h-9 w-9 flex-shrink-0"
//               >
//                 <Send className="w-3.5 h-3.5" />
//               </Button>
//             </div>
//             <p className="text-[10px] text-muted-foreground mt-1.5">
//               Ask about hearings, comments, legal advice, or IPC sections
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };
// frontend/app/components/task/ai-chatbox.tsx
// import React, { useState, useEffect, useRef } from "react";
// import {
//   Bot,
//   Send,
//   X,
//   Loader2,
//   ExternalLink,
//   FileText,
//   TrendingUp,
//   BookOpen,
//   Paperclip,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import axios from "axios";

// interface Message {
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface SimilarCase {
//   title: string;
//   url: string;
//   snippet: string;
// }

// interface AIChatboxProps {
//   taskId: string;
//   isOpen: boolean;
//   onClose: () => void;
//   attachments?: Array<{ fileName: string; fileUrl: string; _id: string }>;
// }

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api-v1";

// export const AIChatbox: React.FC<AIChatboxProps> = ({
//   taskId,
//   isOpen,
//   onClose,
//   attachments = [],
// }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [caseTitle, setCaseTitle] = useState("");
//   const [showInitialOptions, setShowInitialOptions] = useState(true);
//   const [showAttachmentSelector, setShowAttachmentSelector] = useState(false);
//   const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);

//   const scrollRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (isOpen && messages.length === 0) {
//       initializeAI();
//     }
//   }, [isOpen, taskId]);

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const initializeAI = async () => {
//     try {
//       // Just get basic case info without generating summary
//       const response = await axios.get(`${API_URL}/tasks/${taskId}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       setCaseTitle(response.data.task.title);

//       const welcomeMessage: Message = {
//         role: "assistant",
//         content: `Hello! I'm your legal AI assistant for **${response.data.task.title}**.\n\nI can help you with legal matters, case analysis, and legal precedents. How would you like to proceed?`,
//         timestamp: new Date(),
//       };

//       setMessages([welcomeMessage]);
//     } catch (error: any) {
//       console.error("Error initializing AI:", error);
//       const errorMessage: Message = {
//         role: "assistant",
//         content:
//           "Hello! I'm your legal AI assistant. I can help you with legal matters and case analysis. What would you like to know?",
//         timestamp: new Date(),
//       };
//       setMessages([errorMessage]);
//     }
//   };

//   const handleSuggestSimilarCases = async () => {
//     setShowInitialOptions(false);
//     setIsLoading(true);

//     const userMessage: Message = {
//       role: "user",
//       content: "Suggest similar cases",
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     try {
//       const response = await axios.get(
//         `${API_URL}/ai/case/${taskId}/similar-cases`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       setSimilarCases(response.data.similarCases || []);

//       let content = "**Similar Legal Precedents:**\n\n";
//       if (response.data.similarCases?.length > 0) {
//         content += response.data.similarCases
//           .map(
//             (c: SimilarCase, i: number) =>
//               `${i + 1}. **${c.title}**\n${c.snippet}\n[View Case](${c.url})`
//           )
//           .join("\n\n");
//       } else {
//         content +=
//           "No similar cases found at this moment. You can ask me about specific legal precedents or concepts.";
//       }

//       const aiMessage: Message = {
//         role: "assistant",
//         content,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error fetching similar cases:", error);
//       toast.error("Failed to fetch similar cases");
//       const errorMessage: Message = {
//         role: "assistant",
//         content:
//           "I couldn't fetch similar cases at this moment. Please try asking about specific legal precedents.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGenerateSummary = async () => {
//     setShowInitialOptions(false);
//     setIsLoading(true);

//     const userMessage: Message = {
//       role: "user",
//       content: "Generate case summary",
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     try {
//       const response = await axios.get(`${API_URL}/ai/case/${taskId}/summary`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       const aiMessage: Message = {
//         role: "assistant",
//         content: `**Case Summary:**\n\n${response.data.summary}`,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error generating summary:", error);
//       toast.error("Failed to generate summary");
//       const errorMessage: Message = {
//         role: "assistant",
//         content:
//           "I couldn't generate the summary at this moment. Please ask me specific questions about the case.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleScanAttachment = () => {
//     if (attachments.length === 0) {
//       toast.error("No attachments available to scan");
//       return;
//     }
//     setShowInitialOptions(false);
//     setShowAttachmentSelector(true);
//   };

//   const handleAttachmentSelect = async (attachment: any) => {
//     setShowAttachmentSelector(false);
//     setIsLoading(true);

//     const userMessage: Message = {
//       role: "user",
//       content: `Scan attachment: ${attachment.fileName}`,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);

//     try {
//       const response = await axios.post(
//         `${API_URL}/ai/case/${taskId}/scan-attachment`,
//         {
//           attachmentId: attachment._id,
//           fileName: attachment.fileName,
//           fileUrl: attachment.fileUrl,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const aiMessage: Message = {
//         role: "assistant",
//         content: response.data.analysis,
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error) {
//       console.error("Error scanning attachment:", error);
//       toast.error("Failed to scan attachment");
//       const errorMessage: Message = {
//         role: "assistant",
//         content:
//           "I couldn't scan this attachment. The file might be in an unsupported format or too large.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const sendMessage = async () => {
//     if (!inputMessage.trim() || isLoading) return;

//     setShowInitialOptions(false);
//     setShowAttachmentSelector(false);

//     const userMessage: Message = {
//       role: "user",
//       content: inputMessage,
//       timestamp: new Date(),
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       const chatHistory = messages.map((msg) => ({
//         role: msg.role,
//         content: msg.content,
//       }));

//       const response = await axios.post(
//         `${API_URL}/ai/case/${taskId}/chat`,
//         {
//           message: inputMessage,
//           chatHistory,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       const aiResponseText =
//         response.data.response ||
//         "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";

//       const aiMessage: Message = {
//         role: "assistant",
//         content: aiResponseText,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, aiMessage]);
//     } catch (error: any) {
//       console.error("Error sending message:", error);

//       let errorMsg =
//         "I apologize, but I'm having trouble processing your request. Please try again.";

//       if (error.response?.data?.message) {
//         errorMsg = error.response.data.message;
//       }

//       const errorMessage: Message = {
//         role: "assistant",
//         content: errorMsg,
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, errorMessage]);
//       toast.error("Failed to get AI response");
//     } finally {
//       setIsLoading(false);
//       inputRef.current?.focus();
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] flex flex-col">
//       <Card className="shadow-2xl border-2 flex flex-col h-full overflow-hidden">
//         <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex-shrink-0">
//           <div className="flex items-center justify-between gap-2">
//             <div className="flex items-center gap-2 min-w-0 flex-1">
//               <div className="p-1.5 bg-white/20 rounded-full flex-shrink-0">
//                 <Bot className="w-4 h-4" />
//               </div>
//               <div className="min-w-0 flex-1">
//                 <CardTitle className="text-xs font-semibold truncate leading-tight">
//                   SAJNA Legal Assistant
//                 </CardTitle>
//                 <p className="text-[10px] opacity-90 truncate leading-tight">
//                   {caseTitle || "Legal Analysis"}
//                 </p>
//               </div>
//             </div>
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={onClose}
//               className="text-white hover:bg-white/20 flex-shrink-0 h-7 w-7 p-0"
//             >
//               <X className="w-4 h-4" />
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden p-0">
//           <div className="flex-1 min-h-0 overflow-y-auto">
//             {/* Similar Cases Display */}
//             {similarCases.length > 0 && (
//               <div className="p-3 bg-amber-50 border-b border-amber-200">
//                 <h3 className="text-[10px] font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
//                   <TrendingUp className="w-3 h-3" />
//                   Similar Legal Precedents
//                 </h3>
//                 <div className="space-y-1.5">
//                   {similarCases.map((caseItem, index) => (
//                     <a
//                       key={index}
//                       href={caseItem.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="block p-2 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors"
//                     >
//                       <div className="flex items-start gap-1.5">
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-center gap-1.5">
//                             <h4 className="text-[10px] font-semibold text-amber-900 line-clamp-1">
//                               {caseItem.title}
//                             </h4>
//                             <ExternalLink className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
//                           </div>
//                           <p className="text-[9px] text-amber-700 mt-0.5 line-clamp-2">
//                             {caseItem.snippet}
//                           </p>
//                         </div>
//                       </div>
//                     </a>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Messages Area */}
//             <ScrollArea className="p-3" ref={scrollRef}>
//               <div className="space-y-3">
//                 {messages.map((message, index) => (
//                   <div
//                     key={index}
//                     className={cn(
//                       "flex gap-2",
//                       message.role === "user" ? "justify-end" : "justify-start"
//                     )}
//                   >
//                     {message.role === "assistant" && (
//                       <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
//                         <Bot className="w-3.5 h-3.5 text-blue-600" />
//                       </div>
//                     )}
//                     <div
//                       className={cn(
//                         "px-3 py-2 rounded-lg max-w-[85%]",
//                         message.role === "user"
//                           ? "bg-blue-600 text-white"
//                           : "bg-gray-100 text-gray-900"
//                       )}
//                     >
//                       <div className="text-xs whitespace-pre-wrap break-words">
//                         {message.content}
//                       </div>
//                       <div
//                         className={cn(
//                           "text-[10px] mt-1",
//                           message.role === "user"
//                             ? "text-blue-100"
//                             : "text-gray-500"
//                         )}
//                       >
//                         {message.timestamp.toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Initial Options */}
//                 {showInitialOptions && messages.length > 0 && (
//                   <div className="space-y-2 mt-4">
//                     <p className="text-xs text-gray-600 font-medium mb-2">
//                       Choose an option:
//                     </p>
//                     <Button
//                       onClick={handleSuggestSimilarCases}
//                       className="w-full justify-start text-xs h-auto py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
//                       variant="outline"
//                     >
//                       <TrendingUp className="w-4 h-4 mr-2" />
//                       <div className="text-left">
//                         <div className="font-semibold">
//                           Suggest Similar Cases
//                         </div>
//                         <div className="text-[10px] opacity-75">
//                           Find related legal precedents
//                         </div>
//                       </div>
//                     </Button>
//                     <Button
//                       onClick={handleGenerateSummary}
//                       className="w-full justify-start text-xs h-auto py-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
//                       variant="outline"
//                     >
//                       <BookOpen className="w-4 h-4 mr-2" />
//                       <div className="text-left">
//                         <div className="font-semibold">Generate Summary</div>
//                         <div className="text-[10px] opacity-75">
//                           Get comprehensive case analysis
//                         </div>
//                       </div>
//                     </Button>
//                     <Button
//                       onClick={handleScanAttachment}
//                       className="w-full justify-start text-xs h-auto py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
//                       variant="outline"
//                       disabled={attachments.length === 0}
//                     >
//                       <Paperclip className="w-4 h-4 mr-2" />
//                       <div className="text-left">
//                         <div className="font-semibold">Scan Attachments</div>
//                         <div className="text-[10px] opacity-75">
//                           {attachments.length > 0
//                             ? `Analyze ${attachments.length} file(s)`
//                             : "No files available"}
//                         </div>
//                       </div>
//                     </Button>
//                   </div>
//                 )}

//                 {/* Attachment Selector */}
//                 {showAttachmentSelector && (
//                   <div className="space-y-2 mt-4">
//                     <p className="text-xs text-gray-600 font-medium mb-2">
//                       Select a file to scan:
//                     </p>
//                     {attachments.map((attachment) => (
//                       <Button
//                         key={attachment._id}
//                         onClick={() => handleAttachmentSelect(attachment)}
//                         className="w-full justify-start text-xs h-auto py-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
//                         variant="outline"
//                       >
//                         <FileText className="w-3 h-3 mr-2" />
//                         <span className="truncate">{attachment.fileName}</span>
//                       </Button>
//                     ))}
//                     <Button
//                       onClick={() => setShowAttachmentSelector(false)}
//                       className="w-full text-xs"
//                       variant="ghost"
//                       size="sm"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 )}

//                 {isLoading && (
//                   <div className="flex gap-2">
//                     <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
//                       <Bot className="w-3.5 h-3.5 text-blue-600" />
//                     </div>
//                     <div className="px-3 py-2 rounded-lg bg-gray-100">
//                       <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </ScrollArea>
//           </div>

//           {/* Input Area */}
//           <div className="p-3 border-t flex-shrink-0 bg-white">
//             <div className="flex gap-2">
//               <Input
//                 ref={inputRef}
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Ask about law, cases, or legal concepts..."
//                 disabled={isLoading}
//                 className="flex-1 text-xs h-9"
//               />
//               <Button
//                 onClick={sendMessage}
//                 disabled={!inputMessage.trim() || isLoading}
//                 size="icon"
//                 className="bg-blue-600 hover:bg-blue-700 h-9 w-9 flex-shrink-0"
//               >
//                 <Send className="w-3.5 h-3.5" />
//               </Button>
//             </div>
//             <p className="text-[10px] text-muted-foreground mt-1.5">
//               Ask anything about law, legal concepts, or case strategies
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// frontend/app/components/task/ai-chatbox.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  Loader2,
  ExternalLink,
  FileText,
  TrendingUp,
  BookOpen,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TaskFile {
  key: string;
  url: string;
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
  const [caseTitle, setCaseTitle] = useState("");
  const [showInitialOptions, setShowInitialOptions] = useState(true);
  const [showAttachmentSelector, setShowAttachmentSelector] = useState(false);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [attachments, setAttachments] = useState<TaskFile[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeAI();
      fetchAttachments();
    }
  }, [isOpen, taskId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeAI = async () => {
    try {
      // Just get basic case info without generating summary
      const response = await axios.get(`${API_URL}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCaseTitle(response.data.task.title);

      const welcomeMessage: Message = {
        role: "assistant",
        content: `Hello! I'm your legal AI assistant for **${response.data.task.title}**.\n\nI can help you with legal matters, case analysis, and legal precedents. How would you like to proceed?`,
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
    } catch (error: any) {
      console.error("Error initializing AI:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Hello! I'm your legal AI assistant. I can help you with legal matters and case analysis. What would you like to know?",
        timestamp: new Date(),
      };
      setMessages([errorMessage]);
    }
  };

  const fetchAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const response = await axios.get(
        `https://xyk0pby7sa.execute-api.eu-north-1.amazonaws.com/Stage1?taskId=${taskId}`
      );
      setAttachments(response.data.files || []);
      console.log("📎 Fetched attachments:", response.data.files?.length || 0);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleSuggestSimilarCases = async () => {
    setShowInitialOptions(false);
    setIsLoading(true);

    const userMessage: Message = {
      role: "user",
      content: "Suggest similar cases",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.get(
        `${API_URL}/ai/case/${taskId}/similar-cases`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSimilarCases(response.data.similarCases || []);

      let content = "**Similar Legal Precedents:**\n\n";
      if (response.data.similarCases?.length > 0) {
        content += response.data.similarCases
          .map(
            (c: SimilarCase, i: number) =>
              `${i + 1}. **${c.title}**\n${c.snippet}\n[View Case](${c.url})`
          )
          .join("\n\n");
      } else {
        content +=
          "No similar cases found at this moment. You can ask me about specific legal precedents or concepts.";
      }

      const aiMessage: Message = {
        role: "assistant",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error fetching similar cases:", error);
      toast.error("Failed to fetch similar cases");
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I couldn't fetch similar cases at this moment. Please try asking about specific legal precedents.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setShowInitialOptions(false);
    setIsLoading(true);

    const userMessage: Message = {
      role: "user",
      content: "Generate case summary",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.get(`${API_URL}/ai/case/${taskId}/summary`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const aiMessage: Message = {
        role: "assistant",
        content: `**Case Summary:**\n\n${response.data.summary}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I couldn't generate the summary at this moment. Please ask me specific questions about the case.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAttachment = () => {
    if (attachments.length === 0) {
      toast.error("No attachments available to scan");
      return;
    }
    setShowInitialOptions(false);
    setShowAttachmentSelector(true);
  };

  const handleAttachmentSelect = async (file: TaskFile) => {
    setShowAttachmentSelector(false);
    setIsLoading(true);

    const displayName = file.key.includes("$")
      ? file.key.split("$")[1]
      : file.key;

    const userMessage: Message = {
      role: "user",
      content: `Scan attachment: ${displayName}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `${API_URL}/ai/case/${taskId}/scan-attachment`,
        {
          fileName: displayName,
          fileUrl: file.url,
          fileKey: file.key,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const aiMessage: Message = {
        role: "assistant",
        content: response.data.analysis,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error scanning attachment:", error);
      toast.error("Failed to scan attachment");
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I couldn't scan this attachment. The file might be in an unsupported format or too large. However, I can still help you with:\n\n• Questions about document requirements\n• Legal document templates\n• Document review guidelines\n• What information should be in legal documents\n\nWhat would you like to know?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setShowInitialOptions(false);
    setShowAttachmentSelector(false);

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
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

      const aiResponseText =
        response.data.response ||
        "I apologize, but I couldn't generate a proper response. Please try rephrasing your question.";

      const aiMessage: Message = {
        role: "assistant",
        content: aiResponseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);

      let errorMsg =
        "I apologize, but I'm having trouble processing your request. Please try again.";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
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
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] flex flex-col">
      <Card className="shadow-2xl border-2 flex flex-col h-full overflow-hidden">
        <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="p-1.5 bg-white/20 rounded-full flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xs font-semibold truncate leading-tight">
                  SAJNA Legal Assistant
                </CardTitle>
                <p className="text-[10px] opacity-90 truncate leading-tight">
                  {caseTitle || "Legal Analysis"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 flex-shrink-0 h-7 w-7 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden p-0">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Similar Cases Display */}
            {similarCases.length > 0 && (
              <div className="p-3 bg-amber-50 border-b border-amber-200">
                <h3 className="text-[10px] font-semibold text-amber-900 mb-1.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Similar Legal Precedents
                </h3>
                <div className="space-y-1.5">
                  {similarCases.map((caseItem, index) => (
                    <a
                      key={index}
                      href={caseItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 bg-white border border-amber-200 rounded-md hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-start gap-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-[10px] font-semibold text-amber-900 line-clamp-1">
                              {caseItem.title}
                            </h4>
                            <ExternalLink className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
                          </div>
                          <p className="text-[9px] text-amber-700 mt-0.5 line-clamp-2">
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
            <ScrollArea className="p-3" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-3 py-2 rounded-lg max-w-[85%]",
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <div className="text-xs whitespace-pre-wrap break-words">
                        {message.content}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] mt-1",
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

                {/* Initial Options */}
                {showInitialOptions && messages.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      Choose an option:
                    </p>
                    <Button
                      onClick={handleSuggestSimilarCases}
                      className="w-full justify-start text-xs h-auto py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      variant="outline"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-semibold">
                          Suggest Similar Cases
                        </div>
                        <div className="text-[10px] opacity-75">
                          Find related legal precedents
                        </div>
                      </div>
                    </Button>
                    <Button
                      onClick={handleGenerateSummary}
                      className="w-full justify-start text-xs h-auto py-3 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
                      variant="outline"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-semibold">Generate Summary</div>
                        <div className="text-[10px] opacity-75">
                          Get comprehensive case analysis
                        </div>
                      </div>
                    </Button>
                    <Button
                      onClick={handleScanAttachment}
                      className="w-full justify-start text-xs h-auto py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                      variant="outline"
                      disabled={loadingAttachments || attachments.length === 0}
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-semibold">Scan Attachments</div>
                        <div className="text-[10px] opacity-75">
                          {loadingAttachments
                            ? "Loading files..."
                            : attachments.length > 0
                            ? `Analyze ${attachments.length} file(s)`
                            : "No files available"}
                        </div>
                      </div>
                    </Button>
                  </div>
                )}

                {/* Attachment Selector */}
                {showAttachmentSelector && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">
                      Select a file to scan ({attachments.length} files):
                    </p>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {attachments.map((file) => {
                        const displayName = file.key.includes("$")
                          ? file.key.split("$")[1]
                          : file.key;
                        const extension =
                          displayName.split(".").pop()?.toUpperCase() || "FILE";

                        return (
                          <Button
                            key={file.key}
                            onClick={() => handleAttachmentSelect(file)}
                            className="w-full justify-start text-xs h-auto py-2 bg-gray-50 hover:bg-gray-100 text-gray-700"
                            variant="outline"
                          >
                            <FileText className="w-3 h-3 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0 text-left">
                              <p className="truncate font-medium">
                                {displayName}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {extension}
                              </p>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={() => setShowAttachmentSelector(false)}
                      className="w-full text-xs"
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-gray-100">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t flex-shrink-0 bg-white">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about law, cases, or legal concepts..."
                disabled={isLoading}
                className="flex-1 text-xs h-9"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 h-9 w-9 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">
              Ask anything about law, legal concepts, or case strategies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
