import { create } from "zustand";
import api from "@/utils/api";
import { State as PartnerState } from "../types/partner";

export const usePartnerStore = create<PartnerState>((set, get) => ({
  partnerVets: new Map(),
  partnerVetDetails: new Map(),
  clinics: [],
  clinicDetails: new Map(),

  fetchPartnerVets: async (partnerId) => {
    const response = await api.get(`/member/partners/${partnerId}/vets`);

    set({
      partnerVets: new Map([...get().partnerVets, [partnerId, response.data]]),
    });
  },
  fetchPartnerVetDetails: async (id, partnerId) => {
    const response = await api.get(`/member/partners/${partnerId}/vets/${id}`);

    set({
      partnerVetDetails: new Map([...get().partnerVetDetails, [id, response.data]]),
    });

    return response.data;
  },
  fetchPartnerVetAvailability: async (id, partnerId, date) => {
    const response = await api.get(`/member/partners/${partnerId}/vets/${id}/availabilities`, {
      params: {
        date,
      },
    });

    return response.data;
  },
  bookPartnerVet: async (id, partnerId, caseId, date, services, paymentIntentId, bookingId) => {
    const res = await api.post(`/member/partners/${partnerId}/vets/${id}/book`, {
      scheduleAt: date,
      caseId,
      services,
      paymentIntentId,
      bookingId,
    });
    

    return { id: res.data.id };
  },

  emergencyBookPartner: async (id, caseId, paymentIntentId, services) => {
    const res = await api.post(`/member/partners/${id}/emergency-book`, {
      scheduleAt: new Date().toISOString(),
      caseId,
      services,
      paymentIntentId,
    });

    return { id: res.data.id };
  },

  fetchClinics: async (search?: string, city?: string) => {
    const res = await api.get("/member/partners", {
      params: { search, city },
    });

    set({
      clinics: res?.data ?? [],
    });
  },

  fetchClinicDetails: async (id) => {
    const response = await api.get(`/member/partners/${id}`);

    set({
      clinicDetails: new Map([...get().clinicDetails, [id, response.data]]),
    });

    return response.data;
  },
}));
