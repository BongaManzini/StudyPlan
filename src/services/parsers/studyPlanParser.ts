import type { StudyObjective } from '../../db/schema';

export function parseStudyPlan(text: string): StudyObjective[] {
  const objectives: StudyObjective[] = [];
  const lines = text.split('\n');

  let unitCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || /STUDY\s+PLAN\s+BY|WEEKS\s+FOR|Outcomes/i.test(line)) continue;

    // Pattern 1: Week row table (e.g., "1 Start assessment 01 (QUIZ) by reading Chapter 1: Introduction..." or "25 up to exams Start revision...")
    const weekRowMatch = line.match(/^(\d{1,2}(?:\s*up\s+to\s+exams)?|\d{1,2}\/\d{1,2})\s+([A-Za-z0-9\s:;.,()&/-]+)/);
    
    // Pattern 2: Date row table (e.g., "1 19 – 24 February Chapter 1: Introduction...")
    const dateRowMatch = line.match(/^(\d{1,2})\s+(\d{1,2}\s*[–-]\s*\d{1,2}\s+[A-Za-z]+)\s+(.+)/);

    // Pattern 3: Chapter heading list (e.g., "Chapter 1: Database Systems", "Chapter 4: Entity Relationship (ER) Modeling")
    const chapterMatch = line.match(/^(?:Chapter|Unit)\s*(\d+)[:.]?\s*(.+)/i);

    if (dateRowMatch) {
      const weekNum = dateRowMatch[1];
      const dateSpan = dateRowMatch[2];
      const content = dateRowMatch[3].trim();

      objectives.push({
        unitIndex: unitCounter++,
        title: content.slice(0, 80),
        alignedReadings: [content],
        topics: [dateSpan, 'Core Concepts'],
        weekSpan: `Week ${weekNum} (${dateSpan})`
      });
    } else if (weekRowMatch) {
      const weekSpan = weekRowMatch[1];
      const content = weekRowMatch[2].trim();

      // Extract topics & chapter references
      const chapters: string[] = [];
      const chMatch = content.match(/(?:Chapter[s]?|Ch\.)\s*([0-9,\s&]+)/i);
      if (chMatch) chapters.push(`Chapter ${chMatch[1].trim()}`);
      else chapters.push(`Study Unit ${unitCounter}`);

      objectives.push({
        unitIndex: unitCounter++,
        title: content.slice(0, 90),
        alignedReadings: chapters,
        topics: ['Required Reading', 'Module Learning Objectives'],
        weekSpan: /^week/i.test(weekSpan) ? weekSpan : `Week ${weekSpan}`
      });
    } else if (chapterMatch) {
      const chNum = chapterMatch[1];
      const chTitle = chapterMatch[2].trim();

      objectives.push({
        unitIndex: unitCounter++,
        title: `Chapter ${chNum}: ${chTitle}`,
        alignedReadings: [`Chapter ${chNum}`],
        topics: [chTitle, 'Theory & Exercises'],
        weekSpan: `Unit ${chNum}`
      });
    }
  }

  // Fallback default objectives if empty
  if (objectives.length === 0) {
    objectives.push(
      {
        unitIndex: 1,
        title: 'Introduction to Systems Analysis & Data Concepts',
        alignedReadings: ['Chapter 1: Systems Foundations'],
        topics: ['System Life Cycle (SDLC)', 'Methodology', 'Tools & Techniques'],
        weekSpan: 'Week 1-2'
      },
      {
        unitIndex: 2,
        title: 'Business Case Analysis & Requirements Modelling',
        alignedReadings: ['Chapter 2 & 4: Requirements Gathering'],
        topics: ['Interviewing & Observation', 'Data Flow Diagrams (DFD)', 'Use Cases'],
        weekSpan: 'Week 3-6'
      },
      {
        unitIndex: 3,
        title: 'Data Design, ER Modeling & Normalisation',
        alignedReadings: ['Chapter 5 & 8: Data Models & 3NF'],
        topics: ['Entity Relationship Diagrams (ERD)', 'Normal Forms (1NF-3NF)', 'Data Dictionary'],
        weekSpan: 'Week 7-12'
      },
      {
        unitIndex: 4,
        title: 'Managing Systems Support, Implementation & Exam Prep',
        alignedReadings: ['Chapters 9, 11 & 12'],
        topics: ['System Installation', 'Revision', 'Invigilator Proctoring App Setup'],
        weekSpan: 'Week 13 up to exams'
      }
    );
  }

  return objectives;
}