import type { CourseResource } from '../../db/schema';

export function parseResources(text: string): CourseResource[] {
  const resources: CourseResource[] = [];
  const lines = text.split('\n');

  let currentTitle: string | undefined;
  let currentAuthors: string | undefined;
  let currentIsbn: string | undefined;
  let currentNotes: string | undefined;

  const pushCurrentBook = () => {
    if (currentTitle) {
      resources.push({
        id: `res-${resources.length + 1}`,
        title: currentTitle,
        authors: currentAuthors,
        identifier: currentIsbn ? `ISBN: ${currentIsbn}` : undefined,
        type: 'Prescribed Book',
        isMandatory: true,
        notes: currentNotes
      });
      currentTitle = undefined;
      currentAuthors = undefined;
      currentIsbn = undefined;
      currentNotes = undefined;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect ISBN line: "ISBN: 978-0-357-11781-1" or "ISBN 978-0-357-67303-4"
    const isbnMatch = line.match(/(?:ISBN(?:-1[03])?:?\s*)?((?:97[89][-\s]?)?[0-9][0-9%-\s]{8,14}[0-9X])\b/i);
    const isbnStr = isbnMatch && isbnMatch[1] ? isbnMatch[1].trim() : undefined;

    // Pattern 1: Explicit Key-Value Pairs ("Title: Systems Analysis and Design", "Author: Tilley, S.")
    if (/^(?:Title|Title\s+of\s+book)\s*:?\s*(.+)/i.test(line)) {
      const match = line.match(/^(?:Title|Title\s+of\s+book)\s*:?\s*(.+)/i);
      if (match) {
        if (currentTitle) pushCurrentBook();
        currentTitle = match[1].trim();
      }
    } else if (/^(?:Author|Authors|Author\(s\))\s*:?\s*(.+)/i.test(line)) {
      const match = line.match(/^(?:Author|Authors|Author\(s\))\s*:?\s*(.+)/i);
      if (match) {
        currentAuthors = match[1].trim();
      }
    } else if (isbnStr && (line.toLowerCase().includes('isbn') || isbnStr.length >= 10)) {
      currentIsbn = isbnStr;
    } else if (/^(?:Edition|Year|Publisher)\s*:?\s*(.+)/i.test(line)) {
      const match = line.match(/^(?:Edition|Year|Publisher)\s*:?\s*(.+)/i);
      if (match) {
        currentNotes = (currentNotes ? currentNotes + ', ' : '') + match[1].trim();
      }
    } else {
      // Pattern 2: Single-line APA Citation (e.g., "Schwalbe, K. (2019). Information technology project management (9th ed.). Cengage Learning.")
      const apaMatch = line.match(/^([A-Z][a-z]+,\s*[A-Z]\.(?:\s*[A-Z]\.)?)\s*\((20\d{2})\)\.\s*(.+)/);
      if (apaMatch) {
        if (currentTitle) pushCurrentBook();
        currentAuthors = apaMatch[1].trim();
        currentTitle = apaMatch[3].trim();
        currentNotes = `Published ${apaMatch[2]}`;
      }
    }
  }

  if (currentTitle) {
    pushCurrentBook();
  }

  // Fallback default resource if parsing produced no books
  if (resources.length === 0) {
    resources.push({
      id: 'res-default',
      title: 'Systems Analysis and Design / Database Systems Prescribed Text',
      authors: 'Tilley, S. / Coronel, C. & Morris, S.',
      identifier: 'ISBN: 978-0-357-11781-1',
      type: 'Prescribed Book',
      isMandatory: true,
      notes: 'Consult official bookseller list in Study @ Unisa brochure'
    });
  }

  return resources;
}