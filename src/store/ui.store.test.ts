import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui.store';

const initialUIState = useUIStore.getState();

describe('UI Store', () => {
  beforeEach(() => {
    useUIStore.setState(initialUIState, true);
  });

  it('should have initial state where both modals are false and container is null', () => {
    const state = useUIStore.getState();
    expect(state.loginModalOpen).toBe(false);
    expect(state.registerModalOpen).toBe(false);
    expect(state.modalContainer).toBeNull();
  });

  it('should set loginModalOpen to true after openLoginModal()', () => {
    useUIStore.getState().openLoginModal();
    expect(useUIStore.getState().loginModalOpen).toBe(true);
  });

  it('should set loginModalOpen to false after closeLoginModal()', () => {
    useUIStore.getState().openLoginModal();
    useUIStore.getState().closeLoginModal();
    expect(useUIStore.getState().loginModalOpen).toBe(false);
  });

  it('should set registerModalOpen to true after openRegisterModal()', () => {
    useUIStore.getState().openRegisterModal();
    expect(useUIStore.getState().registerModalOpen).toBe(true);
  });

  it('should set registerModalOpen to false after closeRegisterModal()', () => {
    useUIStore.getState().openRegisterModal();
    useUIStore.getState().closeRegisterModal();
    expect(useUIStore.getState().registerModalOpen).toBe(false);
  });

  it('should open register and close login when switchToRegister() is called', () => {
    useUIStore.getState().openLoginModal();
    useUIStore.getState().switchToRegister();
    expect(useUIStore.getState().loginModalOpen).toBe(false);
    expect(useUIStore.getState().registerModalOpen).toBe(true);
  });

  it('should open login and close register when switchToLogin() is called', () => {
    // Open register first so we have something to test closing
    useUIStore.getState().openRegisterModal();
    useUIStore.getState().switchToLogin();
    expect(useUIStore.getState().loginModalOpen).toBe(true);
    expect(useUIStore.getState().registerModalOpen).toBe(false);
  });

  it('should handle clearing modal container', () => {
    const el = document.createElement('div');
    useUIStore.getState().openLoginModal(el);
    expect(useUIStore.getState().modalContainer).toBe(el);
    useUIStore.getState().clearModalContainer();
    expect(useUIStore.getState().modalContainer).toBeNull();
  });
});
