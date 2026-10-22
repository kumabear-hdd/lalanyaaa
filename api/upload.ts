import type { Request, Response } from 'express';
import { storeImageFile } from './storage-helper.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataUrl, filename, contentType } = req.body || {};

    if (!dataUrl) {
      return res.status(400).json({ error: 'dataUrl or file payload is required' });
    }

    // Parse base64 data URL
    let buffer: Buffer;
    let mime = contentType || 'image/jpeg';

    if (dataUrl.startsWith('data:')) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mime = match[1];
        buffer = Buffer.from(match[2], 'base64');
      } else {
        return res.status(400).json({ error: 'Invalid data URL format' });
      }
    } else {
      buffer = Buffer.from(dataUrl, 'base64');
    }

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size exceeds 10MB limit' });
    }

    const fname = filename || `photo-${Date.now()}.${mime.split('/')[1] || 'jpg'}`;
    const result = await storeImageFile(buffer, fname, mime);

    return res.status(200).json({
      success: true,
      url: result.url,
      pathname: result.pathname,
      size: buffer.length,
      mimeType: mime
    });
  } catch (err: any) {
    console.error('API /api/upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload photo' });
  }
}
