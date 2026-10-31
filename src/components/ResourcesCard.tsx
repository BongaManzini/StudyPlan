import { BookOpen, Tag, CheckCircle, Upload } from 'lucide-react';
import type { CourseResource } from '../db/schema';

interface Props {
  resources: CourseResource[];
  onAttachPdf?: (resourceId: string, file: File) => void;
}

export function ResourcesCard({ resources, onAttachPdf }: Props) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
        <BookOpen className="w-5 h-5 text-[var(--accent-violet)]" />
        <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
          Prescribed Books & E-Reserves
        </h3>
      </div>

      <div className="space-y-4">
        {resources.map(res => (
          <div
            key={res.id}
            className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg space-y-2 hover:border-[var(--accent-violet)]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-[var(--text-main)]">{res.title}</h4>
                  {res.isMandatory ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Mandatory
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      Recommended
                    </span>
                  )}
                </div>
                {res.authors && (
                  <p className="text-xs text-[var(--text-muted)] italic">Authors: {res.authors}</p>
                )}
              </div>
            </div>

            {res.identifier && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--accent-violet)] font-mono">
                <Tag className="w-3.5 h-3.5" />
                <span>{res.identifier}</span>
              </div>
            )}

            {res.notes && <p className="text-xs text-[var(--text-muted)]">{res.notes}</p>}

            {/* In-Card Attachment Trigger */}
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]/40">
              <span className="text-[11px] text-[var(--text-muted)]">
                {res.pdfAttached ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle className="w-3 h-3" /> Digital Copy Attached
                  </span>
                ) : (
                  'No local PDF attached'
                )}
              </span>
              <label className="flex items-center gap-1 px-2.5 py-1 bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-main)] rounded cursor-pointer border border-[var(--border-subtle)] transition-colors">
                <Upload className="w-3 h-3" />
                Attach PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file && onAttachPdf) onAttachPdf(res.id, file);
                  }}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}