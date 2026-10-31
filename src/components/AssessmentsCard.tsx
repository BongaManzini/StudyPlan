import React from 'react';
import { Calendar } from 'lucide-react';
import type { MilestoneItem } from '../db/schema';

export const AssessmentsCard: React.FC<{ milestones: MilestoneItem[] }> = ({ milestones }) => (
  <div className="bento-card">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Calendar style={{ width: '15px', height: '15px', color: '#60a5fa' }} /> Assessments
      </span>
      <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', padding: '2px 8px', borderRadius: '6px' }}>
        Weight Matrix
      </span>
    </div>

    <div>
      {milestones.map(m => (
        <div key={m.id} className="sub-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{m.title}</span>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{m.isCompulsory ? 'Compulsory' : 'Formative'}</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '3px 8px', borderRadius: '6px' }}>
            {m.weightOrScore}
          </span>
        </div>
      ))}
    </div>
  </div>
);