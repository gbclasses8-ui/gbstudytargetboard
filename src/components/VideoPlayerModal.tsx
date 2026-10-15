import React, { useState } from 'react';
import { X, Play, CheckCircle2, ChevronLeft, ChevronRight, Maximize2, Sparkles, BookOpen } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoTitle: string;
  assetId: string;
  embedUrl?: string;
  videoUrl?: string;
  loading?: boolean;
  courseTitle?: string;
  lectureNumber?: number;
  onNextLecture?: () => void;
  onPrevLecture?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoTitle,
  assetId,
  embedUrl,
  videoUrl,
  loading = false,
  courseTitle,
  lectureNumber,
  onNextLecture,
  onPrevLecture,
  hasNext,
  hasPrev
}) => {
  const [isTheater, setIsTheater] = useState(false);

  if (!isOpen || !assetId) return null;

  const playerSrc = videoUrl || embedUrl || `https://targetboard.co.in/dashboard/video?v=${assetId}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative w-full bg-[#120818] rounded-2xl sm:rounded-3xl border-2 border-pink-500/50 shadow-2xl shadow-pink-600/40 overflow-hidden flex flex-col transition-all duration-300 ${
          isTheater ? 'max-w-6xl max-h-[98vh]' : 'max-w-4xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-[#1a0a24] to-[#14081c] border-b border-pink-500/25 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-pink-500/25 text-pink-300 border border-pink-500/40 uppercase tracking-wide">
                {lectureNumber ? `Lecture #${lectureNumber}` : 'Video Lecture'}
              </span>
              {courseTitle && (
                <span className="text-xs text-pink-300/80 font-medium truncate hidden sm:inline">
                  {courseTitle}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate mt-1">
              {videoTitle || 'GB STUDY Lecture Stream'}
            </h3>
          </div>

          {/* Top Actions: Theater mode + Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsTheater(!isTheater)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 text-xs font-semibold transition cursor-pointer"
              title={isTheater ? 'Standard View' : 'Theater Mode'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isTheater ? 'Compact' : 'Theater'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/40 transition cursor-pointer"
              aria-label="Close Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Area - Directly plays with HTML5/YouTube embed */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
              <p className="text-sm font-bold text-pink-300 font-heading">
                Loading GB STUDY Stream...
              </p>
            </div>
          ) : (
            <iframe
              src={playerSrc}
              title={videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        {/* Modal Footer Bar: Navigation & Quality Badge */}
        <div className="p-3 sm:p-4 bg-[#14081c] border-t border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          {/* Status info */}
          <div className="flex items-center gap-2 text-pink-200/90">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Direct Streaming Active</span>
            <span className="text-pink-300/60">• 100% Free on GB STUDY</span>
          </div>

          {/* Next / Previous Lecture navigation */}
          <div className="flex items-center gap-2">
            {hasPrev && onPrevLecture && (
              <button
                onClick={onPrevLecture}
                className="px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-200 border border-pink-500/30 flex items-center gap-1 font-semibold transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Lecture</span>
              </button>
            )}

            {hasNext && onNextLecture && (
              <button
                onClick={onNextLecture}
                className="btn-pink-gradient px-3 py-1.5 rounded-xl text-white font-bold flex items-center gap-1 shadow-md shadow-pink-600/30 transition cursor-pointer"
              >
                <span>Next Lecture</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
