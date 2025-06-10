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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendCode, setFriendCode] = useState("");
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserDetails();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to NexText</h1>
        <p className="text-lg mb-2">Logged in as: {session?.user?.email}</p>
        {userDetails && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-lg mb-2">Your Short Code: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{userDetails.shortCode}</span></p>
            <p className="text-sm text-gray-400">Use this code to add friends</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Start a New Chat</h2>
          <div className="flex flex-col gap-4 items-center">
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
      <LogoutButton />
    </div>
  );
}
