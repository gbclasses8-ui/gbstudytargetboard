import React from 'react';
import { Video, FileText, Users, ArrowRight, Heart, Sparkles, Folder } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  isSaved: boolean;
  onToggleSave: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onSelect,
  isSaved,
  onToggleSave
}) => {
  // Format numbers nicely (e.g. 25.8k)
  const formatCount = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString();
  };

  const thumbnail = course.thumbnail || 'https://i.ibb.co/0R7qc34v/1093.jpg';

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative border border-pink-500/20 hover:border-pink-500/60 transition-all duration-300">
      {/* Top Media / Thumbnail */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-pink-950/40">
        <img
          src={thumbnail}
          alt={course.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140a1c] via-black/20 to-transparent" />

        {/* Batch Class Pill badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-950/80 backdrop-blur-md border border-pink-500/40 text-[11px] font-bold text-pink-200 uppercase tracking-wide">
          <Sparkles className="w-3 h-3 text-pink-400" />
          <span>{course.group || 'Batch'}</span>
        </div>

        {/* Save Bookmark Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(course);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition cursor-pointer ${
            isSaved
              ? 'bg-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/40'
              : 'bg-black/60 text-white/80 border-white/20 hover:bg-pink-950/80 hover:text-pink-300'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save Batch'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>

        {/* Active Enrollments Pill */}
        {course.enrollments ? (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-semibold text-pink-200 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-pink-500/30">
            <Users className="w-3.5 h-3.5 text-pink-400" />
            <span>{formatCount(course.enrollments)} students enrolled</span>
          </div>
        ) : null}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onSelect(course)}
            className="text-base sm:text-lg font-bold text-white font-heading hover:text-pink-300 cursor-pointer line-clamp-2 transition-colors mb-3 leading-snug"
          >
            {course.name}
          </h3>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-pink-950/30 border border-pink-500/15 text-center mb-4">
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-extrabold text-pink-300">
                {course.total_videos || 0}
              </span>
              <span className="text-[10px] text-pink-300/60 flex items-center gap-0.5 uppercase tracking-wider font-semibold">
                <Video className="w-2.5 h-2.5 text-pink-400" /> Videos
              </span>
            </div>
            <div className="flex flex-col items-center border-x border-pink-500/20">
              <span className="text-xs sm:text-sm font-extrabold text-pink-300">
                {course.total_pdfs || 0}
              </span>
              <span className="text-[10px] text-pink-300/60 flex items-center gap-0.5 uppercase tracking-wider font-semibold">
                <FileText className="w-2.5 h-2.5 text-pink-400" /> Notes
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs sm:text-sm font-extrabold text-pink-300">
                {course.total_folders || 0}
              </span>
              <span className="text-[10px] text-pink-300/60 flex items-center gap-0.5 uppercase tracking-wider font-semibold">
                <Folder className="w-2.5 h-2.5 text-pink-400" /> Folders
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: "Let's Study →" in Vibrant Pink */}
        <div className="pt-2">
          <button
            onClick={() => onSelect(course)}
            className="w-full btn-pink-gradient py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-pink-600/30 hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
          >
            <span>Let's Study</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
