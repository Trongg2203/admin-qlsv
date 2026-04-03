import { create } from "zustand";

interface LoadingState {
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  initLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,

  setLoading: (value: boolean) => {
    set({ isLoading: value });
  },

  initLoading: () => {
    set({ isLoading: true });

    setTimeout(() => {
      set({ isLoading: false });
    }, 3000);
  },
}));
