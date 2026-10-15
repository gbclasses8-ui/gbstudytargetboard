import React from 'react';
import { X, Printer, Download, FileText, CheckCircle2, Bookmark, Share2 } from 'lucide-react';

interface PdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  courseTitle?: string;
  chapterTitle?: string;
  pdfIndex?: number;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  isOpen,
  onClose,
  title,
  courseTitle,
  chapterTitle,
  pdfIndex
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#140a1b] rounded-2xl sm:rounded-3xl border border-pink-500/40 shadow-2xl shadow-pink-600/30 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-[#1b0d24] border-b border-pink-500/25 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                {pdfIndex ? `Note #${pdfIndex}` : 'Verified Digital Notes'}
              </span>
              <span className="text-xs text-pink-300/70 font-semibold truncate">
                GB STUDY Official Faculty Panel
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-heading truncate mt-1">
              {title || 'Lecture Notes'}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="btn-pink-gradient px-3 py-1.5 rounded-xl font-bold text-xs text-white flex items-center gap-1.5 shadow-md shadow-pink-600/30 hover:scale-[1.02] transition cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-pink-950/60 hover:bg-pink-900 text-pink-300 hover:text-white border border-pink-500/30 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notes Content Body */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-[#0d0712] text-pink-100 flex-1 space-y-6">
          <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#1a0f23] to-[#140b1c] border border-pink-500/25 rounded-2xl p-5 sm:p-7 shadow-xl">
            {/* Document Header */}
            <div className="border-b border-pink-500/20 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-lg sm:text-xl text-white font-heading">
                  {title}
                </h4>
                {chapterTitle && (
                  <p className="text-xs text-pink-300/80 font-medium mt-0.5">
                    📂 {chapterTitle}
                  </p>
                )}
                {courseTitle && (
                  <p className="text-xs text-pink-400 font-mono mt-0.5">
                    🎓 {courseTitle}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />
                  Verified Study Material
                </span>
              </div>
            </div>

            {/* Note details */}
            <div className="space-y-4 text-sm text-pink-100/90 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-pink-950/40 border border-pink-500/20">
                <p className="font-bold text-pink-200 text-xs sm:text-sm mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-400" />
                  बिहार बोर्ड एवं राज्य बोर्ड परीक्षा विशेष डिजिटल पैनल नोट्स
                </p>
                <p className="text-xs text-pink-300/80">
                  यह नोट्स GB STUDY के विशेषज्ञ शिक्षकों द्वारा नवीनतम पाठ्यक्रम और परीक्षा पैटर्न के आधार पर तैयार किए गए हैं।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider text-pink-300">
                  मुख्य विशेषताएं (Key Highlights)
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold">•</span>
                    <span>सभी महत्वपूर्ण परिभाषाएं, सूत्र (Formulas) और थ्योरम्स का विस्तृत संकलन।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold">•</span>
                    <span>विगत वर्षों के बोर्ड परीक्षा में पूछे गए महत्वपूर्ण प्रश्नोत्तर (Previous Years Questions - PYQs)।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold">•</span>
                    <span>स्पष्ट रेखाचित्र एवं आरेख (Clean Diagrams & Flowcharts) त्वरित पुनरावृत्ति (Quick Revision) के लिए।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400 font-bold">•</span>
                    <span>बोर्ड टॉपर्स द्वारा अनुशंसित अध्ययन रणनीति और पॉइंट-वाइज उत्तर लेखन विधि।</span>
                  </li>
                </ul>
              </div>

              {/* Action buttons inside document */}
              <div className="pt-4 border-t border-pink-500/20 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-auto btn-pink-gradient py-2.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 hover:scale-[1.02] transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Save PDF / Print Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#170a20] border-t border-pink-500/20 flex items-center justify-between text-xs text-pink-400/80">
          <span>GB STUDY Digital Repository</span>
          <span>Free Educational Access</span>
        </div>
      </div>
    </div>
  );
};
