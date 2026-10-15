import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Folder, 
  ChevronRight, 
  Video, 
  FileText, 
  Play, 
  Heart, 
  Send, 
  Users, 
  Search,
  BookOpen,
  FolderOpen,
  X,
  ChevronLeft,
  CheckCircle2,
  Volume2,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { Course, CourseDetailResponse, TreeNode, LectureVideo, LecturePdf, ActiveVideoState } from '../types';

interface CourseDetailViewProps {
  course: Course;
  detailData: CourseDetailResponse | null;
  loading: boolean;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (course: Course) => void;
  onPlayVideo: (video: LectureVideo, chapterTitle: string, index: number) => void;
  onViewPdf: (pdf: LecturePdf, chapterTitle: string, index: number) => void;
  onJoinTelegram: () => void;
  activeVideo?: ActiveVideoState | null;
  onCloseActiveVideo?: () => void;
  onExpandVideoModal?: () => void;
  onNextLecture?: () => void;
  onPrevLecture?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({
  course,
  detailData,
  loading,
  onBack,
  isSaved,
  onToggleSave,
  onPlayVideo,
  onViewPdf,
  onJoinTelegram,
  activeVideo,
  onCloseActiveVideo,
  onExpandVideoModal,
  onNextLecture,
  onPrevLecture,
  hasNext,
  hasPrev
}) => {
  // Folder expansion state (set of opened folder IDs)
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  // Active tab per folder: 'videos' | 'pdfs'
  const [folderTabs, setFolderTabs] = useState<Record<string, 'videos' | 'pdfs'>>({});
  // Local search filter inside current course
  const [localSearch, setLocalSearch] = useState<string>('');

  // Auto-scroll smoothly to video player when lecture starts
  useEffect(() => {
    if (activeVideo && activeVideo.assetId) {
      setTimeout(() => {
        const el = document.getElementById('active-video-player');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
    }
  }, [activeVideo?.assetId]);

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const setTab = (folderId: string, tab: 'videos' | 'pdfs') => {
    setFolderTabs(prev => ({
      ...prev,
      [folderId]: tab
    }));
  };

  const thumbnail = course.thumbnail || 'https://i.ibb.co/0R7qc34v/1093.jpg';

  // Recursive renderer for tree folders
  const renderFolderNode = (node: TreeNode, depth = 0, parentName = '') => {
    const hasVideos = Boolean(node.videos && node.videos.length > 0);
    const hasPdfs = Boolean(node.pdfs && node.pdfs.length > 0);
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const totalVideos = node.videos?.length || 0;
    const totalPdfs = node.pdfs?.length || 0;
    const totalItems = (node.children?.length || 0) + totalVideos + totalPdfs;

    const isOpen = openFolders[node.id] ?? (depth === 0);
    const activeTab = folderTabs[node.id] || (hasVideos ? 'videos' : 'pdfs');

    // Filter videos and pdfs by local search if search text is present
    const filteredVideos = (node.videos || []).filter(v => 
      !localSearch || v.title.toLowerCase().includes(localSearch.toLowerCase())
    );
    const filteredPdfs = (node.pdfs || []).filter(p => 
      !localSearch || p.title.toLowerCase().includes(localSearch.toLowerCase())
    );
    const filteredChildren = (node.children || []).filter(c => {
      if (!localSearch) return true;
      const matchName = c.name.toLowerCase().includes(localSearch.toLowerCase());
      const matchSub = (c.videos || []).some(v => v.title.toLowerCase().includes(localSearch.toLowerCase())) ||
                       (c.pdfs || []).some(p => p.title.toLowerCase().includes(localSearch.toLowerCase()));
      return matchName || matchSub;
    });

    const isMatch = !localSearch || 
                    node.name.toLowerCase().includes(localSearch.toLowerCase()) || 
                    filteredVideos.length > 0 || 
                    filteredPdfs.length > 0 || 
                    filteredChildren.length > 0;

    if (!isMatch) return null;

    return (
      <div 
        key={node.id} 
        className="mb-3 rounded-2xl overflow-hidden border border-pink-500/20 bg-[#160c1d] transition-all"
        style={{ marginLeft: `${Math.min(depth * 14, 28)}px` }}
      >
        {/* Folder Header Item */}
        <div
          onClick={() => toggleFolder(node.id)}
          className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none transition ${
            isOpen 
              ? 'bg-gradient-to-r from-pink-950/60 to-pink-900/30 text-white border-b border-pink-500/20' 
              : 'hover:bg-pink-950/40 text-pink-100'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-xl shrink-0 transition ${
              isOpen ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30' : 'bg-pink-950/70 text-pink-400 border border-pink-500/30'
            }`}>
              {isOpen ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            </div>

            <div className="min-w-0">
              <h4 className="font-bold text-sm sm:text-base font-heading truncate text-white">
                {node.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-pink-300/70">
                {totalVideos > 0 && (
                  <span className="flex items-center gap-1">
                    <Video className="w-3 h-3 text-pink-400" />
                    {totalVideos} Videos
                  </span>
                )}
                {totalPdfs > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-pink-400" />
                    {totalPdfs} Notes
                  </span>
                )}
                {hasChildren && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-pink-400" />
                    {node.children?.length} Subfolders
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/30">
              {totalItems} items
            </span>
            <ChevronRight className={`w-4 h-4 text-pink-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Folder Content (Visible when expanded) */}
        {isOpen && (
          <div className="p-3 sm:p-4 bg-[#110817] space-y-4">
            {/* Tab switch for Videos / Notes if this folder has content */}
            {(hasVideos || hasPdfs) && (
              <div className="flex items-center gap-2 p-1 rounded-xl bg-pink-950/40 border border-pink-500/20 max-w-sm">
                {hasVideos && (
                  <button
                    onClick={() => setTab(node.id, 'videos')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'videos'
                        ? 'btn-pink-gradient text-white shadow-sm shadow-pink-600/40'
                        : 'text-pink-300 hover:text-white'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    Videos ({totalVideos})
                  </button>
                )}
                {hasPdfs && (
                  <button
                    onClick={() => setTab(node.id, 'pdfs')}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'pdfs'
                        ? 'btn-pink-gradient text-white shadow-sm shadow-pink-600/40'
                        : 'text-pink-300 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF Notes ({totalPdfs})
                  </button>
                )}
              </div>
            )}

            {/* Videos List */}
            {hasVideos && activeTab === 'videos' && (
              <div className="space-y-2">
                {filteredVideos.map((video, vIdx) => {
                  const isCurrent = activeVideo?.assetId === video.asset;
                  return (
                    <div
                      key={`${video.asset}_${vIdx}`}
                      onClick={() => onPlayVideo(video, node.name, vIdx + 1)}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition cursor-pointer group ${
                        isCurrent
                          ? 'bg-pink-950/80 border-pink-500 shadow-md shadow-pink-600/30'
                          : 'bg-pink-950/20 hover:bg-pink-950/60 border-pink-500/15 hover:border-pink-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                          isCurrent
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-pink-600/30 group-hover:bg-pink-600 border border-pink-500/40 text-pink-300 group-hover:text-white'
                        }`}>
                          {isCurrent ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs sm:text-sm font-semibold truncate transition ${
                            isCurrent ? 'text-pink-300 font-bold' : 'text-white group-hover:text-pink-300'
                          }`}>
                            {video.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-pink-400 font-mono">
                              Lecture #{vIdx + 1}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-pink-500 text-white uppercase">
                                Playing Now
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className={`py-1.5 px-3 sm:px-4 rounded-lg font-bold text-xs shrink-0 flex items-center gap-1 transition ${
                        isCurrent 
                          ? 'bg-pink-500 text-white shadow-md shadow-pink-500/40' 
                          : 'btn-pink-gradient text-white shadow-sm shadow-pink-600/30'
                      }`}>
                        <span>{isCurrent ? 'Playing' : 'Play'}</span>
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PDFs List */}
            {hasPdfs && activeTab === 'pdfs' && (
              <div className="space-y-2">
                {filteredPdfs.map((pdf, pIdx) => (
                  <div
                    key={`${pdf.title}_${pIdx}`}
                    onClick={() => onViewPdf(pdf, node.name, pIdx + 1)}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-pink-950/20 hover:bg-pink-950/60 border border-pink-500/15 hover:border-pink-500/40 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-600 border border-emerald-500/30 text-emerald-400 group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition truncate">
                          {pdf.title}
                        </p>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          Panel Note #{pIdx + 1} • Verified Study Material
                        </span>
                      </div>
                    </div>

                    <button className="py-1.5 px-3 sm:px-4 rounded-lg font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40 shrink-0 flex items-center gap-1 shadow-sm">
                      <span>Read Notes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Child Folders (Subfolders) */}
            {hasChildren && (
              <div className="space-y-2 pt-2">
                {filteredChildren.map(child => renderFolderNode(child, depth + 1, node.name))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 border border-pink-500/30 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-pink-400" />
          <span>Back to All Batches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleSave(course)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border transition cursor-pointer ${
              isSaved
                ? 'bg-pink-600 text-white border-pink-400'
                : 'bg-pink-950/50 hover:bg-pink-900 text-pink-200 border-pink-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : 'text-pink-400'}`} />
            <span>{isSaved ? 'Saved Batch' : 'Save Batch'}</span>
          </button>

          <button
            onClick={onJoinTelegram}
            className="btn-pink-gradient px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 shadow-md shadow-pink-600/30 hover:scale-105 transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join Telegram</span>
          </button>
        </div>
      </div>

      {/* Course Banner Hero Card */}
      <div className="glass-card rounded-3xl p-5 sm:p-8 border border-pink-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-10">
          <div className="w-full md:w-80 aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden bg-pink-950/60 border-2 border-pink-500/40 shrink-0 shadow-xl shadow-pink-600/20">
            <img
              src={thumbnail}
              alt={course.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.ibb.co/0R7qc34v/1093.jpg';
              }}
            />
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/40">
                {course.group || 'Batch'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                100% Free Access
              </span>
              {course.enrollments ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-950/60 text-pink-300 border border-pink-500/30">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  {course.enrollments.toLocaleString()} enrolled
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-heading leading-tight">
              {course.name}
            </h1>

            <p className="text-sm sm:text-base text-pink-200/90 leading-relaxed max-w-3xl">
              Complete syllabus lectures, official faculty panel notes, chapterwise video walkthroughs, and practice sets. Prepared for board exam excellence.
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs sm:text-sm text-pink-200">
                <Video className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-white">{course.total_videos || 0}</span>
                <span className="text-pink-300/70">Lectures</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs sm:text-sm text-pink-200">
                <FileText className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-white">{course.total_pdfs || 0}</span>
                <span className="text-pink-300/70">Panel Notes</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs sm:text-sm text-pink-200">
                <Folder className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-white">{course.total_folders || 0}</span>
                <span className="text-pink-300/70">Subject Folders</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* INLINE VIDEO PLAYER (Official Previous Website System with Real Lecture Stream) */}
      {activeVideo && activeVideo.assetId && (
        <div id="active-video-player" className="glass-card rounded-3xl overflow-hidden border-2 border-pink-500 shadow-2xl shadow-pink-600/30 animate-in fade-in slide-in-from-top-4 duration-300 scroll-mt-20">
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#1c0c27] to-[#14081c] border-b border-pink-500/30 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-ping" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500 text-white uppercase tracking-wider">
                    {activeVideo.index ? `Lecture #${activeVideo.index}` : "Playing Now"}
                  </span>
                  <span className="text-xs text-pink-300/80 font-medium truncate">
                    {activeVideo.courseTitle || course.name}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate mt-0.5">
                  {activeVideo.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {activeVideo.videoUrl && (
                <a
                  href={activeVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pink-gradient px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition hover:scale-105"
                  title="Open Official Fullscreen Stream (Previous Website Player)"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Player</span>
                </a>
              )}
              {hasPrev && onPrevLecture && (
                <button
                  onClick={onPrevLecture}
                  className="px-2.5 py-1.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-200 border border-pink-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
              )}
              {hasNext && onNextLecture && (
                <button
                  onClick={onNextLecture}
                  className="btn-pink-gradient px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {onCloseActiveVideo && (
                <button
                  onClick={onCloseActiveVideo}
                  className="p-1.5 rounded-xl bg-pink-950/70 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 cursor-pointer transition"
                  title="Close Player"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Embedded Video Player with Fallback & Direct Link */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {activeVideo.loading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
                <p className="text-sm font-bold text-pink-300 font-heading">
                  Connecting to GB STUDY Official Lecture Stream...
                </p>
                <p className="text-xs text-pink-400/70 font-mono">
                  Loading: {activeVideo.title}
                </p>
              </div>
            ) : (
              <iframe
                src={activeVideo.videoUrl || activeVideo.embedUrl}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
              />
            )}
          </div>

          <div className="px-4 py-2.5 bg-[#14081c] border-t border-pink-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-pink-300/80">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-white">GB STUDY Official Stream Active</span>
              <span className="text-pink-400">• Real Batch Lecture</span>
            </div>
            <div className="flex items-center gap-3">
              {activeVideo.videoUrl && (
                <a
                  href={activeVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-300 hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <span>Open Stream in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {hasPrev && onPrevLecture && (
                <button onClick={onPrevLecture} className="hover:text-pink-200 underline cursor-pointer">Previous</button>
              )}
              {hasNext && onNextLecture && (
                <button onClick={onNextLecture} className="hover:text-pink-200 underline cursor-pointer">Next Lecture →</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Content Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-pink-500" />
              Course Curriculum & Content
            </h2>
            <p className="text-xs sm:text-sm text-pink-300/70 mt-0.5">
              Select folders to view chapter lectures, video classes, and verified notes
            </p>
          </div>

          {/* Search filter within course */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter chapters or lectures..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-pink-950/30 border border-pink-500/30 text-white placeholder-pink-400/50 text-xs focus:outline-none focus:border-pink-400"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-pink-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tree Content Rendering */}
        {loading ? (
          <div className="p-12 text-center rounded-2xl glass-card">
            <div className="w-10 h-10 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-pink-200 font-bold text-sm">Loading curriculum, videos and notes...</p>
          </div>
        ) : detailData && detailData.tree && detailData.tree.length > 0 ? (
          <div className="space-y-3">
            {detailData.tree.map(node => renderFolderNode(node, 0))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl glass-card border border-pink-500/20 text-pink-300">
            <BookOpen className="w-12 h-12 text-pink-500/50 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Batch Content Scheduled</h4>
            <p className="text-xs text-pink-300/70 max-w-md mx-auto">
              Lectures and panel notes for this upcoming batch will be synchronized automatically. Stay tuned on our Telegram channel for live notifications!
            </p>
            <button
              onClick={onJoinTelegram}
              className="mt-4 btn-pink-gradient py-2 px-5 rounded-xl font-bold text-xs text-white inline-flex items-center gap-1.5 shadow-md shadow-pink-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              Join Telegram for Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
