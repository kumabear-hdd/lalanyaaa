import { INITIAL_MEMORIES, MemoryItem } from '../utils/memories.js';

const LOCAL_STORAGE_CACHE_KEY = 'our_little_universe_all_memories_v2';
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

export async function uploadPhotoDataUrl(
  dataUrl: string,
  filename?: string
): Promise<{ url: string; size?: number }> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, filename })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  return { url: data.url, size: data.size };
}

export async function createMemory(
  item: Omit<MemoryItem, 'id'>
): Promise<MemoryItem> {
  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create memory (${res.status})`);
  }

  const data = await res.json();
  return data.memory;
}

export async function updateMemory(item: MemoryItem): Promise<MemoryItem> {
  // Update local favorite state if changed
  toggleLocalFavorite(item.id, item.isFavorite);

  const res = await fetch('/api/memories', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update memory (${res.status})`);
  }

  const data = await res.json();
  return data.memory || item;
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/memories?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete memory (${res.status})`);
  }
}

export async function resetMemoriesToDefault(): Promise<MemoryItem[]> {
  const res = await fetch('/api/memories?action=reset', {
    method: 'POST'
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to reset memories (${res.status})`);
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
