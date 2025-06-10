// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface Participant {
  name: string;
  email: string;
  shortCode: string;
}

interface Message {
  content: string;
  createdAt: string;
  senderEmail: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage: Message | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendCode, setFriendCode] = useState("");
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPageVisible = useRef(true);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTime = useRef<number>(0);
  const fetchInProgress = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userShortCode, setUserShortCode] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/notification.mp3');
    
    // Handle page visibility
    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      if (isPageVisible.current) {
        // Immediately fetch new data when page becomes visible
        fetchData();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling(); // Clear any existing interval
    pollIntervalRef.current = setInterval(fetchData, 2000); // Poll every 2 seconds
  }, [stopPolling]);

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) throw new Error("Failed to fetch user details");
      const data = await response.json();
      if (data.shortCode) {
        setUserShortCode(data.shortCode);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/conversations", {
        cache: 'no-store'
      });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();

      // Update conversations and check for new messages
      setConversations(prevConversations => {
        const updatedConversations = data.map((conv: Conversation) => {
          const prevConv = prevConversations.find(c => c._id === conv._id);
          const lastMessage = conv.lastMessage;

          if (lastMessage && isPageVisible.current) {
            const prevTimestamp = lastMessageTimestamps[conv._id];
            if (!prevTimestamp || new Date(lastMessage.createdAt) > new Date(prevTimestamp)) {
              // Only show notification if it's a new message and not from the current user
              if (lastMessage.senderEmail !== session.user.email) {
                setNotifications(prev => ({ ...prev, [conv._id]: true }));
                // Play notification sound
                const audio = new Audio("/notification.mp3");
                audio.play().catch(console.error);
              }
            }
          }

          return conv;
        });

        // Update timestamps
        const newTimestamps = { ...lastMessageTimestamps };
        updatedConversations.forEach((conv: Conversation) => {
          if (conv.lastMessage) {
            newTimestamps[conv._id] = conv.lastMessage.createdAt;
          }
        });
        setLastMessageTimestamps(newTimestamps);

        return updatedConversations;
      });
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email, lastMessageTimestamps]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
      fetchUserDetails();
      startPolling();
      return () => stopPolling();
    }
  }, [status, fetchData, fetchUserDetails, startPolling, stopPolling]);

  const clearNotification = useCallback((conversationId: string) => {
    setNotifications(prev => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
  }, []);

  const startChat = useCallback(async () => {
    const res = await fetch("/api/start-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortCode: friendCode }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push(`/chat/${data.conversationId}`);
    } else {
      alert(data.error);
    }
  }, [friendCode, router]);

  const handleFriendCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFriendCode(e.target.value);
  }, []);

  const handleConversationClick = useCallback((conversationId: string) => {
    clearNotification(conversationId);
    router.push(`/chat/${conversationId}`);
  }, [clearNotification, router]);

  const memoizedConversations = useMemo(() => (
    conversations.map((conv) => {
      const otherParticipant = conv.participants.find(
        (p) => p.email !== session?.user?.email
      );
      const hasNotification = notifications[conv._id];

      return (
        <div
          key={conv._id}
          onClick={() => handleConversationClick(conv._id)}
          className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors relative"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-medium text-lg text-white">
                {otherParticipant?.name || "Unknown User"}
              </h2>
              {conv.lastMessage && (
                <p className="text-gray-400 text-sm mt-1">
                  {conv.lastMessage.senderEmail === session?.user?.email
                    ? "You: "
                    : `${otherParticipant?.name}: `}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
            {hasNotification && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      );
    })
  ), [conversations, notifications, handleConversationClick, session?.user?.email]);

  if (status === "loading" || loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to NexText</h1>
          <p className="text-lg mb-2">Logged in as: {session?.user?.email}</p>
          {userShortCode && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-lg mb-2">Your Short Code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{userShortCode}</span></p>
              <p className="text-sm text-gray-400">Share this code with friends to start chatting</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Existing Conversations */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-gray-400">No conversations yet. Start a new chat!</p>
            ) : (
              <div className="space-y-2">
                {memoizedConversations}
              </div>
            )}
          </div>

          {/* Start New Chat */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Start a New Chat</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter friend's code"
                value={friendCode}
                onChange={handleFriendCodeChange}
                className="px-4 py-2 border rounded-lg bg-gray-700 text-white placeholder-gray-400"
              />
              <button
                onClick={startChat}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
