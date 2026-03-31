import { create } from "zustand";

interface UIState {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  backgroundColor: "#FAF8F5",
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
}));
