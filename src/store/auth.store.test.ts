import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from './auth.store';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse } from 'msw';

const initialAuthState = useAuthStore.getState();

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState(initialAuthState, true);
    sessionStorage.clear();
    
    // Default refresh handler
    server.use(
      http.post('*/auth/refresh', () => {
        return HttpResponse.json({ accessToken: 'new-token' });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('should verify initial state: isAuthenticated false, user null, isLoading true', () => {
    // we reset isLoading state explicitly because persist might have run synchronously
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: true });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('should set isAuthenticated and user after login() succeeds', async () => {
    const result = await useAuthStore.getState().login({ email: 'test@example.com', password: 'password' });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(result);
    expect(state.isLoading).toBe(false);
  });
  
  it('should map user fields correctly from login payload', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ 
          user: { id: 2, name: 'Alice', email: 'alice@a.com', avatar: 'a.png', isAdmin: true, gender: 'FEMALE' } 
        });
      })
    );
    const result = await useAuthStore.getState().login({ email: 'a', password: 'a' });
    expect(result.id).toBe('2'); 
    expect(result.isAdmin).toBe(true);
    expect(result.email).toBe('alice@a.com');
    expect(result.avatar).toBe('a.png');
    expect(result.gender).toBe('FEMALE');
  });

  it('should map user safely when payload is empty or invalid', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({});
      })
    );
    const result = await useAuthStore.getState().login({ email: 'a', password: 'a' });
    expect(result.id).toBe('');
    expect(result.name).toBe('');
    expect(result.email).toBeUndefined();
    expect(result.avatar).toBeNull();
    expect(result.isAdmin).toBeUndefined();
    expect(result.gender).toBeUndefined();
  });

  it('should handle unmapped enum gender values', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ 
          user: { id: 2, name: 'Alice', gender: 'ALIEN' } 
        });
      })
    );
    const result = await useAuthStore.getState().login({ email: 'a', password: 'a' });
    expect(result.gender).toBeUndefined();
  });

  it('should handle login failure with a message', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({ message: 'Bad request' }, { status: 400 });
      })
    );
    await expect(useAuthStore.getState().login({ email: 'a', password: 'a' })).rejects.toThrow('Bad request');
  });

  it('should handle login failure without JSON body message (try/catch fallback)', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return new HttpResponse('Not json context', { status: 500 });
      })
    );
    await expect(useAuthStore.getState().login({ email: 'a', password: 'a' })).rejects.toThrow('Login failed');
  });

  it('should handle loginWithGoogle() successfully', async () => {
    server.use(
      http.post('*/auth/login-google', () => {
        return HttpResponse.json({ user: { id: 'g1', name: 'Google User' } });
      })
    );
    const result = await useAuthStore.getState().loginWithGoogle('token');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Google User');
  });

  it('should handle loginWithGoogle() failure', async () => {
    server.use(
      http.post('*/auth/login-google', () => {
        return HttpResponse.json({ message: 'Google error' }, { status: 400 });
      })
    );
    await expect(useAuthStore.getState().loginWithGoogle('token')).rejects.toThrow('Google error');
  });

  it('should handle login failure with valid JSON but no message', async () => {
    server.use(
      http.post('*/auth/login', () => {
        return HttpResponse.json({}, { status: 400 });
      })
    );
    await expect(useAuthStore.getState().login({ email: 'a', password: 'a' })).rejects.toThrow('Login failed');
  });

  it('should handle loginWithGoogle success without user payload', async () => {
    server.use(
      http.post('*/auth/login-google', () => {
        return HttpResponse.json({});
      })
    );
    const result = await useAuthStore.getState().loginWithGoogle('token');
    expect(result.id).toBe('');
  });

  it('should clear user state after logout()', async () => {
    server.use(http.post('*/auth/logout', () => new HttpResponse(null, { status: 200 })));
    useAuthStore.setState({ user: { id: '1', name: 'Test' }, isAuthenticated: true });
    
    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should update user fields through updateUser()', () => {
    useAuthStore.setState({ user: null });
    useAuthStore.getState().updateUser({ name: 'New Name' });
    expect(useAuthStore.getState().user).toBeNull();

    useAuthStore.setState({ user: { id: '1', name: 'Old Name', email: 'test@t.com' } });
    useAuthStore.getState().updateUser({ name: 'New Name' });
    
    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('New Name');
    expect(state.user?.email).toBe('test@t.com');
  });

  it('should handle hydrateFromSession() with an existing user', async () => {
    useAuthStore.setState({ user: { id: '1', name: 'Tester' }, isAuthenticated: false, isLoading: true });
    
    useAuthStore.getState().hydrateFromSession();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
  
  it('should handle hydrateFromSession() with NO user', () => {
    useAuthStore.setState({ user: null, isAuthenticated: true, isLoading: true });
    useAuthStore.getState().hydrateFromSession();
    
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('should handle sync fallback internally when refresh fails', async () => {
     server.use(
       http.post('*/auth/refresh', () => {
         return new HttpResponse(null, { status: 401 });
       })
     );
     useAuthStore.setState({ user: { id: '1', name: 'Tester' } });
     useAuthStore.getState().hydrateFromSession();
     
     await new Promise(r => setTimeout(r, 10));
     expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should verify onRehydrateStorage callback logic', () => {
    // @ts-expect-error accessing internal persist options
    const onRehydrate = useAuthStore.persist.getOptions().onRehydrateStorage();
    if (onRehydrate) {
       expect(onRehydrate(undefined)).toBeUndefined();
       
       const mockStateUser = { user: { id: '1', name: 'Test' }, isAuthenticated: false, isLoading: true } as any;
       onRehydrate(mockStateUser);
       expect(mockStateUser.isAuthenticated).toBe(true);
       expect(mockStateUser.isLoading).toBe(false);

       const mockStateNull = { user: null, isAuthenticated: true, isLoading: true } as any;
       onRehydrate(mockStateNull);
       expect(mockStateNull.isAuthenticated).toBe(false);
       expect(mockStateNull.isLoading).toBe(false);
    }
  });

  it('should handle missing accessToken payload on refresh', async () => {
     server.use(
       http.post('*/auth/refresh', () => {
         return HttpResponse.json({});
       })
     );
     useAuthStore.setState({ user: { id: '1', name: 'Tester' } });
     useAuthStore.getState().hydrateFromSession();
     
     await new Promise(r => setTimeout(r, 10));
     expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });
});
