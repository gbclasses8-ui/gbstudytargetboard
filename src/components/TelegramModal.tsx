import React from 'react';
import { Send, X, Bell, Sparkles, BookOpen, FileText } from 'lucide-react';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUrl?: string;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({
  isOpen,
  onClose,
  telegramUrl = 'https://t.me/GBFreestudy'
}) => {
  if (!isOpen) return null;

  const handleJoin = () => {
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-[#1f1025] to-[#120917] rounded-3xl border-2 border-pink-500/50 shadow-2xl shadow-pink-600/30 overflow-hidden transform transition-all p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing background blurs */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-600/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo and Icon Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-3">
            <img
              src="https://i.ibb.co/0R7qc34v/1093.jpg"
              alt="GB STUDY"
              className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-400 shadow-xl shadow-pink-500/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-pink-500 p-1.5 rounded-full text-white shadow-lg border-2 border-[#1f1025]">
              <Send className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Official Community
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
            Join GB STUDY Telegram Channel
          </h3>
        </div>

        {/* Description & Perks */}
        <p className="text-pink-200/90 text-sm mb-5 leading-relaxed">
          Stay ahead in your board exams with instant class alerts, high-quality chapter panel notes, revision PDFs, and daily practice sets!
        </p>

        <div className="grid grid-cols-2 gap-2 mb-6 text-left">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200">
            <FileText className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Instant PDF Notes</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200">
            <Bell className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Live Class Alerts</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200">
            <BookOpen className="w-4 h-4 text-pink-400 shrink-0" />
            <span>29+ Free Batches</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs text-pink-200">
            <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
            <span>100% Free Forever</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleJoin}
            className="flex-1 btn-pink-gradient py-3 px-5 rounded-2xl font-extrabold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-pink-600/40 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Join Telegram
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-2xl font-semibold text-pink-300 hover:text-white bg-pink-950/50 hover:bg-pink-900/60 border border-pink-500/30 text-sm transition cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="mt-4 text-[11px] text-pink-400/70 font-mono">
          https://t.me/GBFreestudy
        </div>
      </div>
    </div>
  );
};
