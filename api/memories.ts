import type { Request, Response } from 'express';
import {
  getSharedMemories,
  saveSharedMemories,
  saveSingleMemoryRecord,
  deleteSingleMemoryRecord,
  deleteImageFile,
  wipeAllSharedMemories
} from './storage-helper.js';
import { MemoryItem } from '../src/utils/memories.js';
import { isAuthorizedAdmin } from './auth-helper.js';

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-passcode, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const memories = await getSharedMemories();
      return res.status(200).json({ success: true, memories });
    }

    // Protect write operations (POST, PUT, DELETE)
    if (!isAuthorizedAdmin(req)) {
      return res.status(401).json({
        error: 'PIN Pengelola (Aa) diperlukan untuk menambah, mengubah, atau menghapus kenangan.',
        code: 'UNAUTHORIZED'
      });
    }

    if (req.method === 'POST') {
      const action = req.query.action || (req.body && req.body.action);
      
      // Reset action: Completely wipe all data (no prototype dummy data left)
      if (action === 'reset') {
        await wipeAllSharedMemories();
        return res.status(200).json({ success: true, memories: [] });
      }

      // Add new memory
      const { title, caption, folderId, category, date, note, imageUrl, rotation, tapeColor } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ error: 'Title and image URL are required' });
      }

      const memories = await getSharedMemories();
      const newMemory: MemoryItem = {
        id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        folderId: folderId || 'our-first-memories',
        title: title.trim(),
        caption: caption?.trim() || '',
        date: date?.trim() || 'Kenangan Indah',
        imageUrl: imageUrl,
        isFavorite: false,
        category: category || 'Sweet Moments',
        note: note?.trim() || '',
        rotation: typeof rotation === 'number' ? rotation : (Math.random() * 4 - 2),
        tapeColor: tapeColor || '#FFF0B8',
        isUserUploaded: true,
        createdAt: new Date().toISOString()
      };

      // Atomic record save + master index update
      await saveSingleMemoryRecord(newMemory);
      const updated = [newMemory, ...memories];
      await saveSharedMemories(updated);

      return res.status(201).json({ success: true, memory: newMemory, memories: updated });
    }

    if (req.method === 'PUT') {
      const memory = req.body as MemoryItem;
      if (!memory || !memory.id) {
        return res.status(400).json({ error: 'Valid memory item with ID is required' });
      }

      await saveSingleMemoryRecord(memory);
      const memories = await getSharedMemories();
      const updated = memories.map(m => (m.id === memory.id ? { ...m, ...memory } : m));
      await saveSharedMemories(updated);

      return res.status(200).json({ success: true, memory, memories: updated });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id as string || (req.body && req.body.id);
      if (!id) {
        return res.status(400).json({ error: 'Memory ID is required' });
      }

      await deleteSingleMemoryRecord(id);
      const memories = await getSharedMemories();
      const target = memories.find(m => m.id === id);
      const updated = memories.filter(m => m.id !== id);
      await saveSharedMemories(updated);

      // Clean up remote image if uploaded to blob
      if (target?.imageUrl && target.isUserUploaded) {
        await deleteImageFile(target.imageUrl);
      }

      return res.status(200).json({ success: true, memories: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('API /api/memories error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
