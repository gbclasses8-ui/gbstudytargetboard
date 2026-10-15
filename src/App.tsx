import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  FileText, 
  Users, 
  Send, 
  Search, 
  GraduationCap, 
  BookOpen, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FolderOpen
} from 'lucide-react';
import { Course, CourseDetailResponse, LectureVideo, LecturePdf, TreeNode, ActiveVideoState } from './types';
import { Navbar } from './components/Navbar';
import { CourseCard } from './components/CourseCard';
import { CourseDetailView } from './components/CourseDetailView';
import { SavedBatchesView } from './components/SavedBatchesView';
import { TelegramModal } from './components/TelegramModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfModal } from './components/PdfModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

export default function App() {
  // Courses catalog state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  // Active view: 'home' | 'course' | 'saved'
  const [view, setView] = useState<'home' | 'course' | 'saved'>('home');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Course detail & folder tree data
  const [courseDetail, setCourseDetail] = useState<CourseDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Saved / Bookmarked courses in localStorage
  const [savedCourses, setSavedCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem('gb_study_saved');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Last visited course for "Continue Learning"
  const [lastCourse, setLastCourse] = useState<Course | null>(() => {
    try {
      const stored = localStorage.getItem('gb_study_last_course');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Selected Category filter
  const [category, setCategory] = useState<string>('all');
  const [homeSearchQuery, setHomeSearchQuery] = useState<string>('');

  // Modals
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(true);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Video Player state
  const [activeVideo, setActiveVideo] = useState<ActiveVideoState | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // PDF Notes Viewer state
  const [activePdf, setActivePdf] = useState<{
    title: string;
    courseTitle?: string;
    chapterTitle?: string;
    index?: number;
  } | null>(null);

  // 1. Fetch initial course catalog
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        // Try internal API first, then static json fallback
        let data: Course[] = [];
        try {
          const res = await fetch('/api/courses');
          if (res.ok) {
            const json = await res.json();
            data = json.courses || [];
          }
        } catch {
          // fallback
        }

        if (!data || data.length === 0) {
          const staticRes = await fetch('/data/courses_list.json');
          if (staticRes.ok) {
            data = await staticRes.json();
          }
        }

        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses list:', err);
      } finally {
        setLoadingCourses(false);
      }
    }

    loadCourses();
  }, []);

  // Keyboard shortcut Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save courses to localStorage
  const handleToggleSave = (course: Course) => {
    setSavedCourses(prev => {
      const exists = prev.some(c => c.id === course.id);
      let updated: Course[];
      if (exists) {
        updated = prev.filter(c => c.id !== course.id);
      } else {
        updated = [...prev, course];
      }
      try {
        localStorage.setItem('gb_study_saved', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearSaved = () => {
    setSavedCourses([]);
    try {
      localStorage.removeItem('gb_study_saved');
    } catch {}
  };

  // Open a course
  const handleOpenCourse = async (course: Course) => {
    setSelectedCourse(course);
    setView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Store in continue learning
    setLastCourse(course);
    try {
      localStorage.setItem('gb_study_last_course', JSON.stringify(course));
    } catch {}

    // Fetch course details
    try {
      setLoadingDetail(true);
      let detail: CourseDetailResponse | null = null;

      try {
        const res = await fetch(`/api/course/${course.id}`);
        if (res.ok) {
          detail = await res.json();
        }
      } catch {}

      if (!detail) {
        const staticRes = await fetch(`/data/courses/${course.id}.json`);
        if (staticRes.ok) {
          detail = await staticRes.json();
        }
      }

      setCourseDetail(detail);
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Flat list of videos in current course for next/prev playlist navigation
  const allCourseVideos = React.useMemo(() => {
    if (!courseDetail || !courseDetail.tree) return [];
    const list: Array<{ video: LectureVideo; chapterTitle: string; index: number }> = [];
    let count = 0;
    function traverse(nodes: TreeNode[], parentName = '') {
      for (const node of nodes) {
        const chapter = parentName ? `${parentName} > ${node.name}` : node.name;
        if (node.videos && node.videos.length > 0) {
          for (const v of node.videos) {
            count++;
            list.push({ video: v, chapterTitle: chapter, index: count });
          }
        }
        if (node.children && node.children.length > 0) {
          traverse(node.children, chapter);
        }
      }
    }
    traverse(courseDetail.tree);
    return list;
  }, [courseDetail]);

  const currentVideoIndex = activeVideo
    ? allCourseVideos.findIndex(item => item.video.asset === activeVideo.assetId)
    : -1;

  const hasPrev = currentVideoIndex > 0;
  const hasNext = currentVideoIndex >= 0 && currentVideoIndex < allCourseVideos.length - 1;

  // Play video lecture with exact previous website stream system
  const handlePlayVideo = async (video: LectureVideo, chapterTitle: string, index: number, openNewTab = true) => {
    const courseTitle = selectedCourse ? `${selectedCourse.name} • ${chapterTitle}` : chapterTitle;

    // Immediately open styled loading tab (exact previous website system)
    let win: Window | null = null;
    if (openNewTab) {
      try {
        win = window.open("", "_blank");
        if (win) {
          win.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${video.title || "GB STUDY Lecture"}</title>
                <style>
                  body { margin: 0; background: #0c0910; color: #fff; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
                  .spinner { width: 48px; height: 48px; border: 4px solid rgba(236,72,153,0.15); border-top-color: #ec4899; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 20px; }
                  @keyframes spin { to { transform: rotate(360deg); } }
                  h2 { font-size: 22px; font-weight: 800; margin: 0 0 10px; background: linear-gradient(135deg, #f472b6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                  p { font-size: 13px; color: #f472b6; font-family: monospace; max-width: 420px; line-height: 1.6; }
                </style>
              </head>
              <body>
                <div class="spinner"></div>
                <h2>GB STUDY Official Stream</h2>
                <p>Opening lecture: ${video.title || "Video"} in player tab...</p>
              </body>
            </html>
          `);
        }
      } catch (err) {}
    }

    // Set active video on page for in-page player
    setActiveVideo({
      assetId: video.asset,
      title: video.title,
      courseTitle,
      index,
      loading: true,
      videoUrl: "",
      embedUrl: ""
    });

    try {
      const res = await fetch(`/api/video?asset=${encodeURIComponent(video.asset)}&title=${encodeURIComponent(video.title)}`);
      if (res.ok) {
        const data = await res.json();
        const videoUrl = data.video_url;

        // Redirect stream tab
        if (win && !win.closed) {
          win.location.href = videoUrl;
        } else if (openNewTab) {
          const a = document.createElement("a");
          a.href = videoUrl;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }

        setActiveVideo(prev => {
          if (!prev || prev.assetId !== video.asset) return prev;
          return {
            ...prev,
            loading: false,
            videoUrl: videoUrl,
            embedUrl: videoUrl
          };
        });
        return;
      }
    } catch (err) {
      console.warn("API video fetch error:", err);
      if (win && !win.closed) win.close();
    }
  };

  const handlePrevLecture = () => {
    if (hasPrev) {
      const prev = allCourseVideos[currentVideoIndex - 1];
      handlePlayVideo(prev.video, prev.chapterTitle, prev.index, false);
    }
  };

  const handleNextLecture = () => {
    if (hasNext) {
      const next = allCourseVideos[currentVideoIndex + 1];
      handlePlayVideo(next.video, next.chapterTitle, next.index, false);
    }
  };

  // View PDF Notes
  const handleViewPdf = (pdf: LecturePdf, chapterTitle: string, index: number) => {
    setActivePdf({
      title: pdf.title,
      courseTitle: selectedCourse?.name,
      chapterTitle,
      index
    });
  };

  // Filter courses by category & query
  const filteredCourses = courses.filter(c => {
    // Category match
    let matchCat = true;
    if (category === '10th') {
      matchCat = (c.group && c.group.includes('10th')) || c.name.toLowerCase().includes('10th') || c.name.includes('मैट्रिक');
    } else if (category === '11th') {
      matchCat = (c.group && c.group.includes('11th')) || c.name.toLowerCase().includes('11th');
    } else if (category === '12th') {
      matchCat = (c.group && c.group.includes('12th')) || c.name.toLowerCase().includes('12th');
    } else if (category === 'polytechnic') {
      matchCat = c.name.toLowerCase().includes('polytechnic') || c.name.toLowerCase().includes('cuet');
    }

    // Search query match
    let matchQuery = true;
    if (homeSearchQuery.trim()) {
      const q = homeSearchQuery.trim().toLowerCase();
      matchQuery = c.name.toLowerCase().includes(q) || Boolean(c.group && c.group.toLowerCase().includes(q));
    }

    return Boolean(matchCat && matchQuery);
  });

  return (
    <div className="min-h-screen bg-[#0c0910] text-[#fce7f3] flex flex-col selection:bg-pink-500 selection:text-white">
      {/* Telegram Popup (Shown on open) */}
      <TelegramModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        telegramUrl="https://t.me/GBFreestudy"
      />

      {/* Video Streaming Modal (Only shown if expanded to theater) */}
      <VideoPlayerModal
        isOpen={Boolean(activeVideo && showVideoModal)}
        onClose={() => setShowVideoModal(false)}
        assetId={activeVideo?.assetId || ''}
        videoTitle={activeVideo?.title || ''}
        embedUrl={activeVideo?.embedUrl}
        videoUrl={activeVideo?.videoUrl}
        loading={activeVideo?.loading}
        courseTitle={activeVideo?.courseTitle}
        lectureNumber={activeVideo?.index}
        onNextLecture={handleNextLecture}
        onPrevLecture={handlePrevLecture}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />

      {/* PDF Notes Modal */}
      <PdfModal
        isOpen={Boolean(activePdf)}
        onClose={() => setActivePdf(null)}
        title={activePdf?.title || ''}
        courseTitle={activePdf?.courseTitle}
        chapterTitle={activePdf?.chapterTitle}
        pdfIndex={activePdf?.index}
      />

      {/* Global Search Modal (Ctrl+K or Header search) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        courses={courses}
        onSelectCourse={handleOpenCourse}
        onPlayLecture={(course, lec, idx) => {
          handleOpenCourse(course);
          handlePlayVideo({ title: lec.title, asset: lec.asset || '' }, 'Searched Lecture', idx);
        }}
        onViewPdfNote={(course, pdf, idx) => {
          setSelectedCourse(course);
          setActivePdf({
            title: pdf.title,
            courseTitle: course.name,
            index: idx
          });
        }}
      />

      {/* Top Navigation */}
      <Navbar
        onSearchClick={() => setShowSearchModal(true)}
        onHomeClick={() => {
          setView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSavedClick={() => {
          setView('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTelegramClick={() => setShowTelegramModal(true)}
        savedCount={savedCourses.length}
        currentView={view}
        courseName={selectedCourse?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: HOME CATALOG */}
        {view === 'home' && (
          <div className="space-y-10">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-6xl mx-auto">
              {/* Glowing pink ambient blurs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-950/60 border border-pink-500/40 text-pink-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-lg shadow-pink-600/10">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>GB STUDY Official Free Learning Cloud</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-heading tracking-tight leading-[1.15] mb-5">
                Learn Anywhere with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 glow-text-pink">
                  GB STUDY Free Batches
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base lg:text-lg text-pink-200/80 max-w-3xl mx-auto mb-8 leading-relaxed">
                Full syllabus video lectures, official faculty panel notes, chapterwise tests, and revision PDFs. Complete coverage for Matric 10th, Inter 11th & 12th Science & Arts, and Polytechnic.
              </p>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
                <a
                  href="#batches-catalog"
                  className="w-full sm:w-auto btn-pink-gradient py-3 px-7 rounded-2xl font-black text-sm sm:text-base text-white flex items-center justify-center gap-2 shadow-xl shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Let's Study (Browse 29 Batches)</span>
                </a>

                <button
                  onClick={() => setShowTelegramModal(true)}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl font-bold text-sm text-pink-300 hover:text-white bg-pink-950/50 hover:bg-pink-900/60 border border-pink-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4 text-pink-400" />
                  <span>Join Telegram Channel</span>
                </button>
              </div>

              {/* Key Platform Stats in Glowing Pink Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-pink-950/25 border border-pink-500/20 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-black text-pink-400 font-heading">29+</div>
                  <div className="text-xs text-pink-300/70 font-semibold mt-1">Free Batches</div>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/25 border border-pink-500/20 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-black text-pink-400 font-heading">12,000+</div>
                  <div className="text-xs text-pink-300/70 font-semibold mt-1">Recorded Lectures</div>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/25 border border-pink-500/20 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-black text-pink-400 font-heading">10,000+</div>
                  <div className="text-xs text-pink-300/70 font-semibold mt-1">Faculty Panel Notes</div>
                </div>
                <div className="p-4 rounded-2xl bg-pink-950/25 border border-pink-500/20 backdrop-blur-sm">
                  <div className="text-2xl sm:text-3xl font-black text-pink-400 font-heading">100%</div>
                  <div className="text-xs text-pink-300/70 font-semibold mt-1">Free • No Login Required</div>
                </div>
              </div>
            </section>

            {/* Continue Learning Strip (if last visited course exists) */}
            {lastCourse && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/60 via-pink-900/30 to-pink-950/60 border border-pink-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-pink-600 text-white shrink-0 shadow-md shadow-pink-600/30">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                        Continue Where You Left Off
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white font-heading">
                        {lastCourse.name}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenCourse(lastCourse)}
                    className="btn-pink-gradient py-2 px-5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 shrink-0 shadow-md shadow-pink-600/30 cursor-pointer"
                  >
                    <span>Resume Studying</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Batches Catalog Section */}
            <section id="batches-catalog" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6">
              {/* Category Filter Pills & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-pink-500/20">
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                  {[
                    { id: 'all', label: 'All Batches', count: courses.length },
                    { id: '12th', label: 'Class 12th', count: courses.filter(c => (c.group && c.group.includes('12th')) || c.name.includes('12th')).length },
                    { id: '10th', label: 'Class 10th', count: courses.filter(c => (c.group && c.group.includes('10th')) || c.name.includes('10th') || c.name.includes('मैट्रिक')).length },
                    { id: '11th', label: 'Class 11th', count: courses.filter(c => (c.group && c.group.includes('11th')) || c.name.includes('11th')).length },
                    { id: 'polytechnic', label: 'Polytechnic & CUET', count: courses.filter(c => c.name.toLowerCase().includes('polytechnic') || c.name.toLowerCase().includes('cuet')).length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setCategory(tab.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                        category === tab.id
                          ? 'btn-pink-gradient text-white shadow-md shadow-pink-600/30'
                          : 'bg-pink-950/40 hover:bg-pink-900/60 text-pink-300 border border-pink-500/25'
                      }`}
                    >
                      {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
                    </button>
                  ))}
                </div>

                {/* Inline Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={homeSearchQuery}
                    onChange={(e) => setHomeSearchQuery(e.target.value)}
                    placeholder="Filter batches..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-pink-950/30 border border-pink-500/30 text-white placeholder-pink-400/50 text-xs sm:text-sm focus:outline-none focus:border-pink-400"
                  />
                  {homeSearchQuery && (
                    <button
                      onClick={() => setHomeSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Courses Grid */}
              {loadingCourses ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="glass-card rounded-2xl h-80 animate-pulse bg-pink-950/20 border border-pink-500/20" />
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelect={handleOpenCourse}
                      isSaved={savedCourses.some(sc => sc.id === course.id)}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl glass-card border border-pink-500/20 max-w-md mx-auto space-y-3">
                  <Search className="w-10 h-10 text-pink-400 mx-auto" />
                  <h4 className="font-bold text-white text-base">No batches found</h4>
                  <p className="text-xs text-pink-300/70">
                    Try searching for another keyword like "10th", "12th Science", "Urdu", or "Polytechnic".
                  </p>
                  <button
                    onClick={() => {
                      setCategory('all');
                      setHomeSearchQuery('');
                    }}
                    className="btn-pink-gradient py-2 px-4 rounded-xl text-xs font-bold text-white"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: COURSE DETAIL VIEW */}
        {view === 'course' && selectedCourse && (
          <CourseDetailView
            course={selectedCourse}
            detailData={courseDetail}
            loading={loadingDetail}
            onBack={() => {
              setView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isSaved={savedCourses.some(sc => sc.id === selectedCourse.id)}
            onToggleSave={handleToggleSave}
            onPlayVideo={handlePlayVideo}
            onViewPdf={handleViewPdf}
            onJoinTelegram={() => setShowTelegramModal(true)}
            activeVideo={activeVideo}
            onCloseActiveVideo={() => setActiveVideo(null)}
            onExpandVideoModal={() => setShowVideoModal(true)}
            onNextLecture={handleNextLecture}
            onPrevLecture={handlePrevLecture}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />
        )}

        {/* VIEW 3: SAVED BATCHES VIEW */}
        {view === 'saved' && (
          <SavedBatchesView
            savedCourses={savedCourses}
            onSelectCourse={handleOpenCourse}
            onToggleSave={handleToggleSave}
            onBack={() => {
              setView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onClearAll={handleClearSaved}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onTelegramClick={() => setShowTelegramModal(true)}
        onHomeClick={() => {
          setView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSavedClick={() => {
          setView('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Android Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        currentView={view}
        onHomeClick={() => {
          setView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSearchClick={() => setShowSearchModal(true)}
        onSavedClick={() => {
          setView('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTelegramClick={() => setShowTelegramModal(true)}
        savedCount={savedCourses.length}
      />
    </div>
  );
}
