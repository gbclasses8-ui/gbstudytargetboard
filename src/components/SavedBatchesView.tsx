import React from 'react';
import { ArrowLeft, Heart, BookOpen, Trash2 } from 'lucide-react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';

interface SavedBatchesViewProps {
  savedCourses: Course[];
  onSelectCourse: (course: Course) => void;
  onToggleSave: (course: Course) => void;
  onBack: () => void;
  onClearAll: () => void;
}

export const SavedBatchesView: React.FC<SavedBatchesViewProps> = ({
  savedCourses,
  onSelectCourse,
  onToggleSave,
  onBack,
  onClearAll
}) => {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 border border-pink-500/30 text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-pink-400" />
          <span>Back to All Batches</span>
        </button>

        {savedCourses.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Saved</span>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-pink-600 text-white shadow-lg shadow-pink-600/30">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
            My Saved Batches ({savedCourses.length})
          </h1>
          <p className="text-xs sm:text-sm text-pink-300/80">
            Quickly resume studying your pinned batches without searching again.
          </p>
        </div>
      </div>

      {/* Grid of Saved Courses */}
      {savedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
              isSaved={true}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl glass-card border border-pink-500/20 max-w-lg mx-auto space-y-4">
          <Heart className="w-14 h-14 text-pink-500/40 mx-auto" />
          <h3 className="text-lg font-bold text-white font-heading">No Saved Batches Yet</h3>
          <p className="text-xs sm:text-sm text-pink-300/70">
            Click the heart icon on any batch card to pin it here for quick access next time you visit.
          </p>
          <button
            onClick={onBack}
            className="btn-pink-gradient py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white inline-flex items-center gap-2 shadow-md shadow-pink-600/30 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Browse All 29 Batches
          </button>
        </div>
      )}
    </div>
  );
};
