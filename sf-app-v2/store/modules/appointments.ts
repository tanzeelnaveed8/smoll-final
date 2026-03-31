import { create } from "zustand";
import api from "@/utils/api";
import { CasesState } from "../types/case";
import { AppointmentListResponseDto, AppointmentState } from "../types/appointments";

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointment: null,
  appointmentDetails: new Map(),

  fetchAppointments: async (page: number, reset?: boolean) => {
    const response = await api.get("/members/appointments", {
      params: {
        page: page,
        limit: 20,
      },
    });

    const data = response.data.data;

    const updatedData = get().appointment || [];

    data.forEach((item: AppointmentListResponseDto) => {
      if (!updatedData.find((existing) => existing.id === item.id)) {
        updatedData.push(item);
      }
    });

    console.log("respon", response.data.data);

    set(() => ({
      appointment: reset ? response.data.data : updatedData,
    }));

    return response.data;
  },

  deleteAppointment: async (id: string) => {
    // const response = await api.delete(`/member/partners/appointments/${id}`);
    get().appointmentDetails.delete(id); // Delete the appointment by ID

    set(() => ({
      appointmentDetails: new Map(get().appointmentDetails), // Update state with the modified Map
    }));
  },

  fetchAppointmentDetail: async (id, type) => {
    const response = await api.get(`/members/appointments/${id}`, {
      params: {
        type: type,
      },
    });

    console.log("fetchAppointmentDetail", response.data);

    set(() => ({
      appointmentDetails: new Map([...get().appointmentDetails, [id, response.data]]),
    }));

    return response.data;
  },
  cancelAppointment: async (bookingId) => {
    await api.delete(`/member/partners/appointments/${bookingId}`);

    const updatedAppointments = get().appointment?.filter((item) => item.id !== bookingId);

    set(() => ({
      appointment: updatedAppointments,
    }));
  },

  cancelConsultation: async (id: string) => {
    await api.delete(`/member/vets/consultations/${id}`);

    const updatedAppointments = get().appointment?.filter((item) => item.id !== id);

    set(() => ({
      appointment: updatedAppointments,
    }));
  },

  rescheduleAppointment: async (appointmentId) => {
    await api.post(`/member/partners/appointments/${appointmentId}/reschedule`);
  },
}));

export const appointmentFormatedTime = (data: string) => {
  return new Date(data)
    .toLocaleString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
    .replace(/, \d{4}/, "");
};
