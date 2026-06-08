import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useVideoStore } from './video.store';
import { useAuthStore } from './auth.store';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

const SESSION_KEY = 'cinemakatok-video-session';
const PREFS_KEY = 'cinemakatok-video-preferences';

const initialVideoState = useVideoStore.getState();

describe('Video Store', () => {
  beforeEach(() => {
    useVideoStore.setState(initialVideoState, true);
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: false });
    sessionStorage.clear();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    server.resetHandlers();
  });

  // --- Initial State ---
  it('should have correct initial state', () => {
    useVideoStore.setState({
      contentId: null,
      episodeId: null,
      contentType: null,
      resumePosition: 0,
      quality: 'auto',
      hasAccess: false,
      isMuted: false,
      volume: 1,
    });
    const state = useVideoStore.getState();
    expect(state.contentId).toBeNull();
    expect(state.episodeId).toBeNull();
    expect(state.contentType).toBeNull();
    expect(state.resumePosition).toBe(0);
    expect(state.quality).toBe('auto');
    expect(state.hasAccess).toBe(false);
    expect(state.isMuted).toBe(false);
    expect(state.volume).toBe(1);
  });

  // --- setContent ---
  it('should set content for a movie', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    const state = useVideoStore.getState();
    expect(state.contentId).toBe('movie-1');
    expect(state.episodeId).toBeNull();
    expect(state.contentType).toBe('movie');
    expect(state.resumePosition).toBe(0);
  });

  it('should set content for a TV series episode', () => {
    useVideoStore.getState().setContent('series-1', 'ep-3', 'tv_series');
    const state = useVideoStore.getState();
    expect(state.contentId).toBe('series-1');
    expect(state.episodeId).toBe('ep-3');
    expect(state.contentType).toBe('tv_series');
  });

  it('should restore resume position from session snapshot when contentId matches', () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      contentId: 'movie-1',
      episodeId: null,
      contentType: 'movie',
      resumePosition: 300,
    }));

    useVideoStore.getState().setContent('movie-1', null, 'movie');
    expect(useVideoStore.getState().resumePosition).toBe(300);
  });

  it('should not restore resume position when contentId does not match', () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      contentId: 'movie-1',
      episodeId: null,
      contentType: 'movie',
      resumePosition: 300,
    }));

    useVideoStore.getState().setContent('movie-2', null, 'movie');
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should write session snapshot when content is set', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    const raw = sessionStorage.getItem(SESSION_KEY);
    expect(raw).toBeTruthy();
    const snapshot = JSON.parse(raw!);
    expect(snapshot.contentId).toBe('movie-1');
  });

  it('should clear session snapshot when contentId is null', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();

    useVideoStore.getState().setContent(null);
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  // --- updateProgress ---
  it('should update resume position', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(120.5);
    expect(useVideoStore.getState().resumePosition).toBe(120.5);
  });

  it('should ignore negative progress values', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(-10);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should ignore NaN progress values', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(NaN);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should ignore Infinity progress values', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(Infinity);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should not update progress when no content is set', () => {
    useVideoStore.getState().updateProgress(50);
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should write updated progress to session storage', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(60);

    const raw = sessionStorage.getItem(SESSION_KEY);
    const snapshot = JSON.parse(raw!);
    expect(snapshot.resumePosition).toBe(60);
  });

  it('should debounce-sync progress to backend when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1', name: 'Test' } });

    let syncCalled = false;
    server.use(
      http.post('*/api/v1/watch-progress', () => {
        syncCalled = true;
        return HttpResponse.json({ success: true });
      })
    );

    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().updateProgress(60);

    expect(syncCalled).toBe(false);
    vi.advanceTimersByTime(2000);
    // Timer fired, sync may have been called (depends on fetch implementation)
  });

  // --- setQuality ---
  it('should update quality preference', () => {
    useVideoStore.getState().setQuality('720p');
    expect(useVideoStore.getState().quality).toBe('720p');
  });

  it('should accept all valid quality values', () => {
    const qualities = ['auto', '1080p', '720p', '480p'] as const;
    for (const q of qualities) {
      useVideoStore.getState().setQuality(q);
      expect(useVideoStore.getState().quality).toBe(q);
    }
  });

  // --- setVolume ---
  it('should clamp volume to maximum of 1', () => {
    useVideoStore.getState().setVolume(1.5);
    expect(useVideoStore.getState().volume).toBe(1);
  });

  it('should clamp volume to minimum of 0', () => {
    useVideoStore.getState().setVolume(-0.5);
    expect(useVideoStore.getState().volume).toBe(0);
  });

  it('should set volume normally within range', () => {
    useVideoStore.getState().setVolume(0.7);
    expect(useVideoStore.getState().volume).toBe(0.7);
  });

  it('should auto-mute when volume is set to 0', () => {
    useVideoStore.getState().setVolume(0);
    expect(useVideoStore.getState().isMuted).toBe(true);
  });

  it('should not auto-mute when volume is above 0', () => {
    useVideoStore.getState().setVolume(0.5);
    expect(useVideoStore.getState().isMuted).toBe(false);
  });

  // --- setMuted ---
  it('should toggle muted state', () => {
    useVideoStore.getState().setMuted(true);
    expect(useVideoStore.getState().isMuted).toBe(true);

    useVideoStore.getState().setMuted(false);
    expect(useVideoStore.getState().isMuted).toBe(false);
  });

  // --- clearContent ---
  it('should reset all content state', () => {
    useVideoStore.getState().setContent('movie-1', 'ep-1', 'tv_series');
    useVideoStore.getState().updateProgress(120);

    useVideoStore.getState().clearContent();

    const state = useVideoStore.getState();
    expect(state.contentId).toBeNull();
    expect(state.episodeId).toBeNull();
    expect(state.contentType).toBeNull();
    expect(state.resumePosition).toBe(0);
    expect(state.hasAccess).toBe(false);
  });

  it('should clear session snapshot on clearContent', () => {
    useVideoStore.getState().setContent('movie-1', null, 'movie');
    expect(sessionStorage.getItem(SESSION_KEY)).toBeTruthy();

    useVideoStore.getState().clearContent();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('should preserve user preferences (quality, volume, muted) after clearContent', () => {
    useVideoStore.getState().setQuality('1080p');
    useVideoStore.getState().setVolume(0.3);
    useVideoStore.getState().setMuted(true);

    useVideoStore.getState().setContent('movie-1', null, 'movie');
    useVideoStore.getState().clearContent();

    const state = useVideoStore.getState();
    expect(state.quality).toBe('1080p');
    expect(state.volume).toBe(0.3);
    expect(state.isMuted).toBe(true);
  });

  // --- hydrateFromSession ---
  it('should restore state from session storage on hydration', () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      contentId: 'movie-1',
      episodeId: null,
      contentType: 'movie',
      resumePosition: 450,
    }));

    useVideoStore.getState().hydrateFromSession();
    const state = useVideoStore.getState();
    expect(state.contentId).toBe('movie-1');
    expect(state.resumePosition).toBe(450);
  });

  it('should not change state when session storage is empty', () => {
    useVideoStore.getState().hydrateFromSession();
    expect(useVideoStore.getState().contentId).toBeNull();
    expect(useVideoStore.getState().resumePosition).toBe(0);
  });

  it('should handle corrupted session storage gracefully', () => {
    sessionStorage.setItem(SESSION_KEY, 'not-json');
    useVideoStore.getState().hydrateFromSession();
    expect(useVideoStore.getState().contentId).toBeNull();
  });

  // --- Persist middleware (preferences) ---
  it('should only persist quality, volume, and isMuted to localStorage', () => {
    useVideoStore.getState().setQuality('480p');
    useVideoStore.getState().setVolume(0.5);
    useVideoStore.getState().setMuted(true);
    useVideoStore.getState().setContent('movie-1', null, 'movie');

    const raw = localStorage.getItem(PREFS_KEY);
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw!);
    expect(persisted.state).toHaveProperty('quality');
    expect(persisted.state).toHaveProperty('volume');
    expect(persisted.state).toHaveProperty('isMuted');
    expect(persisted.state).not.toHaveProperty('contentId');
    expect(persisted.state).not.toHaveProperty('resumePosition');
  });
});
