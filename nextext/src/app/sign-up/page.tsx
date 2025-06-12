"use client";

import { useState } from "react";
import Image from 'next/image';
import logo from "./nt.png"
import { Outfit, Space_Grotesk } from 'next/font/google';
import { motion } from "motion/react";

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});


export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("✅ Account created! Redirecting to login...");
      setName("");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } else {
      setMessage("❌ " + (data.error || "Registration failed"));
    }
  };

  return (
    <div className={`bg-gradient-to-t from-black to-zinc-800 text-white min-h-screen flex items-center justify-center ${outfit.variable} ${spaceGrotesk.variable} font-outfit`}>
      
      <div >
      <motion.div initial={{opacity:0,y:0}}
      animate={{opacity:1,y:0}}
      transition={{duration:1.5, ease: "easeInOut"}}>
        <Image src={logo} alt="NexText Logo" className="w-30 fixed top-0 left-0" />
      </motion.div>
        
      <motion.div initial={{opacity:0,x:0}}
      animate={{opacity:1,x:0}}
      transition={{duration:1.5, ease: "easeInOut"}}>
        <ul className="fixed top-0 right-0 p-10"> 
          <li>
            <a href="/" className=" font-bold  p-3 px-4 rounded-2xl shadow-[0_0_10px_white]  bg-zinc-800 hover:scale-[1.08]   hover:bg-white hover:text-black transition ">Home</a>
          </li>
        </ul>
      </motion.div>
        
        
      </div>
     
      <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.5, ease: "easeInOut"}}>
     
      <form
        onSubmit={handleSubmit}
        className="bg-gradient-to-t from-black/10 to-zinc-800  p-8 rounded-2xl  w-full max-w-md space-y-10  "
      >
        
         <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.6, ease: "easeInOut"}}>
        <h2 className="text-4xl font-bold text-center text-shadow-[0_0_15px_white] ">Create your account</h2>
 </motion.div>
 <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.7, ease: "easeInOut"}}>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded bg-zinc-700 focus:outline-none placeholder:text-white focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_white]"
          required
        />
        </motion.div>
 <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.8, ease: "easeInOut"}}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded bg-zinc-700 focus:outline-none placeholder:text-white focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_white]"
          required
        />
        </motion.div>
 <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.9, ease: "easeInOut"}}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded bg-zinc-700 focus:outline-none  placeholder:text-white focus:ring-2 focus:ring-white focus:shadow-[0_0_20px_white]"
          required
        />
        </motion.div>
 <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:0.95, ease: "easeInOut"}}>
        <button
          type="submit"
          className="w-full p-3 bg-zinc-800 rounded-2xl font-extrabold text-white text-shadow-[0_0_10px_white] hover:bg-white hover:scale-[1.05] hover:text-black hover:text-shadow-[0_0_30px_black]"
        >
          Sign Up
        </button>
        </motion.div>
 <motion.div initial={{opacity:0,y:90}}
      animate={{opacity:1,y:0}}
      transition={{duration:1, ease: "easeInOut"}}>
        <p className=" text-gray-400 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-white font-extrabold  text-shadow-[0_0_10px_white] hover:scale-[1.04]">
            Log in
          </a>
        </p>
</motion.div>
        {message && (
          <p className="text-center text-sm mt-4">
            {message}
          </p>
        )}
      </form>
      </motion.div>
      <div className="fixed bottom-5 f-w-full text-center items-center w-full space-x-4 flex justify-center opacity-80 hover:animate-pulse">
        <a
          href="https://github.com/therealgone"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:scale-110 hover:drop-shadow-[0_0_80px_white] hover:border hover:rounded-full hover:bg-white"
        >
          <img
            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
            alt="GitHub"
            className="w-8 h-8 filter brightness-0 invert hover:invert-0"
          />
         </a>

       <h1>Developed By Jeevan Baabu Murugan</h1>
  <a
    href="https://www.linkedin.com/in/jeevan-baabu-97a19125b/"
    target="_blank"
    rel="noopener noreferrer"
    className="transition hover:scale-110 hover:drop-shadow-[0_0_80px_white] hover:border hover:rounded hover:bg-white "
  >
    <img
      src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linkedin/linkedin-original.svg"
      alt="LinkedIn"
      className="w-8 h-8 filter grayscale   "
    />
  </a>
  </div>
    </div>
  );
}
