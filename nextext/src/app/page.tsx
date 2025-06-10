"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [friendCode, setFriendCode] = useState("");
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to NexText</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Start a Chat</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter friend's code"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={startChat}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Start Chat
            </button>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <a href="/sign-up" className="text-blue-400 hover:underline">
              Sign up
            </a>
          </p>
          <p className="text-gray-400 mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
