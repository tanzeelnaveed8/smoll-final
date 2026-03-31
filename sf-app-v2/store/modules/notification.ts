import { create } from "zustand";
import api from "@/utils/api";
import { NotificationState } from "../types/notification";
import { dummyNotificationList } from "@/constant/notificationDummyData";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: null,

  fetchNotifications: async (page: number, limit: number) => {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);

    const result = response.data;

    set(() => ({
      notifications: { ...response.data, data: result.data },
    }));

    return response.data;
  },

  readAllNotification: async () => {
    const response = await api.post(`/notifications/read-all`);

    set(() => ({
      notifications: null,
    }));
  },
}));
