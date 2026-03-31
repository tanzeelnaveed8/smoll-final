import { create } from "zustand";

interface NotificationStore {
  count: number;
  reset: () => void;
  setCount: (val: number) => void;
}

export const useGroupNotificationStore = create<NotificationStore>((set) => ({
  count: 0,

  reset: () => set({ count: 0 }),

  setCount: (val: number) =>{ 
     console.log("🟩 Zustand setCount CALLED with:", val);  // <-- CHECK HERE
    
    set({ count: val })},
}));