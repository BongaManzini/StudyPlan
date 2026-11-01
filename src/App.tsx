import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  UploadCloud,
  GraduationCap,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { orchestrateDocumentIngestion } from './services/orchestrator';
import { getAllCourses, getMilestonesByCourse } from './db';
import type { CourseRecord, MilestoneItem } from './db/schema';
import { WorkbookLayout } from './components/WorkbookLayout';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [forceOfflineMode, setForceOfflineMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [savedCourses, setSavedCourses] = useState<CourseRecord[]>([]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeMilestones, setActiveMilestones] = useState<MilestoneItem[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  const loadCourses = async () => {
    const courses = await getAllCourses();
    setSavedCourses(courses);
    if (courses.length > 0) {
      const selectedId =
        activeCourseId && courses.some(c => c.id === activeCourseId) ? activeCourseId : courses[0].id;
      setActiveCourseId(selectedId);
      const milestones = await getMilestonesByCourse(selectedId);
      setActiveMilestones(milestones);
    } else {
      setActiveCourseId(null);
      setActiveMilestones([]);
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let isSubscribed = true;
    getAllCourses().then(courses => {
      if (!isSubscribed) return;
      setSavedCourses(courses);
      if (courses.length > 0) {
        const selectedId = courses[0].id;
        setActiveCourseId(selectedId);
        getMilestonesByCourse(selectedId).then(milestones => {
          if (isSubscribed) setActiveMilestones(milestones);
        });
      } else {
        setActiveCourseId(null);
        setActiveMilestones([]);
      }
    });

    return () => {
      isSubscribed = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOnline = isOnline && !forceOfflineMode;

  const handleSelectCourse = async (id: string) => {
    setActiveCourseId(id);
    const milestones = await getMilestonesByCourse(id);
    setActiveMilestones(milestones);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const savedCourse = await orchestrateDocumentIngestion(file);
      await loadCourses();
      await handleSelectCourse(savedCourse.id);
    } catch (error) {
      console.error('Failed to parse and ingest document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCourse = savedCourses.find(c => c.id === activeCourseId);

  return (
    <ErrorBoundary fallbackTitle="StudyPlan Root Application Error">
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col font-sans">
        {/* Top Header */}
        <header className="h-16 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-indigo)] to-[var(--accent-violet)] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[var(--text-main)] tracking-tight">
                  StudyPlan
                </h1>
                <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
                  NotebookLM Studio
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Local-First Academic Syllabus Intelligence
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              {effectiveOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Online Vault Syncing</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400">Offline Vault Engine</span>
                </>
              )}
            </div>

            <button
              onClick={() => setForceOfflineMode(!forceOfflineMode)}
              className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            >
              {forceOfflineMode ? (
                <ToggleRight className="w-5 h-5 text-[var(--accent-indigo)]" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-[var(--text-muted)]" />
              )}
              <span>Force Offline</span>
            </button>
          </div>
        </header>

        {/* Body View */}
        {activeCourse ? (
          <WorkbookLayout
            course={activeCourse}
            milestones={activeMilestones}
            allCourses={savedCourses}
            activeCourseId={activeCourseId}
            onSelectCourse={handleSelectCourse}
            onFileUpload={handleFileUpload}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onStatusChange={() => {
              if (activeCourseId) handleSelectCourse(activeCourseId);
            }}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[var(--accent-indigo)]/20 to-[var(--accent-violet)]/20 border border-[var(--accent-indigo)]/30 flex items-center justify-center text-[var(--accent-indigo)]">
              <Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[var(--text-main)]">
                Welcome to StudyPlan Notebook Studio
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                Upload your course syllabus PDF (e.g. UNISA TL101 tutorial letter) to automatically parse
                2D spatial text layouts, extract academic staff, prescribed books, milestone matrices, and enable local grounded search.
              </p>
            </div>

            <label className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-violet)] hover:opacity-90 text-white font-semibold rounded-xl shadow-lg cursor-pointer transition-all">
              <UploadCloud className="w-5 h-5" />
              <span>Select Syllabus PDF Document</span>
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {/* PDF Raw View Modal */}
        {activeCourse && (
          <PdfViewerModal
            courseId={activeCourse.id}
            courseCode={activeCourse.code}
            isOpen={isPdfModalOpen}
            onClose={() => setIsPdfModalOpen(false)}
          />
        )}

        {/* Business First Enterprise Footer */}
        <footer className="mt-auto py-5 px-6 border-t border-[var(--border-subtle)] bg-[var(--surface-dark)]/90 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] font-mono gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[var(--text-main)]">
              &copy; 2026 StudyPlan&trade; &bull; Academic Module Intelligence &amp; Spatial Grounded Workbook Studio
            </span>
            <span className="hidden sm:inline opacity-40">&bull;</span>
            <span className="text-[11px] text-indigo-400">Enterprise EdTech Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Developed by <strong className="text-[var(--text-main)]">Bonga Manzini</strong></span>
            <span className="opacity-40">&bull;</span>
            <a href="https://github.com/BongaManzini/StudyPlan" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">GitHub Repository</a>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}