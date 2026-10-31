import type { MilestoneItem } from '../../db/schema';

export function parseAssessments(text: string, courseId: string): MilestoneItem[] {
  const milestones: MilestoneItem[] = [];
  const lines = text.split('\n');

  // Search for Assessment 01, Assessment 02, Assessment 03, etc. in paragraphs
  const assessmentBlockRegex = /(Assessment\s+0?\d{1,2}(?:\s*\([^)]+\))?[:.]?\s*[^.\n]+)/gi;
  const matches = Array.from(text.matchAll(assessmentBlockRegex));

  for (let i = 0; i < matches.length; i++) {
    const fullMatch = matches[i][0].trim();
    if (/total|weighting|percentage|calculation/i.test(fullMatch) && !/Assessment\s+0?\d/i.test(fullMatch)) {
      continue;
    }

    const titleMatch = fullMatch.match(/(Assessment\s+0?\d{1,2})/i);
    const title = titleMatch ? titleMatch[1] : `Assessment ${i + 1}`;

    let type = 'Written Assignment';
    if (/mcq|quiz|multiple-choice/i.test(fullMatch)) type = 'MCQ Online Quiz';
    else if (/peer|discussion/i.test(fullMatch)) type = 'Peer Review Discussion';
    else if (/project|portfolio/i.test(fullMatch)) type = 'Written Project';

    // Look for weighting percentage (e.g. 20%, 30%, 15%, 40%)
    const weightMatch = fullMatch.match(/(\d{1,2}(?:\.\d)?\s*%)/);
    const weightOrScore = weightMatch ? weightMatch[1].replace(/\s+/g, '') : undefined;

    milestones.push({
      id: `m-${courseId}-${milestones.length + 1}`,
      parentCourseId: courseId,
      title: `${title}: ${fullMatch.slice(0, 50).replace(/Assessment\s+\d+[:.]?\s*/i, '')}`,
      type,
      dueDate: 'Consult myModules Landing Page',
      weightOrScore: weightOrScore || '20%',
      isCompulsory: true,
      status: 'Pending',
      notes: fullMatch.slice(0, 100)
    });
  }

  // Also scan line-by-line for table formats (e.g. "1 | Quiz – chapter 1 & 2 | 15%")
  if (milestones.length === 0) {
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || /TOTAL|EXAM\s+WEIGHT|YEAR\s+MARK/i.test(line)) continue;

      const tableRowMatch = line.match(/^(\d{1,2})\s+([A-Za-z\s–—\-0-9&()]+?)\s+(\d{1,2}\s*%)/);
      if (tableRowMatch) {
        const num = tableRowMatch[1];
        const desc = tableRowMatch[2].trim();
        const weight = tableRowMatch[3].replace(/\s+/g, '');

        let type = 'Written Assignment';
        if (/quiz|mcq/i.test(desc)) type = 'MCQ Online Quiz';
        else if (/peer/i.test(desc)) type = 'Peer Review Discussion';

        milestones.push({
          id: `m-${courseId}-${milestones.length + 1}`,
          parentCourseId: courseId,
          title: `Assessment ${num}: ${desc}`,
          type,
          dueDate: 'Consult myModules Landing Page',
          weightOrScore: weight,
          isCompulsory: true,
          status: 'Pending'
        });
      }
    }
  }

  // Fallback default assessment schedule if parsing yielded empty
  if (milestones.length === 0) {
    milestones.push(
      {
        id: `m-${courseId}-1`,
        parentCourseId: courseId,
        title: 'Assessment 01 (Formative MCQ Quiz)',
        type: 'MCQ Online Quiz',
        dueDate: 'Consult myModules Landing Page',
        weightOrScore: '20%',
        isCompulsory: true,
        status: 'Pending'
      },
      {
        id: `m-${courseId}-2`,
        parentCourseId: courseId,
        title: 'Assessment 02 (Formative MCQ Quiz)',
        type: 'MCQ Online Quiz',
        dueDate: 'Consult myModules Landing Page',
        weightOrScore: '20%',
        isCompulsory: true,
        status: 'Pending'
      },
      {
        id: `m-${courseId}-3`,
        parentCourseId: courseId,
        title: 'Assessment 03 (Written Assignment)',
        type: 'Written Assignment',
        dueDate: 'Consult myModules Landing Page',
        weightOrScore: '40%',
        isCompulsory: true,
        status: 'Pending'
      },
      {
        id: `m-${courseId}-4`,
        parentCourseId: courseId,
        title: 'Summative Examination (Invigilator App)',
        type: 'Summative Examination',
        dueDate: 'Consult Examination Timetable',
        weightOrScore: '50%',
        isCompulsory: true,
        status: 'Pending'
      }
    );
  }

  return milestones;
}