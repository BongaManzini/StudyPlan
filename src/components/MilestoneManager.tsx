import { CheckCircle2, Clock, PlayCircle, Download } from 'lucide-react';
import type { MilestoneItem, CourseRecord } from '../db/schema';
import { updateMilestoneStatus } from '../db';
import { exportCourseCalendar } from '../utils/calendarExport';

interface Props {
  milestones: MilestoneItem[];
  course: CourseRecord;
  onStatusChange?: () => void;
}

export function MilestoneManager({ milestones, course, onStatusChange }: Props) {
  const handleToggleStatus = async (milestone: MilestoneItem) => {
    let nextStatus: 'Pending' | 'In Progress' | 'Completed' = 'In Progress';
    if (milestone.status === 'Pending') nextStatus = 'In Progress';
    else if (milestone.status === 'In Progress') nextStatus = 'Completed';
    else if (milestone.status === 'Completed') nextStatus = 'Pending';

    await updateMilestoneStatus(milestone.id, nextStatus);
    if (onStatusChange) onStatusChange();
  };

  const getStatusBadge = (status: MilestoneItem['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <PlayCircle className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[var(--accent-indigo)]" />
          <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
            Assessments & Milestones Matrix
          </h3>
        </div>

        <button
          onClick={() => exportCourseCalendar(course, milestones)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-indigo)]/10 hover:bg-[var(--accent-indigo)]/20 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export .ics Calendar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {milestones.map(m => (
          <div
            key={m.id}
            onClick={() => handleToggleStatus(m)}
            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between gap-4 cursor-pointer hover:border-[var(--accent-indigo)]/50 transition-all select-none"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[var(--text-main)]">{m.title}</h4>
                {m.isCompulsory && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded">
                    Compulsory
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>Type: {m.type}</span>
                <span>•</span>
                <span className="font-mono text-[var(--text-main)]">Weight: {m.weightOrScore || 'N/A'}</span>
                <span>•</span>
                <span>Due: {m.dueDate || 'TBD'}</span>
              </div>
            </div>

            <div className="shrink-0">{getStatusBadge(m.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}