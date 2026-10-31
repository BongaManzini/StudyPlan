import type { DocumentChunk } from '../types/chunk';
import type { SegmentedDocument } from './sectionSegmenter';
import type { ExtractedPage } from './pdfEngine';

interface PageMarker {
  pageNumber: number;
  charOffset: number;
}

/**
 * Phase 2 Semantic Chunker:
 * Generates sliding-window character/token chunks (~1,500 chars, ~200 overlap)
 * while computing exact source document page-span citations (startPage, endPage).
 */
export function chunkDocument(
  segmented: SegmentedDocument,
  pages: ExtractedPage[],
  courseId: string
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const chunkSize = 1500;
  const chunkOverlap = 200;

  // Build full text and page character offsets map
  let accumText = '';
  const pageMarkers: PageMarker[] = [];

  for (const page of pages) {
    pageMarkers.push({
      pageNumber: page.pageNumber,
      charOffset: accumText.length
    });
    accumText += page.text + '\n';
  }

  // Helper to map global char index to page number
  const getPageForOffset = (offset: number): number => {
    let pageNum = 1;
    for (const marker of pageMarkers) {
      if (offset >= marker.charOffset) {
        pageNum = marker.pageNumber;
      } else {
        break;
      }
    }
    return pageNum;
  };

  let globalChunkIndex = 0;

  for (const sec of segmented.sections) {
    const body = sec.body.trim();
    if (!body) continue;

    let start = 0;
    while (start < body.length) {
      let end = start + chunkSize;
      if (end < body.length) {
        // Try to break cleanly at sentence end or newline
        const lastPeriod = body.lastIndexOf('.', end);
        const lastNewline = body.lastIndexOf('\n', end);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        if (breakPoint > start + chunkSize / 2) {
          end = breakPoint + 1;
        }
      } else {
        end = body.length;
      }

      const chunkText = body.slice(start, end).trim();

      if (chunkText.length > 50) {
        // Find matching global offset for page span calculation
        const globalStart = accumText.indexOf(chunkText.slice(0, 40));
        const startPage = globalStart >= 0 ? getPageForOffset(globalStart) : 1;
        const endPage = globalStart >= 0 ? getPageForOffset(globalStart + chunkText.length) : startPage;

        chunks.push({
          id: `chunk-${courseId}-${sec.key}-${globalChunkIndex++}`,
          courseId,
          sectionKey: sec.key,
          heading: sec.heading,
          text: chunkText,
          startPage,
          endPage,
          chunkIndex: globalChunkIndex,
          createdAt: Date.now()
        });
      }

      if (end >= body.length) break;
      start = end - chunkOverlap;
    }
  }

  return chunks;
}
