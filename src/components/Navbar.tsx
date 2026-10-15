import React from 'react';
import { Search, Heart, Send, Sparkles, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  onSearchClick: () => void;
  onHomeClick: () => void;
  onSavedClick: () => void;
  onTelegramClick: () => void;
  savedCount: number;
  currentView: 'home' | 'course' | 'saved';
  courseName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearchClick,
  onHomeClick,
  onSavedClick,
  onTelegramClick,
  savedCount,
  currentView,
  courseName
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-pink-panel border-b border-pink-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand / Back */}
        <div className="flex items-center gap-3 shrink-0">
          {currentView !== 'home' ? (
            <button
              onClick={onHomeClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 border border-pink-500/30 text-xs sm:text-sm font-semibold transition"
              title="Back to all batches"
            >
              <ArrowLeft className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">Batches</span>
            </button>
          ) : null}

          <div
            onClick={onHomeClick}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src="https://i.ibb.co/0R7qc34v/1093.jpg"
                alt="GB STUDY Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border-2 border-pink-500/60 shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
                }}
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500 border border-pink-200"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-heading">
                  GB <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500">STUDY</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded">
                  100% FREE
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-pink-300/80 font-medium tracking-wide">
                Free Batches, Lectures & Notes
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search input button */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl bg-pink-950/30 hover:bg-pink-950/50 border border-pink-500/30 text-pink-200/70 text-sm transition group"
          >
            <Search className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition" />
            <span className="text-xs sm:text-sm truncate">
              Search 29+ batches, 10th, 12th science, physics, maths...
            </span>
            <kbd className="hidden md:inline-block ml-auto text-[10px] px-1.5 py-0.5 rounded bg-pink-900/60 text-pink-300 border border-pink-700/50">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile search icon */}
          <button
            onClick={onSearchClick}
            className="sm:hidden p-2 rounded-xl bg-pink-950/40 text-pink-300 border border-pink-500/30 hover:bg-pink-900/50"
            title="Search"
          >
            <Search className="w-4 h-4 text-pink-400" />
          </button>

          {/* Saved Batches */}
          <button
            onClick={onSavedClick}
            className={`relative p-2 sm:px-3 sm:py-2 rounded-xl border transition flex items-center gap-1.5 ${
              currentView === 'saved'
                ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/30'
                : 'bg-pink-950/40 hover:bg-pink-900/60 text-pink-200 border-pink-500/30'
            }`}
            title="Saved Batches"
          >
            <Heart className={`w-4 h-4 ${savedCount > 0 ? 'fill-pink-500 text-pink-500' : 'text-pink-400'}`} />
            <span className="hidden md:inline text-xs font-semibold">Saved</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-pink-600 text-white rounded-full">
                {savedCount}
              </span>
            )}
          </button>

          {/* Telegram Channel Button */}
          <button
            onClick={onTelegramClick}
            className="btn-pink-gradient px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            <Send className="w-3.5 h-3.5 text-white" />
            <span className="hidden xs:inline">Join Telegram</span>
            <span className="xs:hidden">Telegram</span>
          </button>
        </div>
      </div>
    </header>
  );
};
