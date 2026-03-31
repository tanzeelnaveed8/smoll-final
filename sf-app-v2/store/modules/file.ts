import { create } from "zustand";
import { FileState } from "../types/file";
import api from "@/utils/api";

export const useFileStore = create<FileState>((set, get) => ({
  uploadFile: async (files) => {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post("/files", formData, {
      headers: { "content-type": "multipart/form-data" },
    });

    return response.data;
  },
}));
