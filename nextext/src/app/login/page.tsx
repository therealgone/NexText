// app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Outfit, Space_Grotesk } from 'next/font/google';
import {motion} from "motion/react";

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }, [email, password, router, loading]);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError(null);
  }, []);

  return (
    <div className={`bg-gradient-to-t from-black to-zinc-800 text-white min-h-screen flex items-center justify-center ${outfit.variable} ${spaceGrotesk.variable} font-outfit`}>
      <div className="w-full max-w-md">
      <motion.div 
      initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.5, ease:"easeInOut"}}
          >
        <div className=" p-5 bg-gradient-to-t from-black to-zinc-800 rounded-2xl">
          <div className="text-center mb-9">
          <motion.div       initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.7, ease:"easeInOut"}}>
          <h1 className="text-5xl mt-3 font-extrabold  text-shadow-[0_0_10px_white] tracking-wide mb-5 ">Welcome Back</h1>
          </motion.div>
          <motion.div       initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.8, ease:"easeInOut"}}>
          <p className="text-gray-400 mt-5 text-2xl text-shadow-[0_0_10px_gray] ">Sign in to your account</p>
          </motion.div>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center text-sm">
              {error}
            </div>
          )}
        <motion.div  initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:1, ease:"easeInOut"}}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
              className="w-full mt-5 px-4 py-2 rounded bg-zinc-800  text-white outline-none focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_white] placeholder:text-white"
              placeholder="Email"
            />
          </div>
        </motion.div>
         <motion.div  initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:1.2, ease:"easeInOut"}}>
          <div>
         
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              
            </label>
         
            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              className="w-full mt-5 px-4 py-2 rounded bg-zinc-800   text-white  focus:outline-none focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_white] placeholder:text-white"
              placeholder="Password"
            />
          </div>
           </motion.div>
          <motion.div  initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:1.4, ease:"easeInOut"}}>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4  bg-zinc-800 rounded-2xl font-extrabold text-white text-shadow-[0_0_10px_white] hover:bg-white hover:scale-[1.05] hover:text-black hover:text-shadow-[0_0_30px_black] transition-colors mt-5 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          </motion.div>
        </form>

        <motion.div  initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:1.6, ease:"easeInOut"}}>
        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-white font-extrabold text-shadow-[0_0_10px_white] hover:scale-[1.04]">
            Sign up
          </Link>
        </p>
        </motion.div>
</div>
</motion.div>
      </div>
    </div>
  );
}