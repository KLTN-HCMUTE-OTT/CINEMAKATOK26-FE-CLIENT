import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveRoomContentRef,
  getRoomContentRef,
  clearRoomContentRef,
} from "@/lib/watch-party-content-cache";
import type { ContentRef } from "@/types/content-ref";

const mockRef: ContentRef = {
  type: "movie",
  contentId: "movie-123",
  videoId: "video-456",
  title: "Inception",
  posterUrl: "https://example.com/poster.jpg",
  description: "A mind-bending thriller",
  durationSec: 8880,
};

describe("watch-party-content-cache", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("saves and retrieves a ContentRef", () => {
    saveRoomContentRef("room-1", mockRef);
    const result = getRoomContentRef("room-1");
    expect(result).toEqual(mockRef);
  });

  it("returns null for unknown roomId", () => {
    expect(getRoomContentRef("room-unknown")).toBeNull();
  });

  it("clears a ContentRef", () => {
    saveRoomContentRef("room-1", mockRef);
    clearRoomContentRef("room-1");
    expect(getRoomContentRef("room-1")).toBeNull();
  });

  it("returns null and removes entry when TTL expired", () => {
    vi.useFakeTimers();
    saveRoomContentRef("room-1", mockRef);
    // Advance 25 hours past TTL
    vi.advanceTimersByTime(25 * 60 * 60 * 1000);
    const result = getRoomContentRef("room-1");
    expect(result).toBeNull();
    // Entry should be removed from storage
    expect(localStorage.getItem("wp:room:room-1")).toBeNull();
  });

  it("returns valid entry before TTL expires", () => {
    vi.useFakeTimers();
    saveRoomContentRef("room-1", mockRef);
    vi.advanceTimersByTime(23 * 60 * 60 * 1000); // 23 hours — still valid
    expect(getRoomContentRef("room-1")).toEqual(mockRef);
  });

  it("handles episode ContentRef", () => {
    const episodeRef: ContentRef = {
      type: "episode",
      contentId: "ep-789",
      seriesId: "series-001",
      videoId: "video-999",
      title: "Breaking Bad - S1 E1: Pilot",
      posterUrl: "https://example.com/bb.jpg",
      description: "Walter White begins his transformation",
      durationSec: 2760,
    };
    saveRoomContentRef("room-2", episodeRef);
    expect(getRoomContentRef("room-2")).toEqual(episodeRef);
  });

  it("isolates different rooms", () => {
    const refA: ContentRef = { ...mockRef, title: "Movie A" };
    const refB: ContentRef = { ...mockRef, title: "Movie B" };
    saveRoomContentRef("room-a", refA);
    saveRoomContentRef("room-b", refB);
    expect(getRoomContentRef("room-a")?.title).toBe("Movie A");
    expect(getRoomContentRef("room-b")?.title).toBe("Movie B");
  });
});
