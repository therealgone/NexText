import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexText - Secure Chat",
  description: "A secure and private chat application with real-time messaging",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'NexText - Secure Chat',
    description: 'A secure and private chat application with real-time messaging',
    type: 'website',
    images: [
      {
        url: '/nt.png',
        width: 800,
        height: 600,
        alt: 'NexText Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexText - Secure Chat',
    description: 'A secure and private chat application with real-time messaging',
    images: ['/nt.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
