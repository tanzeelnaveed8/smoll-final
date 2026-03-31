import { create } from "zustand";
import api from "@/utils/api";
import { CounsellorState } from "../types/counsellor";

export const useCounsellorStore = create<CounsellorState>((set, get) => ({
  sessions: null,

  fetchSessions: async () => {
    const response = await api.get("/member/counsellors/sessions", {
      params: {
        status: "accepted",
      },
    });

    set(() => ({ sessions: response.data }));
    return response.data;
  },
  requestSession: async () => {
    const response = await api.post("/member/counsellors/request-session");
    return response.data;
  },
}));
