import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe } from 'jest-axe';
import { LoginModal } from '@/components/login-modal';
import { useAuthStore } from '@/store';
import { server } from '@/tests/mocks/server';
import { http, HttpResponse, delay } from 'msw';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() })
}));

// Mock Google OAuth
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn().mockReturnValue(vi.fn())
}));

describe('LoginModal Component', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    // Keep JSDOM body clean
    document.body.innerHTML = '';
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<LoginModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('displays correct initial state when isOpen is true', async () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    // Uses Portal, so the modal is appended to document.body
    expect(await screen.findByRole('heading', { name: /Welcome Back!/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email or username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should have no accessibility violations', async () => {
    const { container } = render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('handles user interaction and calls auth store login', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    
    // Default success handler already defined in setup, but we mock it here again to be explicit
    server.use(
      http.post('*/auth/login', async () => {
        await delay(50);
        return HttpResponse.json({ user: { id: '1', name: 'Test' } });
      })
    );

    render(<LoginModal isOpen={true} onClose={handleClose} />);

    const emailInput = screen.getByPlaceholderText(/Email or username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'admin123');
    
    // Do not wait for click to finish resolving microtasks yet
    user.click(submitButton);

    expect(await screen.findByRole('button', { name: /Signing in.../i })).toBeInTheDocument();

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });
  
  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    const originalLogin = useAuthStore.getState().login;
    useAuthStore.setState({ 
      login: vi.fn().mockRejectedValue({
        response: { data: { message: 'Bad request' } }
      }) 
    });

    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    await user.type(screen.getByPlaceholderText(/Email or username/i), 'wrong@example.com');
    await user.type(screen.getByPlaceholderText(/Password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid email or/i)).toBeInTheDocument();
    
    // Restore
    useAuthStore.setState({ login: originalLogin });
  });
});
