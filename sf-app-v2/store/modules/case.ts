import { create } from "zustand";
import api from "@/utils/api";
import { CasesState } from "../types/case";

export const useCaseStore = create<CasesState>((set, get) => ({
  cases: null,
  escalatedCases: null,
  caseRequests: [],
  vetDoctorList: [],
  casesQuotes: new Map(),

  createCase: async (payload) => {
    const { petId, vetId, ...rest } = payload;

    const res = await api.post("/member/cases", rest, {
      params: {
        petId,
        vetId,
      },
    });

    return { id: res.data.id };
  },
  removeCase: async (id: string) => {
    await api.delete(`/member/cases/${id}`);
  },
  fetchCases: async (page, reset, isEscalated) => {
    const response = await api.get("/member/cases", {
      params: {
        page: page,
        limit: 1000,
        isEscalated,
      },
    });

    const existingCases = reset ? [] : get().cases || [];
    const data = response.data.data;

    if (isEscalated) {
      set(() => ({
        escalatedCases: existingCases.length > 0 ? [...existingCases, ...data] : data,
      }));
    } else {
      set(() => ({
        cases: existingCases.length > 0 ? [...existingCases, ...data] : data,
      }));
    }

    return response.data;
  },
  fetchCase: async (id) => {
    const response = await api.get(`/member/cases/${id}`);
    return response.data;
  },
  fetchCaseQuotes: async (id: string) => {
    const response = await api.get(`/member/cases/${id}/quotes`);

    set(() => ({
      casesQuotes: new Map([...get().casesQuotes, [id, response.data]]),
    }));

    return response.data;
  },
  fetchVetDoctors: async () => {
    const response = await api.get("/member/pets/breeds");

    // set(() => ({
    //   cases: response.data,
    // }));
  },
}));
