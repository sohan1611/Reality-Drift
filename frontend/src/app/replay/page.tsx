"use client";
import { useState, useEffect } from "react";
import { PlayCircle, Target, Award, Brain, Clock, Activity, ChevronRight, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { getReplay } from "@/services/replay";

export default function ReplayPage() {
  const [replay, setReplay] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const fetchReplay = async () => {
      try {
        const data = await getReplay();
        if (data.success && data.data) {
          setReplay(data.data);
        }
      } catch (e) {
        toast.error("Failed to load replay.");
      }
      setIsLoading(false);
    };
    fetchReplay();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center">
          <PlayCircle className="w-12 h-12 text-white/20 mb-4 animate-bounce" />
          <p className="text-white/40 tracking-widest text-sm font-bold uppercase">Loading your Reality...</p>
        </div>
      </div>
    );
  }

  if (!replay) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-4">
          <PlayCircle className="w-12 h-12 text-white/20 mx-auto" />
          <h2 className="text-xl font-bold text-white/90">Not enough data</h2>
          <p className="text-white/50 text-sm">Log a few days to unlock your Reality Replay.</p>
        </div>
      </div>
    );
  }

  const slides = [
    {
      title: "Your Journey So Far",
      icon: <Activity className="w-16 h-16 text-indigo-400" />,
      content: (
        <div className="space-y-6 text-center">
          <p className="text-4xl font-black text-white">{replay.totalDaysLogged}</p>
          <p className="text-white/60 font-medium uppercase tracking-widest text-sm">Days Logged</p>
          <p className="text-white/40 text-sm mt-4">Since {new Date(replay.firstLogDate).toLocaleDateString()}</p>
        </div>
      )
    },
    {
      title: "Deep Work",
      icon: <Brain className="w-16 h-16 text-emerald-400" />,
      content: (
        <div className="space-y-6 text-center">
          <p className="text-6xl font-black text-white">{replay.totalFocusHours}</p>
          <p className="text-white/60 font-medium uppercase tracking-widest text-sm">Total Hours Focused</p>
          <div className="w-full h-1 bg-white/10 rounded-full mt-8 overflow-hidden">
            <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
          </div>
        </div>
      )
    },
    {
      title: "Best Day",
      icon: <Award className="w-16 h-16 text-amber-400" />,
      content: (
        <div className="space-y-6 text-center">
          <p className="text-5xl font-black text-white">{replay.bestScore}</p>
          <p className="text-white/60 font-medium uppercase tracking-widest text-sm">Reality Score Achieved</p>
          <p className="text-white/90 font-medium bg-white/5 px-4 py-2 rounded-lg inline-block">
            {new Date(replay.bestDay).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
      )
    },
    {
      title: "Your Vibe",
      icon: <Target className="w-16 h-16 text-pink-400" />,
      content: (
        <div className="space-y-6 text-center">
          <p className="text-4xl font-black text-white px-4 leading-tight">{replay.moodPersona}</p>
          <p className="text-white/60 font-medium uppercase tracking-widest text-sm">Calculated Persona</p>
          <p className="text-white/40 text-sm mt-4 px-8">Based on your mood patterns and emotional consistency over time.</p>
        </div>
      )
    }
  ];

  const nextSlide = () => setSlide(s => Math.min(s + 1, slides.length - 1));
  const prevSlide = () => setSlide(s => Math.max(s - 1, 0));

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full relative group">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8 w-full px-4">
          {slides.map((_, i) => (
            <div key={i} className="h-1 bg-white/10 flex-1 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-500 ${i <= slide ? 'w-full' : 'w-0'}`}
              ></div>
            </div>
          ))}
        </div>

        {/* Slide Content */}
        <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] rounded-3xl p-12 aspect-[4/5] flex flex-col items-center justify-center relative overflow-hidden text-center shadow-2xl">
          
          <div className="absolute top-12 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100">
            {slides[slide].icon}
          </div>

          <div className="mt-8 z-10 w-full animate-in zoom-in-95 fade-in duration-500">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-12">{slides[slide].title}</h2>
            {slides[slide].content}
          </div>

          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl -z-10"></div>
        </div>

        {/* Controls */}
        <div className="absolute top-1/2 -left-6 md:-left-12 -translate-y-1/2">
          <button 
            onClick={prevSlide}
            disabled={slide === 0}
            className={`p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md ${slide === 0 ? 'opacity-0' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="absolute top-1/2 -right-6 md:-right-12 -translate-y-1/2">
          <button 
            onClick={nextSlide}
            disabled={slide === slides.length - 1}
            className={`p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md ${slide === slides.length - 1 ? 'opacity-0' : 'opacity-100'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}
