'use client';

/**
 * Phase 4: useContentCensorship
 *
 * Binds to the HTML5 <video> element managed by Shaka Player and drives the
 * real-time censorship overlay state.
 *
 * Design decisions:
 *  - We listen to the underlying `timeupdate`, `seeking`, and `seeked` events
 *    on the media element directly (not Shaka's own events) so we stay in sync
 *    regardless of DASH presentation-time offsets.
 *  - Pre-processing (frame → segment merging) runs once at mount / data change
 *    so the hot path (every timeupdate) only does array look-ups.
 *  - Full-blur is controlled by merged PlaybackSegments; selective box-blur is
 *    controlled by raw frames with a ±1 s window.
 */

import { useState, useEffect, RefObject, useMemo } from 'react';
import {
  CensorFrame,
  ContentPreferences,
  CensorBox,
  PlaybackSegment,
} from '@/types/censorship.types';
import { computePlaybackSegments } from '@/lib/censorship-utils';

const FRAME_MATCH_THRESHOLD_SEC = 1.0; // ±1 s window for box-level matching

export interface UseContentCensorshipReturn {
  /** Whether the full-screen blur overlay should be shown (strict mode). */
  isFullBlurActive: boolean;
  /** Bounding boxes that should be blurred (moderate mode). */
  activeBoxes: CensorBox[];
  /** True when either full-blur or any active box is rendered. */
  isCensorshipActive: boolean;
  /** Merged segments used for full-blur (exposed for optional timeline markers). */
  segments: PlaybackSegment[];
}

export function useContentCensorship(
  videoRef: RefObject<HTMLVideoElement | null>,
  rawViolentFrames: CensorFrame[] | null,
  rawNudeFrames: CensorFrame[] | null,
  preferences: ContentPreferences,
): UseContentCensorshipReturn {
  const [isFullBlurActive, setIsFullBlurActive] = useState(false);
  const [activeBoxes, setActiveBoxes] = useState<CensorBox[]>([]);

  // ── Pre-process: merge frames → continuous segments ──────────────────────
  const segments = useMemo<PlaybackSegment[]>(() => {
    const vSegs = computePlaybackSegments(rawViolentFrames, 'violence');
    const nSegs = computePlaybackSegments(rawNudeFrames, 'nudity');
    return [...vSegs, ...nSegs];
  }, [rawViolentFrames, rawNudeFrames]);

  // ── Hot path: bind to video events ───────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onUpdate = () => {
      const t = video.currentTime;

      // ── 1. Full-blur check (strict mode) ────────────────────────────────
      const inStrictSegment = segments.some((seg) => {
        const pref =
          seg.type === 'violence' ? preferences.violence : preferences.nudity;
        return pref === 'strict' && t >= seg.start && t <= seg.end;
      });
      setIsFullBlurActive(inStrictSegment);

      // ── 2. Selective box-blur (moderate mode) ───────────────────────────
      const boxes: CensorBox[] = [];

      if (preferences.violence === 'moderate' && rawViolentFrames) {
        const nearest = rawViolentFrames.find(
          (f) => Math.abs(f.timestamp - t) <= FRAME_MATCH_THRESHOLD_SEC,
        );
        if (nearest) boxes.push(...nearest.boxes);
      }

      if (preferences.nudity === 'moderate' && rawNudeFrames) {
        const nearest = rawNudeFrames.find(
          (f) => Math.abs(f.timestamp - t) <= FRAME_MATCH_THRESHOLD_SEC,
        );
        if (nearest) boxes.push(...nearest.boxes);
      }

      setActiveBoxes(boxes);
    };

    video.addEventListener('timeupdate', onUpdate);
    video.addEventListener('seeking', onUpdate);
    video.addEventListener('seeked', onUpdate);

    return () => {
      video.removeEventListener('timeupdate', onUpdate);
      video.removeEventListener('seeking', onUpdate);
      video.removeEventListener('seeked', onUpdate);
    };
  }, [segments, rawViolentFrames, rawNudeFrames, preferences, videoRef]);

  return {
    isFullBlurActive,
    activeBoxes,
    isCensorshipActive: isFullBlurActive || activeBoxes.length > 0,
    segments,
  };
}
