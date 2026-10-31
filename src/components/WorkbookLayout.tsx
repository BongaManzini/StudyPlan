import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  BookOpen,
  Calendar,
  CheckCircle2,
  UserCheck,
  Sparkles,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { CourseRecord, MilestoneItem } from '../db/schema';
import type { ActiveTabType, StudioPrompt } from '../types/workbook';
import type { ChunkSearchResult } from '../types/chunk';
import { searchCourseChunks } from '../services/searchEngine';
import { StaffCard } from './StaffCard';
import { ResourcesCard } from './ResourcesCard';
import { CurriculumCard } from './CurriculumCard';
import { MilestoneManager } from './MilestoneManager';

interface Props {
  course: CourseRecord;
  milestones: MilestoneItem[];
  allCourses: CourseRecord[];
  activeCourseId: string | null;
  onSelectCourse: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPdfModal: () => void;
  onStatusChange: () => void;
  isLoading: boolean;
}

const DEFAULT_STUDIO_PROMPTS: StudioPrompt[] = [
  {
    id: 'p1',
    title: 'Exam Scope Summary',
    promptText: 'exam scope assessment weighting',
    iconName: 'ShieldCheck',
    category: 'exam'
  },
  {
    id: 'p2',
    title: 'Prescribed Textbooks',
    promptText: 'prescribed books isbn authors',
    iconName: 'BookOpen',
    category: 'summary'
  },
  {
    id: 'p3',
    title: 'Week 1-4 Topics',
    promptText: 'week 1 week 2 week 3 week 4 topics',
    iconName: 'Calendar',
    category: 'quiz'
  },
  {
    id: 'p4',
    title: 'Lecturer Contacts',
    promptText: 'lecturer email phone office',
    iconName: 'UserCheck',
    category: 'summary'
  }
];

export function WorkbookLayout({
  course,
  milestones,
  allCourses,
  activeCourseId,
  onSelectCourse,
  onFileUpload,
  onOpenPdfModal,
  onStatusChange,
  isLoading
}: Props) {
  const [activeTab, setActiveTab] = useState<ActiveTabType>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<ChunkSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery;
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchCourseChunks(queryToUse, {
        courseId: course.id,
        maxResults: 6
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search query failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const runPrompt = (prompt: StudioPrompt) => {
    setSearchQuery(prompt.promptText);
    handleSearch(undefined, prompt.promptText);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[var(--bg-primary)]">
      {/* ================= LEFT RAIL: SOURCES & COURSES ================= */}
      <aside className="w-80 border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col shrink-0">
        {/* Course Vault Switcher */}
        <div className="p-4 border-b border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Course Vault
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
              {allCourses.length} Vaulted
            </span>
          </div>

          <select
            value={activeCourseId || ''}
            onChange={e => onSelectCourse(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm rounded-lg p-2.5 outline-none focus:border-[var(--accent-indigo)] font-medium"
          >
            {allCourses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.title.slice(0, 24)}...
              </option>
            ))}
          </select>
        </div>

        {/* Upload Trigger */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <label className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--accent-indigo)] hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition-all">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Syllabus / TL101</span>
            <input type="file" accept="application/pdf" className="hidden" onChange={onFileUpload} />
          </label>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Grounded Sources
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {course.chunksCount || 0} Chunks
            </span>
          </div>

          {/* Primary Ingested Document Source */}
          <div className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-indigo)] shrink-0" />
                <span className="text-xs font-semibold text-[var(--text-main)] truncate max-w-[140px]">
                  {course.code} TL101
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Primary
              </span>
            </div>

            {/* Classification Fingerprint */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Classification:</span>
                <span className="font-semibold text-[var(--accent-indigo)]">
                  {course.classification.category}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span>Confidence:</span>
                <span className="font-mono text-emerald-400">
                  {course.classification.confidence}%
                </span>
              </div>
            </div>

            {/* Raw PDF Preview Button */}
            <button
              onClick={onOpenPdfModal}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium text-[var(--text-main)] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Raw PDF Document
            </button>
          </div>

          {/* Prescribed Resource Attachments */}
          {course.resources.map(res => (
            <div
              key={res.id}
              className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--text-main)] truncate max-w-[160px]">
                  {res.title}
                </span>
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent-violet)]" />
              </div>
              {res.identifier && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                  {res.identifier}
                </span>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ================= CENTER STAGE: WORKSPACE TABS ================= */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)]">
        {/* Module Header Bar */}
        <header className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
                {course.code}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
                {course.academicPeriod || 'Year Module'}
              </span>
              {course.academicYear && (
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
                  {course.academicYear}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">{course.title}</p>
          </div>

          {/* Workspace Tab Nav */}
          <nav className="flex items-center gap-1 bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)]">
            {(
              [
                { id: 'overview', label: 'Overview', icon: Layers },
                { id: 'study_plan', label: 'Study Schedule', icon: Calendar },
                { id: 'assessments', label: 'Assessments', icon: CheckCircle2 },
                { id: 'resources', label: 'Resources', icon: BookOpen },
                { id: 'contacts', label: 'Staff', icon: UserCheck }
              ] as const
            ).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-indigo)] text-white shadow'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </header>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CurriculumCard curriculum={course.curriculum} />
              <MilestoneManager milestones={milestones} course={course} onStatusChange={onStatusChange} />
              <ResourcesCard resources={course.resources} />
              <StaffCard contacts={course.contacts} />
            </div>
          )}

          {activeTab === 'study_plan' && <CurriculumCard curriculum={course.curriculum} />}

          {activeTab === 'assessments' && (
            <MilestoneManager milestones={milestones} course={course} onStatusChange={onStatusChange} />
          )}

          {activeTab === 'resources' && <ResourcesCard resources={course.resources} />}

          {activeTab === 'contacts' && <StaffCard contacts={course.contacts} />}
        </div>
      </main>

      {/* ================= RIGHT RAIL: STUDIO & GROUNDED RETRIEVAL ================= */}
      <aside className="w-96 border-l border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col shrink-0">
        {/* Search & Query Bar */}
        <div className="p-4 border-b border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-indigo)]" />
              Grounded Search Studio
            </span>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search syllabus, exam scope, topics..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder-[var(--text-muted)] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[var(--accent-indigo)] font-medium"
            />
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
          </form>
        </div>

        {/* Studio Quick Prompts */}
        <div className="p-4 border-b border-[var(--border-subtle)] space-y-2">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
            Quick Academic Prompts
          </span>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_STUDIO_PROMPTS.map(p => (
              <button
                key={p.id}
                onClick={() => runPrompt(p)}
                className="p-2 bg-[var(--bg-card)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-lg text-left transition-colors cursor-pointer space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-main)] truncate">
                    {p.title}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cited Retrieval Search Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Cited Passages
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              {searchResults.length} Passages Found
            </span>
          </div>

          {isSearching ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              Scanning local IndexDB chunks...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((res, i) => (
              <div
                key={i}
                className="p-3.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2 hover:border-[var(--accent-indigo)]/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--accent-indigo)]">
                    {res.chunk.heading || 'Section Passage'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20 font-mono text-[10px]">
                    Page {res.chunk.startPage}
                    {res.chunk.endPage > res.chunk.startPage ? `-${res.chunk.endPage}` : ''}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed italic">
                  "{res.snippet}"
                </p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)] space-y-1">
              <Search className="w-6 h-6 mx-auto text-[var(--text-muted)]/60" />
              <p>Type a search query or click a quick prompt above to fetch grounded cited passages.</p>
            </div>
          )}
        </div>
      </aside>

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold">
          Processing document ingestion & building semantic chunks...
        </div>
      )}
    </div>
  );
}
