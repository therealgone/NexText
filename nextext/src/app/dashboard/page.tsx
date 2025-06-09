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
            <p className="text-sm text-gray-400">Use this code to log in quickly</p>
          </div>
        )}
      </div>
      <LogoutButton />
    </div>
  );
}
