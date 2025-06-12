"use client";

import { motion } from "motion/react";
import Image from 'next/image';
import logo from "./nt.png"
import { Outfit, Space_Grotesk } from 'next/font/google';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export default function Home() {
  return (
    <div className={`bg-gradient-to-b from-black to-zinc-800 text-white min-h-screen relative ${outfit.variable} ${spaceGrotesk.variable} font-outfit`}>
      
      
     
      <div className="w-full fixed    ">
        <motion.div 
        initial={{opacity:0, scale:0}}
        animate={{opacity:1, scale:1}}
        transition={{duration:0.6 , scale:{type:"spring",visualDuration:0.6 , bounce:0.3},}}
        > 
        
        <Image src={logo} alt="NexText Logo" className="w-30 fixed mx-auto " />
        
        <ul className=" top-0 right-0 flex  justify-end  font-bold">
          <li className=" mt-10 p-3 px-4 rounded-2xl shadow-[0_0_10px_white]  bg-zinc-800 hover:scale-[1.08]   hover:bg-white hover:text-black transition">
            <a href="/sign-up">Sign-Up</a>
          </li>
          <li className=" mt-10 p-3 px-6 mx-20 rounded-2xl shadow-[0_0_10px_white]  bg-zinc-800   hover:scale-[1.08]   hover:bg-white hover:text-black transition ">
            <a href="/login">Login</a>
          </li>
        </ul>
         </motion.div>

      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <motion.div 
        initial={{opacity:0, scale:0}}
        animate={{opacity:1, scale:1}}
        transition={{duration:0.6 , scale:{type:"spring",visualDuration:0.6 , bounce:0.3},}}
        > 
        <h1 className="text-7xl font-bold mb-8 text-shadow-[0_0_20px_white] ">Welcome to NexText</h1>
        </motion.div>
        <motion.div
        initial={{opacity:0, y:70}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.5, ease: "easeInOut" }}>
        <h2 className="mt-4 font-extrabold text-shadow-[0_0_10px_white]">Stay connected. Stay sharp.</h2>
        </motion.div>
        <motion.div
        initial={{opacity:0, y:70}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.7, ease: "easeInOut" }}>
        <h2 className="mt-2 font-extrabold text-shadow-[0_0_10px_white]">NexText is a modern messaging app built for speed and simplicity.</h2>
        </motion.div>
        <motion.div
        initial={{opacity:0, y:90}}
        animate={{opacity:1, y:0}}
        transition={{duration:0.8, ease: "easeInOut" }}>
        <h2 className="mt-2 font-extrabold text-shadow-[0_0_10px_white]">Chat seamlessly, organize conversations, and keep things moving — all in one sleek space.</h2>
        </motion.div>

        
      </div>
      <motion.div 
      initial={{opacity:0, y:0}}
      animate={{opacity:1, y:0}}
      transition={{duration:1, ease: "easeInOut" }}
      >
     <div className="bottom-0 fixed mb-10 text-center items-center w-full space-x-4 flex justify-center opacity-60"> 
         
         <a
           href="https://github.com/therealgone"
           target="_blank"
           rel="noopener noreferrer"
           className="transition hover:scale-110 hover:drop-shadow-[0_0_80px_white] hover:border hover:rounded-full hover:bg-white"
         >
           <img
             src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg"
             alt="GitHub"
             className="w-8 h-8 "
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
   </motion.div>   
    </div>
  );
}
