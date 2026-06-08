import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useVideoStore } from '@/store/video.store';

const initialAuthState = useAuthStore.getState();
const initialUIState = useUIStore.getState();
const initialVideoState = useVideoStore.getState();

export function resetAllStores() {
  useAuthStore.setState(initialAuthState, true);
  useUIStore.setState(initialUIState, true);
  useVideoStore.setState(initialVideoState, true);
}

export function resetAuthStore() {
  useAuthStore.setState(initialAuthState, true);
}

export function resetUIStore() {
  useUIStore.setState(initialUIState, true);
}

export function resetVideoStore() {
  useVideoStore.setState(initialVideoState, true);
}

export function setAuthenticatedUser(overrides?: Record<string, unknown>) {
  useAuthStore.setState({
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      ...overrides,
    },
  });
}
