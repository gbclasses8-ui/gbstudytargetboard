import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Video, FileText, ArrowRight, Sparkles, Folder } from 'lucide-react';
import { Course, SearchIndexItem, LectureVideo, LecturePdf } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onPlayLecture: (course: Course, lecture: { title: string; asset?: string }, index: number) => void;
  onViewPdfNote: (course: Course, pdf: { title: string }, index: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  courses,
  onSelectCourse,
  onPlayLecture,
  onViewPdfNote
}) => {
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (searchIndex.length === 0) {
        fetch('/data/search_index.json')
          .then(res => res.json())
          .then(data => setSearchIndex(data))
          .catch(err => console.warn('Could not load search index:', err));
      }
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.trim().toLowerCase();

  // Filter courses
  const matchedCourses = cleanQuery
    ? courses.filter(c =>
        c.name.toLowerCase().includes(cleanQuery) ||
        (c.group && c.group.toLowerCase().includes(cleanQuery))
      )
    : courses.slice(0, 6);

  // Filter lectures across courses
  const matchedLectures: Array<{
    course: Course;
    title: string;
    asset?: string;
    path: string;
    type: 'video' | 'pdf';
  }> = [];

  if (cleanQuery && searchIndex.length > 0) {
    for (const item of searchIndex) {
      if (matchedLectures.length >= 20) break;
      const courseObj = courses.find(c => c.id === item.id) || (item as any);
      if (item.sampleLectures) {
        for (const lec of item.sampleLectures) {
          if (lec.title.toLowerCase().includes(cleanQuery)) {
            matchedLectures.push({
              course: courseObj,
              title: lec.title,
              asset: lec.asset,
              path: lec.path,
              type: lec.type
            });
            if (matchedLectures.length >= 20) break;
          }
        }
      }
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#140a1b] rounded-2xl border-2 border-pink-500/40 shadow-2xl shadow-pink-600/30 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 bg-[#1b0d24] border-b border-pink-500/25 flex items-center gap-3">
          <Search className="w-5 h-5 text-pink-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search batches, 10th matric, 12th science, urdu, physics..."
            className="w-full bg-transparent text-white placeholder-pink-300/50 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-pink-400 hover:text-white"
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 transition text-xs"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {/* Matched Batches Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Batches & Courses ({matchedCourses.length})
              </span>
              {!cleanQuery && (
                <span className="text-[10px] text-pink-300/60">Featured Batches</span>
              )}
            </div>

            {matchedCourses.length > 0 ? (
              <div className="space-y-1.5">
                {matchedCourses.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCourse(c);
                      onClose();
                    }}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-pink-950/20 hover:bg-pink-950/70 border border-pink-500/15 hover:border-pink-500/40 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={c.thumbnail || 'https://i.ibb.co/0R7qc34v/1093.jpg'}
                        alt={c.name}
                        className="w-10 h-10 rounded-lg object-cover border border-pink-500/30 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-300 transition truncate">
                          {c.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-pink-300/70">
                          <span className="text-pink-400 font-semibold">{c.group || 'Batch'}</span>
                          <span>•</span>
                          <span>{c.total_videos || 0} Lectures</span>
                          <span>•</span>
                          <span>{c.total_pdfs || 0} Notes</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-pink-300/60 italic py-2">No batches found matching "{query}"</p>
            )}
          </div>

          {/* Matched Lectures & Notes Section */}
          {cleanQuery && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />
                  Lectures & Topic Search ({matchedLectures.length})
                </span>
              </div>

              {matchedLectures.length > 0 ? (
                <div className="space-y-1.5">
                  {matchedLectures.map((lec, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onClose();
                        if (lec.type === 'video' && lec.asset) {
                          onPlayLecture(lec.course, { title: lec.title, asset: lec.asset }, idx + 1);
                        } else {
                          onViewPdfNote(lec.course, { title: lec.title }, idx + 1);
                        }
                      }}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-pink-950/20 hover:bg-pink-950/70 border border-pink-500/15 hover:border-pink-500/40 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          lec.type === 'video' ? 'bg-pink-600/30 text-pink-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {lec.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-pink-300 transition truncate">
                            {lec.title}
                          </p>
                          <p className="text-[10px] text-pink-300/70 truncate">
                            {lec.course.name} {lec.path ? `• ${lec.path}` : ''}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase shrink-0 ${
                        lec.type === 'video'
                          ? 'bg-pink-600 text-white shadow-sm'
                          : 'bg-emerald-600 text-white shadow-sm'
                      }`}>
                        {lec.type === 'video' ? 'Play' : 'Notes'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-pink-300/60 italic py-2">
                  No individual lectures matched "{query}". Check batch names above!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-[#170a20] border-t border-pink-500/20 flex items-center justify-between text-[11px] text-pink-400/80">
          <span>Search in all 29 GB STUDY Batches</span>
          <span className="hidden sm:inline">Use ↑ ↓ and Enter to navigate</span>
        </div>
      </div>
    </div>
  );
};
