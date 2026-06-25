"use client";
import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch } from "@/services/api";

export default function CompanionDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && history.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const loadHistory = async () => {
    try {
      const data = await apiFetch("/chat/history");
      if (data && data.success && data.data) {
        setConversationId(data.data.id);
        setHistory(data.data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setHistory(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const data = await apiFetch("/chat", {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.content, conversationId })
      });
      
      if (data.success) {
        setConversationId(data.data.conversationId);
        setHistory(prev => [...prev, data.data.reply]);
      } else {
        toast.error("Failed to send message.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/20 transition-transform hover:scale-105"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0a0a0f] border-l border-white/5 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white/90 font-semibold text-sm">Reality Companion</h2>
              <p className="text-white/40 text-xs">Analytical Reflection Partner</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {history.length === 0 && !isLoading && (
            <div className="text-center py-12 px-4">
              <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-sm">Hello. I am here to help you reflect on your habits and align your actions with your goals.</p>
            </div>
          )}
          
          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/80 border border-white/5'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask for an analysis..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit" 
              disabled={!message.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
