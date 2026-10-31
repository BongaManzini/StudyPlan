import { Calendar, BookOpen, Layers } from 'lucide-react';
import type { StudyObjective } from '../db/schema';

interface Props {
  curriculum: StudyObjective[];
}

export function CurriculumCard({ curriculum }: Props) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--accent-indigo)]" />
          <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
            Study Schedule & Units
          </h3>
        </div>
        <span className="text-xs text-[var(--text-muted)] font-mono">
          {curriculum.length} Learning Units
        </span>
      </div>

      <div className="space-y-3">
        {curriculum.map(unit => (
          <div
            key={unit.unitIndex}
            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg space-y-2 hover:border-[var(--accent-indigo)]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
                  {unit.weekSpan || `Unit ${unit.unitIndex}`}
                </span>
                <h4 className="text-sm font-semibold text-[var(--text-main)]">{unit.title}</h4>
              </div>
            </div>

            {unit.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {unit.topics.map((topic, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                  >
                    <Layers className="w-2.5 h-2.5 text-[var(--accent-indigo)]" />
                    {topic}
                  </span>
                ))}
              </div>
            )}

            {unit.alignedReadings.length > 0 && (
              <div className="pt-2 border-t border-[var(--border-subtle)]/40 flex items-center gap-2 text-xs text-[var(--accent-violet)]">
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">{unit.alignedReadings.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}