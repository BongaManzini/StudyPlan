import { UserCheck, Mail, Phone, Building } from 'lucide-react';
import type { CourseContact } from '../db/schema';

interface Props {
  contacts: CourseContact[];
}

export function StaffCard({ contacts }: Props) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
        <UserCheck className="w-5 h-5 text-[var(--accent-indigo)]" />
        <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider">
          Academic Staff & Contacts
        </h3>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg space-y-2 hover:border-[var(--accent-indigo)]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--text-main)]">{contact.name}</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--accent-indigo)]/10 text-[var(--accent-indigo)] border border-[var(--accent-indigo)]/20">
                {contact.role}
              </span>
            </div>

            {contact.email && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--accent-indigo)]" />
                <a href={`mailto:${contact.email}`} className="hover:underline text-[var(--text-main)]">
                  {contact.email}
                </a>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                <Phone className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>{contact.phone}</span>
              </div>
            )}

            {contact.officeOrChannel && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Building className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{contact.officeOrChannel}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}