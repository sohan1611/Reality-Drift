import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Reality Drift | AI Life Simulator",
  description: "AI productivity dashboard and life pattern simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden text-white`}>
        <Toaster position="top-center" />
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-3 md:p-6 scrollbar-hide">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
