// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Login Failed: " + res.error);
      } else if (res?.ok) {
        setSuccess("Login Successful!");
        router.push("/dashboard");
        // Clear form
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError("An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold">Login to NexText</h2>
        {error && <p className="text-red-500 bg-red-900/50 p-3 rounded">{error}</p>}
        {success && <p className="text-green-500 bg-green-900/50 p-3 rounded">{success}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-gray-700 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <a href="/signup" className="text-green-400">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
