"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface UIState {
  loginModalOpen: boolean;
  registerModalOpen: boolean;
  modalContainer: HTMLElement | null;
}

interface UIActions {
  openLoginModal: (container?: HTMLElement | null) => void;
  closeLoginModal: () => void;
  openRegisterModal: (container?: HTMLElement | null) => void;
  closeRegisterModal: () => void;
  switchToRegister: () => void;
  switchToLogin: () => void;
  clearModalContainer: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set) => ({
    loginModalOpen: false,
    registerModalOpen: false,
    modalContainer: null,

    openLoginModal: (container = null) =>
      set({ loginModalOpen: true, modalContainer: container }),
    closeLoginModal: () => set({ loginModalOpen: false }),

    openRegisterModal: (container = null) =>
      set({ registerModalOpen: true, modalContainer: container }),
    closeRegisterModal: () => set({ registerModalOpen: false }),

    switchToRegister: () =>
      set({ loginModalOpen: false, registerModalOpen: true }),
    switchToLogin: () =>
      set({ registerModalOpen: false, loginModalOpen: true }),

    clearModalContainer: () => set({ modalContainer: null }),
  })),
);
