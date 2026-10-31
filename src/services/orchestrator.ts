import { extractPdfContent } from './pdfEngine';
import { segmentDocumentSections } from './sectionSegmenter';
import { classifyDocument } from './classifier';
import { parseModuleHeader } from './parsers/moduleHeader';
import { parseContacts } from './parsers/contactsParser';
import { parseResources } from './parsers/resourcesParser';
import { parseAssessments } from './parsers/assessmentsParser';
import { parseStudyPlan } from './parsers/studyPlanParser';
import { chunkDocument } from './chunker';
import { persistCourseData } from '../db';
import type { CourseRecord } from '../db/schema';

export async function orchestrateDocumentIngestion(file: File): Promise<CourseRecord> {
  // Step 1: PDF 2D Spatial Token Extraction
  const extraction = await extractPdfContent(file);

  // Step 2: Document Classification Fingerprinting
  const classification = classifyDocument(extraction.fullText, file.name);

  // Step 3: FSM Section Segmentation
  const segmented = segmentDocumentSections(extraction.fullText);

  // Step 4: Modular Parsers Execution
  const headerInfo = parseModuleHeader(segmented.headerSection || extraction.fullText, file.name);
  const courseId = `course-${headerInfo.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;

  const contacts = parseContacts(segmented.contactsSection || extraction.fullText);
  const resources = parseResources(segmented.resourcesSection || extraction.fullText);
  const milestones = parseAssessments(segmented.assessmentsSection || extraction.fullText, courseId);
  const curriculum = parseStudyPlan(segmented.studyPlanSection || extraction.fullText);

  // Step 5: Phase 2 Semantic Chunker
  const chunks = chunkDocument(segmented, extraction.pages, courseId);

  const courseRecord: CourseRecord = {
    id: courseId,
    code: headerInfo.code,
    title: headerInfo.title,
    sourceType: classification.category,
    academicPeriod: headerInfo.academicPeriod,
    academicYear: headerInfo.academicYear,
    department: headerInfo.department,
    nqfLevel: headerInfo.nqfLevel,
    credits: headerInfo.credits,
    classification,
    contacts,
    resources,
    milestones,
    curriculum,
    chunksCount: chunks.length,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  // Step 6: IndexedDB Transaction Persistence
  await persistCourseData(
    courseRecord,
    milestones,
    {
      fileName: file.name,
      blob: file,
      textLength: extraction.fullText.length
    },
    chunks
  );

  return courseRecord;
}