'use client';

import { SessionProvider } from "next-auth/react";
import { usePathname } from 'next/navigation';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-b from-black to-zinc-800">
        {children}
      </div>
    </SessionProvider>
  );
} 