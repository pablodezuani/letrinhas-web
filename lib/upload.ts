import { upload } from '@vercel/blob/client';
import type { AttachmentKind } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function kindFromMime(mime: string): AttachmentKind {
  if (mime.startsWith('image/')) return 'IMAGE';
  if (mime.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

export const MAX_SIZE_BYTES: Record<AttachmentKind, number> = {
  IMAGE: 8 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
  DOCUMENT: 15 * 1024 * 1024,
};

interface UploadAttachmentResult {
  kind: AttachmentKind;
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

/**
 * Uploads a message attachment directly to Vercel Blob using a short-lived,
 * server-issued token (see POST /uploads/token) — the file never passes through
 * our Express function body, which would hit Vercel's serverless request-size cap.
 */
export async function uploadAttachment(
  childId: string,
  file: File,
  onProgress?: (percentage: number) => void,
  abortSignal?: AbortSignal,
): Promise<UploadAttachmentResult> {
  const kind = kindFromMime(file.type);

  if (file.size > MAX_SIZE_BYTES[kind]) {
    throw new Error(`Arquivo muito grande (máx. ${Math.round(MAX_SIZE_BYTES[kind] / 1024 / 1024)}MB para este tipo).`);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('letrinhas:token') : null;

  const blob = await upload(`messages/${childId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
    handleUploadUrl: `${API_URL}/uploads/token`,
    clientPayload: JSON.stringify({ childId, kind }),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    contentType: file.type,
    abortSignal,
    onUploadProgress: (evt) => onProgress?.(evt.percentage),
  });

  return { kind, url: blob.url, fileName: file.name, mimeType: file.type, size: file.size };
}
