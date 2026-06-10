"use client";

import { LayoutDashboard, FolderKanban, Activity, MessageSquare, Settings, User, HelpCircle, Info, Menu, X, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Simulator", icon: BrainCircuit, href: "/simulator" },
  { name: "Projects", icon: FolderKanban, href: "/projects" },
  { name: "Analytics", icon: Activity, href: "/analytics" },
  { name: "Messages", icon: MessageSquare, href: "/messages" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Help", icon: HelpCircle, href: "/help" },
  { name: "About Us", icon: Info, href: "/about" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-4 z-50 p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 h-full glass-panel flex flex-col border-r border-white/5 z-50
        fixed top-0 left-0
        md:!static md:!translate-x-0 md:!flex
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary glow-text">
            Reality Drift
          </h1>
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-primary/20 text-white border border-primary/30 shadow-[0_0_15px_rgba(138,43,226,0.3)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-secondary'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
