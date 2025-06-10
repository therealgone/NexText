// app/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

interface UserDetails {
  shortCode: string;
  name: string;
}

interface Conversation {
  id: string;
  otherParticipant: {
    email: string;
    userId: string;
  };
  latestMessage: {
    content: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendCode, setFriendCode] = useState("");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, conversationsResponse] = await Promise.all([
          fetch("/api/user"),
          fetch("/api/conversations")
        ]);

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserDetails(userData);
        }

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  async function startChat() {
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
  }

  if (status === "loading" || loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to NexText</h1>
          <p className="text-lg mb-2">Logged in as: {session?.user?.email}</p>
          {userDetails && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <p className="text-lg mb-2">Your Short Code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{userDetails.shortCode}</span></p>
              <p className="text-sm text-gray-400">Use this code to add friends</p>
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
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => router.push(`/chat/${conv.id}`)}
                    className="w-full text-left p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium">{conv.otherParticipant.email}</div>
                    {conv.latestMessage && (
                      <div className="text-sm text-gray-400 truncate">
                        {conv.latestMessage.content}
                      </div>
                    )}
                  </button>
                ))}
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
                onChange={(e) => setFriendCode(e.target.value)}
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
