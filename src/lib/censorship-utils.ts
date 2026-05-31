/**
 * Phase 4: Client-Side Temporal Merging Utilities
 *
 * Merges discrete CensorFrames (individual detection timestamps) into
 * continuous PlaybackSegments.  This prevents flickering when full-container
 * blur is toggled on and off for every single frame.
 */

import { CensorFrame, PlaybackSegment } from '@/types/censorship.types';

/**
 * Merge frames that are within MERGE_GAP_SECONDS of each other into one
 * continuous segment.  A 2-second post-event safety buffer is added to the
 * end of every segment so the blur stays visible slightly after the content
 * ends (avoids jarring instant-off transitions).
 */
const MERGE_GAP_SECONDS = 4;
const MIN_SEGMENT_DURATION = 1;
const POST_EVENT_BUFFER = 2;

/**
 * Converts an array of discrete detection frames into a sorted, merged list
 * of continuous playback segments ready to be consumed by the censorship hook.
 *
 * @param frames       Raw CensorFrame array from the VideoDto.
 * @param type         Content category ('violence' | 'nudity').
 * @returns            Merged, sorted PlaybackSegment array.
 */
export function computePlaybackSegments(
  frames: CensorFrame[] | null | undefined,
  type: 'violence' | 'nudity',
): PlaybackSegment[] {
  if (!frames || frames.length === 0) return [];

  // Sort by timestamp (backend may not guarantee order)
  const sorted = [...frames].sort((a, b) => a.timestamp - b.timestamp);

  const segments: PlaybackSegment[] = [];

  let current = {
    start: sorted[0].timestamp,
    end: sorted[0].timestamp,
    maxScore: Math.max(...sorted[0].boxes.map((b) => b.score)),
  };

  for (let i = 1; i < sorted.length; i++) {
    const frame = sorted[i];
    const frameMaxScore =
      frame.boxes.length > 0
        ? Math.max(...frame.boxes.map((b) => b.score))
        : 0;

    if (frame.timestamp - current.end <= MERGE_GAP_SECONDS) {
      // Extend the current open segment
      current.end = frame.timestamp;
      current.maxScore = Math.max(current.maxScore, frameMaxScore);
    } else {
      // Flush the current segment if it meets minimum duration
      if (current.end - current.start >= MIN_SEGMENT_DURATION) {
        segments.push({
          start: current.start,
          end: current.end + POST_EVENT_BUFFER,
          maxScore: current.maxScore,
          type,
        });
      }
      current = {
        start: frame.timestamp,
        end: frame.timestamp,
        maxScore: frameMaxScore,
      };
    }
  }

  // Flush the last open segment
  if (current.end - current.start >= MIN_SEGMENT_DURATION) {
    segments.push({
      start: current.start,
      end: current.end + POST_EVENT_BUFFER,
      maxScore: current.maxScore,
      type,
    });
  }

  return segments;
}

/**
 * Normalise the raw `violentSegments` / `nuditySegments` value received from
 * the API (`Record<string, any>` in the generated typings) into a typed
 * `CensorFrame[]` that the censorship hook can consume directly.
 *
 * The backend serialises these as a JSON array when frames exist, or as an
 * empty object / null when no detection was performed.
 */
export function normaliseCensorFrames(raw: unknown): CensorFrame[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw as CensorFrame[];
  }
  // Some backend versions may wrap it: { frames: CensorFrame[] }
  if (typeof raw === 'object' && 'frames' in (raw as object)) {
    const frames = (raw as { frames: unknown }).frames;
    if (Array.isArray(frames)) return frames as CensorFrame[];
  }
  return [];
}
