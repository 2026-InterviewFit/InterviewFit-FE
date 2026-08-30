import { create } from 'zustand';

interface ModalState {
  isInterviewModalOpen: boolean;
  openInterviewModal: () => void;
  closeInterviewModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isInterviewModalOpen: false,
  openInterviewModal: () => set({ isInterviewModalOpen: true }),
  closeInterviewModal: () => set({ isInterviewModalOpen: false }),
}));