import React from 'react';
import { Home, BookOpen, Search, Send, Heart } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'home' | 'course' | 'saved';
  onHomeClick: () => void;
  onSearchClick: () => void;
  onSavedClick: () => void;
  onTelegramClick: () => void;
  savedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onHomeClick,
  onSearchClick,
  onSavedClick,
  onTelegramClick,
  savedCount
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120818]/95 backdrop-blur-lg border-t border-pink-500/30 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {/* Home */}
      <button
        onClick={onHomeClick}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
          currentView === 'home' ? 'text-pink-400 font-bold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Home</span>
      </button>

      {/* Batches */}
      <button
        onClick={onHomeClick}
        className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
          currentView === 'home' ? 'text-pink-400 font-bold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <BookOpen className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Batches</span>
      </button>

      {/* Search */}
      <button
        onClick={onSearchClick}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-pink-300/60 hover:text-pink-200 transition"
      >
        <Search className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Search</span>
      </button>

      {/* Telegram */}
      <button
        onClick={onTelegramClick}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl text-pink-300/60 hover:text-pink-200 transition"
      >
        <Send className="w-5 h-5 mb-0.5" />
        <span className="text-[10px]">Telegram</span>
      </button>

      {/* Saved */}
      <button
        onClick={onSavedClick}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
          currentView === 'saved' ? 'text-pink-400 font-bold' : 'text-pink-300/60 hover:text-pink-200'
        }`}
      >
        <Heart className={`w-5 h-5 mb-0.5 ${savedCount > 0 ? 'fill-pink-500 text-pink-500' : ''}`} />
        <span className="text-[10px]">Saved</span>
        {savedCount > 0 && (
          <span className="absolute top-0 right-1 px-1 text-[9px] font-bold bg-pink-600 text-white rounded-full">
            {savedCount}
          </span>
        )}
      </button>
    </nav>
  );
};
