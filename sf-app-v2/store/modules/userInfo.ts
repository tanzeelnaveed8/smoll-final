import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserInfo } from "../types/user";

interface UserInfoState {
  userInfo: UserInfo | null;
  setUserInfo: (data: UserInfo) => void;
  clearUserInfo: () => void;
  loadUserInfo: () => Promise<void>;
  saveUserInfo: (data: UserInfo) => Promise<void>;
}

export const useUserInfoStore = create<UserInfoState>((set, get) => ({
  userInfo: null,

  setUserInfo: (data) => set({ userInfo: data }),

  clearUserInfo: () => set({ userInfo: null }),

  // Load userInfo from AsyncStorage
  loadUserInfo: async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("userInfo");

      if (storedUserInfo) {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        // console.log("Loaded userInfo from AsyncStorage:", parsedUserInfo);
        set({ userInfo: parsedUserInfo });
      }
    } catch (error) {
      console.error("Error loading userInfo from AsyncStorage:", error);
    }
  },

  // Save userInfo to AsyncStorage and update store
  saveUserInfo: async (data: UserInfo) => {
    try {
      await AsyncStorage.setItem("userInfo", JSON.stringify(data));
      set({ userInfo: data });
    } catch (error) {
      console.error("Error saving userInfo to AsyncStorage:", error);
    }
  },
}));