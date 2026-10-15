import React from 'react';
import { Send, Heart, BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onTelegramClick: () => void;
  onHomeClick: () => void;
  onSavedClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onTelegramClick,
  onHomeClick,
  onSavedClick
}) => {
  return (
    <footer className="mt-16 border-t border-pink-500/20 glass-pink-panel pb-20 sm:pb-8 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-pink-500/15 text-center md:text-left">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <img
              src="https://i.ibb.co/0R7qc34v/1093.jpg"
              alt="GB STUDY"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-500/60 shadow-lg shadow-pink-600/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
              }}
            />
            <div>
              <span className="text-xl sm:text-2xl font-black text-white font-heading">
                GB <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">STUDY</span>
              </span>
              <p className="text-xs text-pink-300/80 font-medium">
                Official Digital Learning Platform • 100% Free Forever
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-pink-200">
            <button onClick={onHomeClick} className="hover:text-white transition cursor-pointer">
              All Batches
            </button>
            <button onClick={onSavedClick} className="hover:text-white transition cursor-pointer">
              Saved Batches
            </button>
            <button onClick={onTelegramClick} className="hover:text-white transition flex items-center gap-1 cursor-pointer">
              <Send className="w-3.5 h-3.5 text-pink-400" />
              Telegram Channel
            </button>
          </div>
        </div>

        {/* Telegram promotion box */}
        <div className="my-6 p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-pink-900/20 to-pink-950/40 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-sm text-white font-heading flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Join the GB STUDY Telegram Community
            </h4>
            <p className="text-xs text-pink-300/80 mt-0.5">
              Get class updates, revision notes, daily quizzes, and exam tips directly on your phone.
            </p>
          </div>
          <button
            onClick={onTelegramClick}
            className="btn-pink-gradient py-2 px-5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-md shadow-pink-600/30 shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Join @GBFreestudy</span>
          </button>
        </div>

        {/* Bottom copy */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-pink-300/60 text-center sm:text-left">
          <p>© {new Date().getFullYear()} GB STUDY. Dedicated to quality free education for all students.</p>
          <div className="flex items-center gap-1.5 text-pink-400">
            <ShieldCheck className="w-4 h-4" />
            <span>No Account or Login Required • Free Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
