import type { DocumentClassification } from '../db/schema';

export type ActiveTabType = 'overview' | 'study_plan' | 'assessments' | 'resources' | 'contacts';

export interface WorkbookSource {
  id: string;
  courseId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: number;
  classification: DocumentClassification;
  isPrimary: boolean;
  blob?: Blob;
}

export interface StudioPrompt {
  id: string;
  title: string;
  promptText: string;
  iconName: string;
  category: 'summary' | 'exam' | 'quiz' | 'flashcards';
}

export interface CitationReference {
  chunkId: string;
  sectionKey: string;
  heading?: string;
  startPage: number;
  endPage: number;
  textSnippet: string;
}
