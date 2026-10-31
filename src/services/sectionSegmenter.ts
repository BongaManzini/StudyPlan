export type SectionKey =
  | 'header'
  | 'overview'
  | 'contacts'
  | 'resources'
  | 'study_plan'
  | 'assessments'
  | 'invigilation'
  | 'general';

export interface DocumentSection {
  key: SectionKey;
  heading: string;
  body: string;
}

export interface SegmentedDocument {
  headerSection: string;
  overviewSection: string;
  contactsSection: string;
  resourcesSection: string;
  studyPlanSection: string;
  assessmentsSection: string;
  invigilationSection: string;
  sections: DocumentSection[];
}

/**
 * Deterministic Finite State Machine (FSM) Section Segmenter.
 * Handles UNISA Tutorial Letter 101 section headers (ICT2621, INF3708, INF2603, COS2614, etc.).
 */
export function segmentDocumentSections(fullText: string): SegmentedDocument {
  const lines = fullText.split('\n');
  const sectionBuffers: Record<SectionKey, string[]> = {
    header: [],
    overview: [],
    contacts: [],
    resources: [],
    study_plan: [],
    assessments: [],
    invigilation: [],
    general: []
  };

  let activeSection: SectionKey = 'header';

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Filter out page markers
    if (/^---\s*\[PAGE\s+\d+\]\s*---$/i.test(line)) {
      sectionBuffers[activeSection].push(line);
      continue;
    }

    // FSM State Transition Rules matching exact UNISA TL101 formats
    if (/^(?:1\.?\s*INTRODUCTION|CONTENTS\b|1\.?\s*PURPOSE\s+OF)/i.test(line)) {
      if (activeSection === 'header') activeSection = 'general';
    } else if (/^(?:2\.?\s*(?:[A-Z0-9]{5,7}\s+)?MODULE\s+OVERVIEW|OVERVIEW\s+OF|MODULE\s+PURPOSE)/i.test(line)) {
      activeSection = 'overview';
    } else if (/^(?:4\.?\s*LECTURER\(S\)?\s*(?:AND\s+CONTACT\s+DETAILS)?|4\s+LECTURER\s+AND\s+CONTACT|ACADEMIC\s+STAFF)/i.test(line)) {
      activeSection = 'contacts';
    } else if (/^(?:5\.?\s*RESOURCES|5\.1\s*PRESCRIBED\s+BOOK|PRESCRIBED\s+BOOKS?)/i.test(line)) {
      activeSection = 'resources';
    } else if (/^(?:7\.?\s*STUDY\s+PLAN|8\.?\s*STUDY\s+PLAN|STUDY\s+SCHEDULE|SEMESTER\s+PLAN)/i.test(line)) {
      activeSection = 'study_plan';
    } else if (/^(?:9\.?\s*ASSESSMENT|9\.1\s*ASSESSMENT\s+CRITERIA|9\.2\s*ASSESSMENT\s+PLAN|ASSESSMENT\s+PLAN)/i.test(line)) {
      activeSection = 'assessments';
    } else if (/^(?:9\.7\.1\s*INVIGILATION|9\.8\s*INVIGILATION|INVIGILATION\/PROCTORING|PROCTORING\s+SYSTEMS?)/i.test(line)) {
      activeSection = 'invigilation';
    } else if (/^(?:10\.?\s*ACADEMIC\s+DISHONESTY|11\.?\s*STUDENTS\s+LIVING|12\.?\s*FREQUENTLY\s+ASKED)/i.test(line)) {
      activeSection = 'general';
    }

    sectionBuffers[activeSection].push(line);
  }

  const sectionsList: DocumentSection[] = Object.entries(sectionBuffers).map(([k, v]) => ({
    key: k as SectionKey,
    heading: k.toUpperCase().replace('_', ' '),
    body: v.join('\n')
  }));

  return {
    headerSection: sectionBuffers.header.join('\n'),
    overviewSection: sectionBuffers.overview.join('\n'),
    contactsSection: sectionBuffers.contacts.join('\n'),
    resourcesSection: sectionBuffers.resources.join('\n'),
    studyPlanSection: sectionBuffers.study_plan.join('\n'),
    assessmentsSection: sectionBuffers.assessments.join('\n'),
    invigilationSection: sectionBuffers.invigilation.join('\n'),
    sections: sectionsList
  };
}