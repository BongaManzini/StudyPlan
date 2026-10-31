import type { DocumentClassification, StandardDocumentCategory } from '../db/schema';

interface CategoryMatcher {
  category: StandardDocumentCategory;
  keywords: string[];
  patterns: RegExp[];
  baseWeight: number;
}

const CATEGORY_MATCHERS: CategoryMatcher[] = [
  {
    category: 'Tutorial Letter (TL101)',
    keywords: [
      'tutorial letter',
      'tl101',
      'unisa',
      'prescribed books',
      'assessment plan',
      'lecturer',
      'module overview',
      'myunisa'
    ],
    patterns: [
      /\btutorial\s+letter\s+(?:101|102|103|201|301|501)\b/i,
      /\b[A-Z]{3,4}\d{4}\/101\b/i,
      /\bTL101\b/i,
      /\bmodule\s+overview\b/i,
      /\bprescribed\s+books?\b/i
    ],
    baseWeight: 1.5
  },
  {
    category: 'Exam Scope / Prep Guide',
    keywords: ['exam scope', 'examination paper', 'revision guide', 'exam preparation', 'previous papers'],
    patterns: [/\bexam(?:ination)?\s+scope\b/i, /\bprep(?:aration)?\s+guide\b/i, /\brevision\s+pack\b/i],
    baseWeight: 1.0
  },
  {
    category: 'Official Study Guide',
    keywords: ['study guide', 'learning unit', 'contents', 'chapter overview', 'outcomes'],
    patterns: [/\bofficial\s+study\s+guide\b/i, /\blearning\s+units?\b/i],
    baseWeight: 1.0
  },
  {
    category: 'Certification Blueprint',
    keywords: ['certification', 'exam objectives', 'domain weight', 'blueprint', 'passing score'],
    patterns: [/\bcertification\s+blueprint\b/i, /\bexam\s+objectives\b/i],
    baseWeight: 1.0
  },
  {
    category: 'Session Transcript',
    keywords: ['transcript', 'speaker', 'recording timestamp', 'slide', 'lecture transcript'],
    patterns: [/\blecture\s+transcript\b/i, /\bvideo\s+transcript\b/i],
    baseWeight: 1.0
  }
];

export function classifyDocument(text: string, fileName: string): DocumentClassification {
  const lowerText = text.toLowerCase();
  const lowerFileName = fileName.toLowerCase();

  let highestScore = 0;
  let bestCategory: StandardDocumentCategory = 'General Course Material';
  const detectedKeywords: string[] = [];

  for (const matcher of CATEGORY_MATCHERS) {
    let score = 0;
    const matchedCategoryKeywords: string[] = [];

    for (const kw of matcher.keywords) {
      if (lowerText.includes(kw) || lowerFileName.includes(kw)) {
        score += 15 * matcher.baseWeight;
        matchedCategoryKeywords.push(kw);
      }
    }

    for (const pattern of matcher.patterns) {
      if (pattern.test(text) || pattern.test(fileName)) {
        score += 35 * matcher.baseWeight;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestCategory = matcher.category;
      detectedKeywords.length = 0;
      detectedKeywords.push(...matchedCategoryKeywords);
    }
  }

  const confidence = Math.min(100, Math.max(50, Math.round(highestScore)));

  return {
    category: bestCategory,
    confidence,
    detectedKeywords: Array.from(new Set(detectedKeywords)),
    isUserConfirmed: false
  };
}