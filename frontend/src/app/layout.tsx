import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import CompanionDrawer from "@/components/CompanionDrawer";
import { Toaster } from "react-hot-toast";
import { 
  LayoutDashboard, LineChart, BrainCircuit, Activity, BookOpen, Settings, 
  Target, List, PlayCircle, HelpCircle, LogOut, Menu, X, Bell, Info, MessageSquare, Download, Sparkles 
} from 'lucide-react';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Reality Drift | AI Life Simulator",
  description: "AI productivity dashboard and life pattern simulator",
};

import { GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "881368379750-iaghrb7tjonptbnpsu6dsv4ecmkve4bo.apps.googleusercontent.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden text-white`}>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <Toaster position="top-center" />
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
            <Navbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0a0a0f]">
              {children}
            </main>
          </div>
          <CompanionDrawer />
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
