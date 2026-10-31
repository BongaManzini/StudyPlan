import type { CourseContact } from '../../db/schema';

const ADMIN_EMAIL_PREFIXES = [
  'lib-help',
  'library',
  'fye',
  'vospresc',
  'study-info',
  'despatch',
  'myunisa',
  'mandela',
  'admin',
  'financial',
  'ethics',
  'aegrotat',
  'assign',
  'exam',
  'registrations',
  'applications',
  'infoservices',
  'libr-ill',
  'lib-search',
  'lib-disability',
  'lib-corrections'
];

export function parseContacts(text: string): CourseContact[] {
  const contacts: CourseContact[] = [];
  const lines = text.split('\n');

  let currentContact: Partial<CourseContact> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line) continue;

    // Pattern 1: "The primary lecturer for this module is Dr Emil Van Der Poll:" or "is Mr ME Bogopa."
    const primaryMatch = line.match(/primary\s+lecturer(?:\s+for\s+this\s+module)?\s+is\s+([A-Za-z.\s]+?)(?::|\.|$)/i);
    
    // Pattern 2: "Lecturer: Dr John Doe" or "Prof A. Smith" at start of line
    const directMatch = line.match(/^(?:Prof|Dr|Mr|Mrs|Ms|Lecturer)\.?:?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+|\s+[A-Z]\.)+)/i);

    const nameCandidate = primaryMatch ? primaryMatch[1].trim() : (directMatch ? directMatch[1].trim() : null);

    if (nameCandidate && nameCandidate.length > 3 && !/insert|names/i.test(nameCandidate)) {
      if (currentContact && currentContact.name) {
        contacts.push(currentContact as CourseContact);
      }
      currentContact = {
        name: nameCandidate.replace(/[:.]$/, ''),
        role: 'Primary Lecturer'
      };
    }

    // Pattern 3: Email detection
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const email = emailMatch[1].toLowerCase();
      const isAdmin = ADMIN_EMAIL_PREFIXES.some(prefix => email.startsWith(prefix));

      if (!isAdmin) {
        if (!currentContact) {
          const isModuleMailbox = /^[a-z]{3,4}\d{4}@/i.test(email);
          currentContact = {
            name: isModuleMailbox ? `${email.split('@')[0].toUpperCase()} Module Mailbox` : 'Academic Lecturer',
            email,
            role: isModuleMailbox ? 'Module Mailbox' : 'Primary Lecturer'
          };
        } else {
          currentContact.email = email;
        }
      }
    }

    // Pattern 4: Phone / Tel detection (e.g. Tel: 011 670 9058, Telephone number: 011 670 9200)
    const phoneMatch = line.match(/(?:Tel(?:ephone)?(?:\s+number)?:?\s*)((?:\+27|0)\s*\d{2}\s*\d{3}\s*\d{4})/i);
    if (phoneMatch && currentContact) {
      currentContact.phone = phoneMatch[1].trim();
    }

    // Pattern 5: Department detection
    const deptMatch = line.match(/Department\s*:\s*([A-Za-z0-9\s,-]+)/i);
    if (deptMatch && currentContact) {
      currentContact.officeOrChannel = deptMatch[1].trim();
    }
  }

  if (currentContact && currentContact.name && !contacts.some(c => c.name === currentContact?.name)) {
    contacts.push(currentContact as CourseContact);
  }

  // Fallback: If no academic staff was parsed, add default module team contact
  if (contacts.length === 0) {
    contacts.push({
      name: 'Department Lecturer Team',
      email: 'computing@unisa.ac.za',
      phone: '011 670 9200',
      role: 'Academic Staff',
      officeOrChannel: 'Department of Information Systems'
    });
  }

  return contacts;
}