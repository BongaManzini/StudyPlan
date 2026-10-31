import type { DocumentChunk } from '../types/chunk';

export type StandardDocumentCategory =
  | 'Tutorial Letter (TL101)'
  | 'Exam Scope / Prep Guide'
  | 'Official Study Guide'
  | 'Certification Blueprint'
  | 'Session Transcript'
  | 'General Course Material'
  | string;

export interface DocumentClassification {
  category: StandardDocumentCategory;
  confidence: number;
  detectedKeywords: string[];
  isUserConfirmed: boolean;
}

export interface CourseContact {
  name: string;
  email?: string;
  phone?: string;
  role: string;
  officeOrChannel?: string;
}

export interface CourseResource {
  id: string;
  title: string;
  authors?: string;
  identifier?: string;
  type: string;
  isMandatory: boolean;
  notes?: string;
  pdfAttached?: boolean;
}

export interface MilestoneItem {
  id: string;
  parentCourseId: string;
  title: string;
  type: string;
  dueDate?: string;
  weightOrScore?: string;
  isCompulsory: boolean;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface StudyObjective {
  unitIndex: number;
  title: string;
  alignedReadings: string[];
  weightPercentage?: string;
  topics: string[];
  weekSpan?: string;
}

export interface CourseRecord {
  id: string;
  code: string;
  title: string;
  sourceType: string;
  academicPeriod?: string;
  academicYear?: string;
  department?: string;
  nqfLevel?: string;
  credits?: string;
  classification: DocumentClassification;
  contacts: CourseContact[];
  resources: CourseResource[];
  milestones: MilestoneItem[];
  curriculum: StudyObjective[];
  customSections?: Record<string, string>;
  chunksCount?: number;
  createdAt: number;
  updatedAt: number;
}

export interface RawDocumentRecord {
  id: string;
  courseId: string;
  fileName: string;
  fileBlob: Blob;
  extractedTextLength: number;
  uploadedAt: number;
}

export type { DocumentChunk };