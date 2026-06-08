import type { ContentRef } from "@/types/content-ref";

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  ref: ContentRef;
  expiresAt: number;
}

function storageKey(roomId: string) {
  return `wp:room:${roomId}`;
}

export function saveRoomContentRef(roomId: string, ref: ContentRef): void {
  try {
    const entry: CacheEntry = { ref, expiresAt: Date.now() + TTL_MS };
    localStorage.setItem(storageKey(roomId), JSON.stringify(entry));
  } catch {
    // localStorage unavailable — silent fail
  }
}

export function getRoomContentRef(roomId: string): ContentRef | null {
  try {
    const raw = localStorage.getItem(storageKey(roomId));
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(storageKey(roomId));
      return null;
    }
    return entry.ref;
  } catch {
    return null;
  }
}

export function clearRoomContentRef(roomId: string): void {
  try {
    localStorage.removeItem(storageKey(roomId));
  } catch {
    // silent fail
  }
}
