"use client";

import { motion } from "motion/react";
import Image from 'next/image';
import logo from "./nt.png"


export default function Home() {
  return (
    <div className="bg-gradient-to-b from-black  to-zinc-800  text-white min-h-screen relative">
      
      
     
      <div className="w-full fixed    ">
        
        <Image src={logo} alt="NexText Logo" className="w-30 fixed h-auto  " />
        
        <ul className=" top-0 right-0 flex mt-10 justify-end  font-bold">
          <li className=" p-3 px-4 rounded-2xl bg-zinc-800 hover:scale-[1.04]   hover:bg-white hover:text-black transition">
            <a href="/sign-up">Sign-Up</a>
          </li>
          <li className="  p-3 px-6 mx-20 rounded-2xl bg-zinc-800   hover:scale-[1.04]   hover:bg-white hover:text-black transition ">
            <a href="login">Login</a>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-8">Welcome to NexText</h1>
      </div>
    </div>
  );
}
