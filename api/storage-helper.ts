import fs from 'fs';
import path from 'path';
import { put, list, del } from '@vercel/blob';
import { INITIAL_MEMORIES, MemoryItem } from '../src/utils/memories.js';
import { DEFAULT_SITE_CONTENT, SiteContent, mergeSiteContent } from '../src/utils/siteContent.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_JSON_FILE = path.join(DATA_DIR, 'memories.json');
const LOCAL_SITE_CONTENT_FILE = path.join(DATA_DIR, 'site-content.json');
const LOCAL_UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

// Ensure local directories exist
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  try {
    fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
  } catch {}
}

const HAS_VERCEL_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * Loads memories from either Vercel Blob cloud storage or local persistent storage.
 * Returns shared array (including empty array [] if wiped).
 */
export async function getSharedMemories(): Promise<MemoryItem[]> {
  if (HAS_VERCEL_BLOB) {
    try {
      // 1. Try reading the master index
      const { blobs } = await list({ prefix: 'database/memories_master.json' });
      if (blobs && blobs.length > 0) {
        const latestBlob = blobs[0];
        // Bust CDN cache with query parameter
        const res = await fetch(`${latestBlob.url}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (res.ok) {
          const data = (await res.json()) as MemoryItem[];
          if (Array.isArray(data)) {
            return data;
          }
        }
      }

      // 2. Fallback: check individual record blobs under metadata/
      const recordBlobs = await list({ prefix: 'metadata/' });
      if (recordBlobs.blobs && recordBlobs.blobs.length > 0) {
        const recordPromises = recordBlobs.blobs.map(async (b) => {
          try {
            const r = await fetch(`${b.url}?t=${Date.now()}`, { cache: 'no-store' });
            return r.ok ? ((await r.json()) as MemoryItem) : null;
          } catch {
            return null;
          }
        });

        const fetchedRecords = (await Promise.all(recordPromises)).filter(
          (m): m is MemoryItem => m !== null && Boolean(m.id)
        );

        if (fetchedRecords.length > 0) {
          saveSharedMemories(fetchedRecords).catch(() => {});
          return fetchedRecords;
        }
      }
    } catch (err) {
      console.error('Error fetching memories from Vercel Blob:', err);
    }
  }

  // Fallback to local file persistence
  if (fs.existsSync(LOCAL_JSON_FILE)) {
    try {
      const content = fs.readFileSync(LOCAL_JSON_FILE, 'utf8');
      const data = JSON.parse(content) as MemoryItem[];
      if (Array.isArray(data)) {
        return data;
      }
    } catch (err) {
      console.error('Error reading local memories.json:', err);
    }
  }

  return [];
}

/**
 * Completely wipes all memories from Vercel Blob and local storage.
 * Leaves 0 photos so only real user uploads are stored.
 */
export async function wipeAllSharedMemories(): Promise<void> {
  // Clear local file to empty array
  try {
    fs.writeFileSync(LOCAL_JSON_FILE, JSON.stringify([], null, 2), 'utf8');
  } catch (err) {
    console.error('Error clearing local memories.json:', err);
  }

  if (HAS_VERCEL_BLOB) {
    try {
      // 1. Wipe master index
      await put('database/memories_master.json', JSON.stringify([]), {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: 0
      });

      // 2. Delete all metadata records
      const { blobs } = await list({ prefix: 'metadata/' });
      if (blobs && blobs.length > 0) {
        for (const b of blobs) {
          try {
            await del(b.url);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error wiping Vercel Blob records:', err);
    }
  }
}

/**
 * Saves memories list to Vercel Blob and/or local persistent file.
 * Uses atomic record blobs for user-uploaded items and updates the master index with cache-busting.
 */
export async function saveSharedMemories(memories: MemoryItem[]): Promise<void> {
  // Always save locally
  try {
    fs.writeFileSync(LOCAL_JSON_FILE, JSON.stringify(memories, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local memories.json:', err);
  }

  if (HAS_VERCEL_BLOB) {
    try {
      // 1. Update master index with cacheControlMaxAge: 0
      await put('database/memories_master.json', JSON.stringify(memories), {
        access: 'public',
        addRandomSuffix: false,
        cacheControlMaxAge: 0
      });
    } catch (err) {
      console.error('Error saving master index to Vercel Blob:', err);
    }
  }
}

/**
 * Persists an individual memory metadata record in Vercel Blob to prevent race conditions.
 */
export async function saveSingleMemoryRecord(memory: MemoryItem): Promise<void> {
  if (HAS_VERCEL_BLOB) {
    try {
      await put(`metadata/${memory.id}.json`, JSON.stringify(memory), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0
      });
    } catch (err) {
      console.error(`Error saving record metadata/${memory.id}.json to Vercel Blob:`, err);
    }
  }
}

/**
 * Deletes an individual memory metadata record in Vercel Blob.
 */
export async function deleteSingleMemoryRecord(id: string): Promise<void> {
  if (HAS_VERCEL_BLOB) {
    try {
      const { blobs } = await list({ prefix: `metadata/${id}.json` });
      if (blobs && blobs.length > 0) {
        await del(blobs[0].url);
      }
    } catch (err) {
      console.error(`Error deleting metadata/${id}.json from Vercel Blob:`, err);
    }
  }
}

/**
 * Uploads an image file to Vercel Blob or local storage and returns its permanent URL.
 */
export async function storeImageFile(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<{ url: string; pathname: string }> {
  const safeName = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const uniqueName = `photos/${Date.now()}-${safeName}`;

  if (HAS_VERCEL_BLOB) {
    try {
      const blob = await put(uniqueName, buffer, {
        access: 'public',
        contentType: contentType || 'image/jpeg',
        cacheControlMaxAge: 31536000 // 1 year cache for immutable photo files
      });
      return { url: blob.url, pathname: blob.pathname };
    } catch (err) {
      console.error('Error uploading to Vercel Blob:', err);
      // Fall through to local storage
    }
  }

  // Local storage fallback
  const localFileName = `${Date.now()}-${safeName}`;
  const localFilePath = path.join(LOCAL_UPLOADS_DIR, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  const localUrl = `/uploads/${localFileName}`;
  return { url: localUrl, pathname: uniqueName };
}

/**
 * Deletes an image from Vercel Blob if it was hosted there.
 */
export async function deleteImageFile(urlOrPathname: string): Promise<void> {
  if (HAS_VERCEL_BLOB && urlOrPathname.startsWith('http')) {
    try {
      await del(urlOrPathname);
    } catch (err) {
      console.error('Error deleting from Vercel Blob:', err);
    }
  }
}

/**
 * Loads shared site content (names, messages, letters) from Vercel Blob or local storage.
 */
export async function getSharedSiteContent(): Promise<SiteContent> {
  if (HAS_VERCEL_BLOB) {
    try {
      const { blobs } = await list({ prefix: 'database/site_content.json' });
      if (blobs && blobs.length > 0) {
        const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        });
        if (res.ok) {
          const data = await res.json();
          return mergeSiteContent(data);
        }
      }
    } catch (err) {
      console.error('Error fetching site_content from Vercel Blob:', err);
    }
  }

  // Local file fallback
  if (fs.existsSync(LOCAL_SITE_CONTENT_FILE)) {
    try {
      const content = fs.readFileSync(LOCAL_SITE_CONTENT_FILE, 'utf8');
      const parsed = JSON.parse(content);
      return mergeSiteContent(parsed);
    } catch (err) {
      console.error('Error reading local site-content.json:', err);
    }
  }

  return { ...DEFAULT_SITE_CONTENT };
}

/**
 * Saves shared site content (names, messages, letters) to Vercel Blob and local storage.
 */
export async function saveSharedSiteContent(content: SiteContent): Promise<void> {
  const merged = mergeSiteContent(content);

  // Save locally
  try {
    fs.writeFileSync(LOCAL_SITE_CONTENT_FILE, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local site-content.json:', err);
  }

  if (HAS_VERCEL_BLOB) {
    try {
      await put('database/site_content.json', JSON.stringify(merged), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0
      });
    } catch (err) {
      console.error('Error saving site_content to Vercel Blob:', err);
    }
  }
}
