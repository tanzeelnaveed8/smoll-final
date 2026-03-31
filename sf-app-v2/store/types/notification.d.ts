import { Nullable, UploadedFile } from "../types";

export type NotificationListDto = {
  id: number;
  message: string;
  isRead: boolean;
  meta: {};
  createdAt: string;
}[];

export type NotificationDto = {
  data: {
    id: number;
    message: string;
    isRead: boolean;
    meta: {};
    createdAt: string;
  }[];
  count: number;
  currentPage: number;
  nextPage: number;
};

export interface NotificationState {
  notifications: Nullable<NotificationDto>;

  fetchNotifications: (page: number, limit: number) => Promise<NotificationDto>;
  readAllNotification: () => Promise<void>;
}
