export interface DocumentChunk {
  id: string;
  courseId: string;
  sectionKey: string;
  heading?: string;
  text: string;
  startPage: number;
  endPage: number;
  chunkIndex: number;
  createdAt: number;
}

export interface ChunkSearchResult {
  chunk: DocumentChunk;
  score: number;
  matchedTerms: string[];
  snippet: string;
}

export interface SearchQueryFilter {
  courseId?: string;
  sectionKey?: string;
  maxResults?: number;
}
