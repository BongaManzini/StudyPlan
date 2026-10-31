import Dexie, { type Table } from 'dexie';
import type { CourseRecord, MilestoneItem, RawDocumentRecord, DocumentChunk } from './schema';

export class StudyPlanDatabase extends Dexie {
  courses!: Table<CourseRecord, string>;
  milestones!: Table<MilestoneItem, string>;
  rawDocuments!: Table<RawDocumentRecord, string>;
  chunks!: Table<DocumentChunk, string>;

  constructor() {
    super('StudyPlanOfflineDB');

    this.version(1).stores({
      courses: 'id, code, sourceType, academicPeriod, createdAt',
      milestones: 'id, parentCourseId, dueDate, status, type',
      rawDocuments: 'id, courseId, uploadedAt'
    });

    this.version(2).stores({
      courses: 'id, code, sourceType, academicPeriod, createdAt',
      milestones: 'id, parentCourseId, dueDate, status, type',
      rawDocuments: 'id, courseId, uploadedAt'
    });

    this.version(3).stores({
      courses: 'id, code, sourceType, academicPeriod, createdAt',
      milestones: 'id, parentCourseId, dueDate, status, type',
      rawDocuments: 'id, courseId, uploadedAt',
      chunks: 'id, courseId, sectionKey, startPage, endPage'
    });
  }
}

export const db = new StudyPlanDatabase();

export async function persistCourseData(
  course: CourseRecord,
  milestones: MilestoneItem[],
  documentFile?: { fileName: string; blob: Blob; textLength: number },
  chunks: DocumentChunk[] = []
): Promise<void> {
  await db.transaction('rw', [db.courses, db.milestones, db.rawDocuments, db.chunks], async () => {
    course.chunksCount = chunks.length;
    await db.courses.put(course);

    if (milestones.length > 0) {
      await db.milestones.bulkPut(milestones);
    }

    if (documentFile) {
      await db.rawDocuments.put({
        id: `${course.id}-raw-file`,
        courseId: course.id,
        fileName: documentFile.fileName,
        fileBlob: documentFile.blob,
        extractedTextLength: documentFile.textLength,
        uploadedAt: Date.now()
      });
    }

    if (chunks.length > 0) {
      await db.chunks.where('courseId').equals(course.id).delete();
      await db.chunks.bulkPut(chunks);
    }
  });
}

export async function getAllCourses(): Promise<CourseRecord[]> {
  const existing = await db.courses.orderBy('createdAt').reverse().toArray();
  if (existing.length === 0) {
    const { DEMO_COURSE_RECORD, DEMO_CHUNKS } = await import('./demoData');
    await persistCourseData(DEMO_COURSE_RECORD, DEMO_COURSE_RECORD.milestones, undefined, DEMO_CHUNKS);
    return [DEMO_COURSE_RECORD];
  }
  return existing;
}

export async function getCourseById(id: string): Promise<CourseRecord | undefined> {
  return await db.courses.get(id);
}

export async function getMilestonesByCourse(courseId: string): Promise<MilestoneItem[]> {
  return await db.milestones.where('parentCourseId').equals(courseId).toArray();
}

export async function updateMilestoneStatus(
  milestoneId: string,
  status: 'Pending' | 'In Progress' | 'Completed'
): Promise<void> {
  await db.milestones.update(milestoneId, { status });
}

export async function getChunksByCourse(courseId: string): Promise<DocumentChunk[]> {
  return await db.chunks.where('courseId').equals(courseId).toArray();
}

export async function getRawDocumentByCourse(courseId: string): Promise<RawDocumentRecord | undefined> {
  return await db.rawDocuments.where('courseId').equals(courseId).first();
}

export async function deleteCourseCascade(courseId: string): Promise<void> {
  await db.transaction('rw', [db.courses, db.milestones, db.rawDocuments, db.chunks], async () => {
    await db.courses.delete(courseId);
    await db.milestones.where('parentCourseId').equals(courseId).delete();
    await db.rawDocuments.where('courseId').equals(courseId).delete();
    await db.chunks.where('courseId').equals(courseId).delete();
  });
}