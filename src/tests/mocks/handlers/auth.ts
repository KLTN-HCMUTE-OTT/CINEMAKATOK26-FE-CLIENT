import { http, HttpResponse } from 'msw';
import { mockUser } from '../data';

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = await request.json() as { email?: string; password?: string };

    if (!body.email || !body.password) {
      return HttpResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (body.email === 'banned@example.com') {
      return HttpResponse.json({ message: 'Account is banned' }, { status: 403 });
    }

    if (body.email === 'wrong@example.com') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({ user: mockUser, token: 'mock-access-token' });
  }),

  http.post('*/auth/login-google', async ({ request }) => {
    const body = await request.json() as { googleToken?: string };

    if (!body.googleToken) {
      return HttpResponse.json({ message: 'Google token required' }, { status: 400 });
    }

    return HttpResponse.json({ user: { ...mockUser, name: 'Google User' } });
  }),

  http.post('*/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.post('*/auth/refresh', () => {
    return HttpResponse.json({ accessToken: 'new-mock-token' });
  }),

  http.get('*/auth/profile', () => {
    return HttpResponse.json(mockUser);
  }),
];
