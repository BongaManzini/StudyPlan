import { useState, useEffect } from 'react';
import { X, FileText, Download, AlertCircle } from 'lucide-react';
import { getRawDocumentByCourse } from '../db';

interface Props {
  courseId: string;
  courseCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewerModal({ courseId, courseCode, isOpen, onClose }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('Document.pdf');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !courseId) return;

    let isMounted = true;
    let createdUrl: string | null = null;

    getRawDocumentByCourse(courseId)
      .then(doc => {
        if (isMounted && doc && doc.fileBlob) {
          createdUrl = URL.createObjectURL(doc.fileBlob);
          setBlobUrl(createdUrl);
          setFileName(doc.fileName);
        }
      })
      .catch(err => console.error('Failed to load raw PDF blob:', err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [courseId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] w-full max-w-5xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--accent-indigo)]" />
            <h2 className="text-base font-semibold text-[var(--text-main)]">
              {courseCode} - {fileName}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {blobUrl && (
              <a
                href={blobUrl}
                download={fileName}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-primary)] hover:bg-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] rounded-lg transition-colors border border-[var(--border-subtle)]"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-black/40 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-sm">
              Loading document blob...
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-full border-none"
              title={`${courseCode} PDF Document`}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-muted)] gap-2">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-sm font-medium">No original PDF blob available for this course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}