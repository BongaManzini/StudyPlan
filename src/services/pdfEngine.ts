import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface PdfExtractionResult {
  fullText: string;
  totalPages: number;
  pages: ExtractedPage[];
  fileName: string;
}

interface TextToken {
  text: string;
  x: number;
  y: number;
  height: number;
}

/**
 * Resilient 2D Spatial PDF Tokenizer:
 * Groups text tokens using vertical coordinate proximity tolerance (|Y1 - Y2| <= height / 2),
 * sorts lines descending by Y (top to bottom), and sorts tokens within each line ascending by X (left to right).
 */
function normalizePageTokens(items: Record<string, unknown>[]): string {
  const tokens: TextToken[] = items
    .filter(i => 'str' in i && typeof i.str === 'string' && i.str.length > 0)
    .map(i => {
      const str = i.str as string;
      const transform = Array.isArray(i.transform) ? (i.transform as number[]) : undefined;
      const heightVal = typeof i.height === 'number' ? i.height : 10;
      const h = Math.abs(heightVal) || (transform ? Math.abs(transform[3]) : 10);
      return {
        text: str,
        x: transform ? transform[4] : 0,
        y: transform ? transform[5] : 0,
        height: h
      };
    });

  if (tokens.length === 0) return '';

  // Sort tokens primarily by Y descending (top to bottom)
  tokens.sort((a, b) => b.y - a.y);

  const lines: TextToken[][] = [];

  for (const token of tokens) {
    const tolerance = Math.max(2, token.height / 2);
    const matchingLine = lines.find(l => {
      const lineY = l[0].y;
      return Math.abs(lineY - token.y) <= tolerance;
    });

    if (matchingLine) {
      matchingLine.push(token);
    } else {
      lines.push([token]);
    }
  }

  // Sort each line horizontally by X ascending (left to right) and join
  return lines
    .map(line =>
      line
        .sort((a, b) => a.x - b.x)
        .map(t => t.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(lineText => lineText.length > 0)
    .join('\n');
}

export async function extractPdfContent(file: File): Promise<PdfExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;

  const pages: ExtractedPage[] = [];
  let fullTextAccumulator = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = normalizePageTokens(content.items);

    pages.push({
      pageNumber: pageNum,
      text: pageText
    });

    fullTextAccumulator += `\n--- [PAGE ${pageNum}] ---\n${pageText}\n`;
  }

  return {
    fullText: fullTextAccumulator,
    totalPages: pdfDoc.numPages,
    pages,
    fileName: file.name
  };
}