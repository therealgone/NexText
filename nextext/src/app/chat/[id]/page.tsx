"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Outfit, Space_Grotesk } from 'next/font/google';
import { motion, Variants } from "motion/react";


const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


interface Message {
  _id: string;
  content: string;
  senderEmail: string;
  createdAt: string;
  conversationId: string;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<{ name: string; email: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    if (isFetchingRef.current || !session?.user?.email) return;
    isFetchingRef.current = true;

    try {
      const response = await fetch(`/api/messages/${params.id}`, {
        cache: 'no-store'
      });
      
      if (response.status === 404) {
        router.push("/dashboard");
        return;
      }
      
      if (!response.ok) throw new Error("Failed to fetch messages");
      
      const data = await response.json();
      
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        if (lastMessageIdRef.current !== lastMessage._id) {
          setMessages(data);
          lastMessageIdRef.current = lastMessage._id;
          scrollToBottom();
        }
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [params.id, router, session?.user?.email, scrollToBottom]);

  const fetchConversationDetails = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const response = await fetch(`/api/conversations/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch conversation details");
      const data = await response.json();
      const otherUser = data.participants.find(
        (p: { email: string }) => p.email !== (session?.user as any)?.email
      );
      setOtherParticipant(otherUser);
    } catch (err) {
      console.error("Error fetching conversation details:", err);
    }
  }, [params.id, session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchMessages();
      fetchConversationDetails();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, session?.user?.email, fetchConversationDetails]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.email) return;

    try {
      const response = await fetch(`/api/messages/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      fetchMessages();
    }
  }, [fetchMessages]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Please sign in to view this chat.</p>
      </div>
    );
  }

  const userEmail = session.user.email;

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-800 text-white">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-zinc-800/50 p-4 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-white hover:text-black bg-zinc-800 p-2 rounded-xl shadow-[0_0_10px_white] hover:bg-white hover:scale-[1.08] transition font-bold right-0 fixed "
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-shadow-[0_0_10px_white]">
              {otherParticipant?.name || "Chat"}
            </h1>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white "></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.senderEmail === session?.user?.email
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-3 ${
                    message.senderEmail === session?.user?.email
                      ? "bg-zinc-800 tracking-wider  hover:shadow-[0_0_20px_white] font-bold"
                      : "bg-zinc-600 font-semibold tracking-wide hover:shadow-[0_0_20px_white] "
                  } transition-all duration-300`}
                >
                  <p className="text-white">{message.content}</p>
                  <p className="text-xs text-gray-300 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 bg-zinc-800/30 border-t border-white/10">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-zinc-700 text-white rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-[0_0_10px_white] placeholder:text-white/50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`px-6 py-3 rounded-2xl font-extrabold ${
                !newMessage.trim() || sending
                  ? "bg-zinc-700 cursor-not-allowed"
                  : "bg-zinc-800 text-white shadow-[0_0_10px_white] hover:bg-white hover:text-black hover:scale-[1.08]"
              } transition-all duration-300`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Send"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 