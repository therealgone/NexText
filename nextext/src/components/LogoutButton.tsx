"use client";

import { signOut } from "next-auth/react";

export default function logoutbutton(){
    return(
        <button onClick={()=> signOut()} className=" text-white   hover:bg-red-600mt-10 p-3  py-3 px-6 mx-5 rounded-2xl shadow-[0_0_10px_white]  bg-zinc-800   hover:scale-[1.08]   hover:bg-white hover:text-black transition font-extrabold ">Logout</button>
    );
}