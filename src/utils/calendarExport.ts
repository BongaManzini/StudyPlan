import type { CourseRecord, MilestoneItem } from '../db/schema';

export function exportCourseCalendar(course: CourseRecord, milestones: MilestoneItem[]) {
  const events = milestones
    .map(m => {
      const title = `${course.code}: ${m.title} (${m.weightOrScore || 'Assessment'})`;
      const description = `Milestone type: ${m.type}\\nStatus: ${m.status}\\nCourse: ${course.title}`;
      
      let dateString = new Date().toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      if (m.dueDate && /\d{4}-\d{2}-\d{2}/.test(m.dueDate)) {
        dateString = m.dueDate.replace(/-/g, '') + 'T090000Z';
      }

      return [
        'BEGIN:VEVENT',
        `UID:ms-${m.id}@studyplan.app`,
        `DTSTAMP:${dateString}`,
        `DTSTART:${dateString}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:Reminder: ${title} is due tomorrow!`,
        'END:VALARM',
        'END:VEVENT'
      ].join('\r\n');
    })
    .join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StudyPlan Academic Intelligence//EN',
    `X-WR-CALNAME:${course.code} Academic Schedule`,
    events,
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${course.code}_Study_Schedule.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}