export interface ParsedModuleHeader {
  code: string;
  title: string;
  academicYear?: string;
  academicPeriod?: string;
  department?: string;
  nqfLevel?: string;
  credits?: string;
}

export function parseModuleHeader(text: string, fileName: string): ParsedModuleHeader {
  // Extract module code (e.g. ICT2621, INF3708, INF2603, COS2614, INF3720)
  const codeMatch = text.match(/\b([A-Z]{3,4}\s*\d{4})\b/i) || fileName.match(/\b([A-Z]{3,4}\s*\d{4})\b/i);
  const code = codeMatch ? codeMatch[1].replace(/\s+/g, '').toUpperCase() : 'UNKNOWN';

  // Extract academic year (e.g. 2025, 2026)
  const yearMatch = text.match(/\b(202[4-9]|203[0-9])\b/);
  const academicYear = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

  // Extract delivery term (Year Module, Semester 1, Semester 2)
  let academicPeriod = 'Year Module';
  if (/SEMESTER\s*1/i.test(text)) {
    academicPeriod = 'Semester 1';
  } else if (/SEMESTER\s*2/i.test(text)) {
    academicPeriod = 'Semester 2';
  } else if (/YEAR\s+MODULE/i.test(text)) {
    academicPeriod = 'Year Module';
  }

  // Extract Department
  let department = 'Department of Information Systems';
  const deptMatch = text.match(/(?:Department|School)\s+of\s+([A-Za-z0-9\s,&]+)/i);
  if (deptMatch) {
    department = `Department of ${deptMatch[1].trim()}`.split('\n')[0].slice(0, 60);
  }

  // Extract Title (collect lines between "Tutorial Letter 101" and Module Code / "Year Module")
  let title = `${code} Academic Module`;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  let captureTitle = false;
  const titleParts: string[] = [];

  for (const line of lines.slice(0, 30)) {
    if (/Tutorial\s+Letter\s+101/i.test(line)) {
      captureTitle = true;
      continue;
    }

    if (captureTitle) {
      if (
        line.toUpperCase() === code ||
        /Year\s+Module/i.test(line) ||
        /Department\s+of/i.test(line) ||
        /IMPORTANT\s+INFORMATION/i.test(line)
      ) {
        if (titleParts.length > 0) break;
      } else if (!/^[0-9./-]+$/.test(line) && line.length > 2) {
        titleParts.push(line);
      }
    }
  }

  if (titleParts.length > 0) {
    title = titleParts.join(' ');
  } else {
    // Fallback title heuristic
    for (const line of lines.slice(0, 20)) {
      if (
        line.length > 4 &&
        !/Tutorial|UNISA|Department|Semester|IMPORTANT|BARCODE/i.test(line) &&
        !/^[0-9./-]+$/.test(line) &&
        line.toUpperCase() !== code
      ) {
        title = line;
        break;
      }
    }
  }

  // NQF Level Heuristic
  const nqfMatch = text.match(/NQF\s*(?:LEVEL)?\s*(\d+)/i);
  const nqfLevel = nqfMatch ? `Level ${nqfMatch[1]}` : 'Level 6';

  // Credits Heuristic
  const creditsMatch = text.match(/(\d+)\s+CREDITS/i);
  const credits = creditsMatch ? `${creditsMatch[1]} Credits` : '12 Credits';

  return {
    code,
    title,
    academicYear,
    academicPeriod,
    department,
    nqfLevel,
    credits
  };
}