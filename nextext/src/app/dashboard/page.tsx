"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { Outfit, Space_Grotesk } from 'next/font/google';
import { motion, Variants } from "motion/react";
import Image from 'next/image';
import logo from "./nt.png";

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

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

function LoadingThreeDotsJumping() {
  const dotVariants: Variants = {
    jump: {
      y: -30,
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      animate="jump"
      transition={{ staggerChildren: -0.2, staggerDirection: -1 }}
      className="loading-container"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}
    >
      <motion.div className="dot" variants={dotVariants} />
      <motion.div className="dot" variants={dotVariants} />
      <motion.div className="dot" variants={dotVariants} />
      <StyleSheet />
    </motion.div>
  );
}

function StyleSheet() {
  return (
    <style>{`
      .loading-container {
        height: 100vh; /* fill screen vertically */
      }
      .dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff0088;
        will-change: transform;
      }
    `}</style>
  );
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
    audioRef.current = new Audio('/notification.mp3');

    const handleVisibilityChange = () => {
      isPageVisible.current = document.visibilityState === 'visible';
      if (isPageVisible.current) {
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
    stopPolling();
    pollIntervalRef.current = setInterval(fetchData, 2000);
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

      setConversations(prevConversations => {
        const updatedConversations = data.map((conv: Conversation) => {
          const lastMessage = conv.lastMessage;

          if (lastMessage && isPageVisible.current) {
            const prevTimestamp = lastMessageTimestamps[conv._id];
            if (!prevTimestamp || new Date(lastMessage.createdAt) > new Date(prevTimestamp)) {
              if (lastMessage.senderEmail !== session.user.email) {
                setNotifications(prev => ({ ...prev, [conv._id]: true }));
                const audio = new Audio("/notification.mp3");
                audio.play().catch(console.error);
              }
            }
          }

          return conv;
        });

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
          className="group bg-black rounded-lg p-4 hover:bg-white transition-colors relative"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-medium text-lg text-white group-hover:text-black">
                {otherParticipant?.name || "Unknown User"}
              </h2>
              {conv.lastMessage && (
                <p className="text-gray-400 text-sm mt-1 group-hover:text-black">
                  {conv.lastMessage.senderEmail === session?.user?.email
                    ? "You: "
                    : `${otherParticipant?.name}: `}
                  {conv.lastMessage.content}
                </p>
              )}
            </div>
            {hasNotification && (
              <div className="absolute top-4 right-4 w-3 h-3 bg-white drop-shadow-[1px_2px_10px_white] rounded-full group-hover:bg-black group-hover:drop-shadow-[0_0_10px_red] animate-pulse"></div>
            )}
          </div>
        </div>
      );
    })
  ), [conversations, notifications, handleConversationClick, session?.user?.email]);

  if (status === "loading" || loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-800 text-white p-4 ${outfit.variable} ${spaceGrotesk.variable} font-outfit`}>
        <LoadingThreeDotsJumping />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-zinc-800 text-white p-4 ${outfit.variable} ${spaceGrotesk.variable} font-outfit`}>
      <h1 className="fixed top-15 text-5xl font-extrabold mb-4 text-shadow-[0_0_50px_white]">Welcome to NexText</h1>
      <Image src={logo.src} alt="NexText Logo" className="w-30 fixed top-1 left-0" width={120} height={120} />
      <div className="top-5 right-0 fixed p-5">
        <LogoutButton />
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <p className="text-lg mb-2">Logged in as: {session?.user?.email}</p>
          {userShortCode && (
            <div className="mt-4 p-4 bg-gradient-to-b from-zinc-800 to-zinc-600/40 rounded-lg">
              <p className="text-lg mb-2">
                Your Short Code: <span className="font-mono bg-white text-black px-2 py-1 rounded">{userShortCode}</span>
              </p>
              <p className="text-sm text-gray-400">Share this code with friends to start chatting</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Existing Conversations */}
          <div className="bg-gradient-to-b from-zinc-800 to-zinc-600/30 rounded-lg p-4 text-white">
            <h2 className="text-xl font-semibold mb-4">Your Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-white">No conversations yet. Start a new chat!</p>
            ) : (
              <div className="space-y-2 ">
                {memoizedConversations}
              </div>
            )}
          </div>

          {/* Start New Chat */}
          <div className="bg-gradient-to-b from-zinc-800 to-zinc-600/40 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Start a New Chat</h2>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter friend's code"
                value={friendCode}
                onChange={handleFriendCodeChange}
                className="px-4 py-2 rounded-lg bg-zinc-700 text-white placeholder-gray-400 outline-none focus:ring-white focus:ring-2 focus:shadow-[0_0_20px_white] transition-colors"
              />
              <button
                onClick={startChat}
                className="text-white mt-5 p-3 py-3 px-6 mx-5 rounded-2xl shadow-[0_0_10px_white] bg-zinc-800 hover:scale-[1.08] hover:bg-white hover:text-black transition font-extrabold"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-600 rounded">{error}</div>
        )}
      </div>
    </div>
  );
}
