import type { Request, Response } from 'express';
import { getSharedSiteContent, saveSharedSiteContent } from './storage-helper.js';
import { DEFAULT_SITE_CONTENT, SiteContent } from '../src/utils/siteContent.js';
import { isAuthorizedAdmin } from './auth-helper.js';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-passcode, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const content = await getSharedSiteContent();
      return res.status(200).json({ success: true, content });
    }

    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'PIN Pengelola (Aa) diperlukan untuk mengubah isi website.',
        code: 'UNAUTHORIZED'
      });
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const { action } = req.body || {};
      if (action === 'reset') {
        await saveSharedSiteContent(DEFAULT_SITE_CONTENT);
        return res.status(200).json({ success: true, content: DEFAULT_SITE_CONTENT });
      }

      const incomingContent = req.body as SiteContent;
      if (!incomingContent || typeof incomingContent !== 'object') {
        return res.status(400).json({ error: 'Valid site content payload is required' });
      }

      await saveSharedSiteContent(incomingContent);
      const updated = await getSharedSiteContent();
      return res.status(200).json({ success: true, content: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /api/site-content error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
