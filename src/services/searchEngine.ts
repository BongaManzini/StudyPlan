import type { DocumentChunk, ChunkSearchResult, SearchQueryFilter } from '../types/chunk';
import { getChunksByCourse } from '../db';

/**
 * Local-First Grounded BM25-style Lexical Search Engine:
 * Scores term frequency with heading/title boosts and returns cited text passages with exact page numbers.
 */
export async function searchCourseChunks(
  query: string,
  filter?: SearchQueryFilter
): Promise<ChunkSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  const courseId = filter?.courseId;
  const maxResults = filter?.maxResults || 5;

  let chunks: DocumentChunk[] = [];
  if (courseId) {
    chunks = await getChunksByCourse(courseId);
  }

  if (chunks.length === 0) return [];

  const rawTerms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1);

  if (rawTerms.length === 0) return [];

  const results: ChunkSearchResult[] = [];

  for (const chunk of chunks) {
    const chunkTextLower = chunk.text.toLowerCase();
    const headingLower = (chunk.heading || '').toLowerCase();

    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of rawTerms) {
      // Heading match boost
      if (headingLower.includes(term)) {
        score += 15;
        matchedTerms.push(term);
      }

      // Term frequency in chunk body
      const matches = chunkTextLower.split(term).length - 1;
      if (matches > 0) {
        score += matches * 5;
        matchedTerms.push(term);
      }
    }

    if (score > 0) {
      // Extract snippet around first matching term
      const firstMatchedTerm = matchedTerms[0] || rawTerms[0];
      const termPos = chunkTextLower.indexOf(firstMatchedTerm);
      const snippetStart = Math.max(0, termPos - 60);
      const snippetEnd = Math.min(chunk.text.length, termPos + 180);
      let snippet = chunk.text.slice(snippetStart, snippetEnd).trim();
      if (snippetStart > 0) snippet = '...' + snippet;
      if (snippetEnd < chunk.text.length) snippet = snippet + '...';

      results.push({
        chunk,
        score,
        matchedTerms: Array.from(new Set(matchedTerms)),
        snippet
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}
