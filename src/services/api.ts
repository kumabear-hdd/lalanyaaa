import { INITIAL_MEMORIES, MemoryItem } from '../utils/memories.js';
import {
  DEFAULT_SITE_CONTENT,
  SiteContent,
  mergeSiteContent,
  decodeContentFromUrlParam
} from '../utils/siteContent.js';

const LOCAL_STORAGE_CACHE_KEY = 'our_little_universe_all_memories_v2';
const SITE_CONTENT_CACHE_KEY = 'our_little_universe_site_content_v1';
const FAVORITES_KEY = 'our_little_universe_favorites';

export interface SyncProgress {
  current: number;
  total: number;
  currentTitle: string;
}

export async function fetchMemories(): Promise<MemoryItem[]> {
  try {
    const res = await fetch('/api/memories', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.success && Array.isArray(data.memories)) {
      // Sync local favorite overrides if any
      const favSet = getLocalFavoriteIds();
      const updated = data.memories.map((m: MemoryItem) => ({
        ...m,
        isFavorite: favSet.has(m.id) ? true : m.isFavorite
      }));
      // Cache to localStorage for offline fallback
      try {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/memories, using local cache:', err);
  }

  // Fallback to local storage or defaults
  return getCachedMemories();
}

export function getCachedMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    const favSet = getLocalFavoriteIds();
    if (raw) {
      const parsed = JSON.parse(raw) as MemoryItem[];
      return parsed.map(m => ({
        ...m,
        isFavorite: favSet.has(m.id) ? true : m.isFavorite
      }));
    }
  } catch {}
  return INITIAL_MEMORIES;
}

export function getLocalFavoriteIds(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function toggleLocalFavorite(id: string, isFav: boolean): void {
  try {
    const favSet = getLocalFavoriteIds();
    if (isFav) {
      favSet.add(id);
    } else {
      favSet.delete(id);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favSet)));
  } catch {}
}

const ADMIN_PASSCODE_KEY = 'our_universe_admin_passcode';

export function getStoredAdminPasscode(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_PASSCODE_KEY) || localStorage.getItem(ADMIN_PASSCODE_KEY) || '';
}

export function setStoredAdminPasscode(pin: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_PASSCODE_KEY, pin.trim());
  localStorage.setItem(ADMIN_PASSCODE_KEY, pin.trim());
}

export function clearStoredAdminPasscode(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_PASSCODE_KEY);
  localStorage.removeItem(ADMIN_PASSCODE_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const pin = getStoredAdminPasscode();
  return pin ? { 'x-admin-passcode': pin } : {};
}

export async function uploadPhotoDataUrl(
  dataUrl: string,
  filename?: string
): Promise<{ url: string; size?: number }> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ dataUrl, filename })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Upload failed with status ${res.status}`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }

  const data = await res.json();
  return { url: data.url, size: data.size };
}

export async function createMemory(
  item: Omit<MemoryItem, 'id'>
): Promise<MemoryItem> {
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Failed to create memory (${res.status})`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }

  const data = await res.json();
  return data.memory;
}

export async function updateMemory(item: MemoryItem): Promise<MemoryItem> {
  // Update local favorite state if changed
  toggleLocalFavorite(item.id, item.isFavorite);

  const res = await fetch('/api/memories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Failed to update memory (${res.status})`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }

  const data = await res.json();
  return data.memory || item;
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Failed to delete memory (${res.status})`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }
}

export async function resetMemoriesToDefault(): Promise<MemoryItem[]> {
  const res = await fetch('/api/memories?action=reset', {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Failed to reset memories (${res.status})`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }

  const data = await res.json();
  return data.memories || INITIAL_MEMORIES;
}

/**
 * Checks if the current browser's localStorage contains user-uploaded memories
 * that are currently not stored in the cloud.
 */
export function getLocalUnmigratedMemories(serverMemories: MemoryItem[]): MemoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY);
    if (!raw) return [];
    const localItems = JSON.parse(raw) as MemoryItem[];
    if (!Array.isArray(localItems)) return [];

    const serverIds = new Set(serverMemories.map(m => m.id));
    const serverTitles = new Set(serverMemories.map(m => m.title.toLowerCase().trim()));

    return localItems.filter(item => {
      // Is an uploaded photo
      const isCustom = item.isUserUploaded || item.imageUrl.startsWith('data:image/');
      const notInServer = !serverIds.has(item.id) && !serverTitles.has(item.title.toLowerCase().trim());
      return isCustom && notInServer;
    });
  } catch {
    return [];
  }
}

/**
 * Migrates local base64 photos from this device's browser into the cloud storage.
 */
export async function migrateLocalPhotosToCloud(
  localItems: MemoryItem[],
  onProgress?: (progress: SyncProgress) => void
): Promise<{ successCount: number; failedCount: number }> {
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < localItems.length; i++) {
    const item = localItems[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: localItems.length,
        currentTitle: item.title
      });
    }

    try {
      let finalImageUrl = item.imageUrl;

      // If it's a base64 image trapped in the laptop's localStorage, upload it to cloud storage
      if (item.imageUrl.startsWith('data:image/')) {
        const uploadResult = await uploadPhotoDataUrl(
          item.imageUrl,
          `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`
        );
        finalImageUrl = uploadResult.url;
      }

      await createMemory({
        folderId: item.folderId,
        title: item.title,
        caption: item.caption,
        date: item.date,
        imageUrl: finalImageUrl,
        isFavorite: item.isFavorite,
        category: item.category,
        note: item.note,
        rotation: item.rotation,
        tapeColor: item.tapeColor,
        isUserUploaded: true
      });

      successCount++;
    } catch (err) {
      console.error(`Failed to migrate photo "${item.title}":`, err);
      failedCount++;
    }
  }

  return { successCount, failedCount };
}

/**
 * Loads shared site content (names, messages, letters).
 * Priority order:
 * 1. URL parameter (?c=... or ?content=...) if opened via direct snapshot share link
 * 2. Shared cloud server endpoint (/api/site-content)
 * 3. Local browser cache
 * 4. Default template
 */
export async function fetchSiteContent(): Promise<SiteContent> {
  // Check URL parameter first (allows instant sharing of message snapshots)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlContent = params.get('c') || params.get('content');
    if (urlContent) {
      const decoded = decodeContentFromUrlParam(urlContent);
      if (decoded) {
        // Save to cache and cloud server in background
        saveSiteContent(decoded).catch(() => {});
        return decoded;
      }
    }
  }

  // Fetch from serverless backend
  try {
    const res = await fetch('/api/site-content', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.content) {
        const merged = mergeSiteContent(data.content);
        try {
          localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(merged));
        } catch {}
        return merged;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/site-content, falling back to local cache:', err);
  }

  return getCachedSiteContent();
}

export function getCachedSiteContent(): SiteContent {
  try {
    const raw = localStorage.getItem(SITE_CONTENT_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return mergeSiteContent(parsed);
    }
  } catch {}
  return { ...DEFAULT_SITE_CONTENT };
}

export async function saveSiteContent(content: SiteContent): Promise<SiteContent> {
  const merged = mergeSiteContent(content);

  // Cache locally
  try {
    localStorage.setItem(SITE_CONTENT_CACHE_KEY, JSON.stringify(merged));
  } catch {}

  // Save to shared server / cloud
  const res = await fetch('/api/site-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(merged)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const err: any = new Error(errData.error || `Failed to save site content (${res.status})`);
    err.code = errData.code || (res.status === 401 ? 'UNAUTHORIZED' : undefined);
    throw err;
  }

  const data = await res.json();
  return data.content || merged;
}

export async function resetSiteContentToDefault(): Promise<SiteContent> {
  try {
    localStorage.removeItem(SITE_CONTENT_CACHE_KEY);
  } catch {}

  const res = await fetch('/api/site-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ action: 'reset' })
  });

  if (!res.ok) {
    return { ...DEFAULT_SITE_CONTENT };
  }

  const data = await res.json();
  return data.content || { ...DEFAULT_SITE_CONTENT };
}
