import { Nullable } from "../types";
import { Expert } from "./expert";
import { UploadedFile } from "./file";
import { Pet, PetDetail } from "./pet";

export interface Service {
  id: string;
  name: string;
  label: string;
  price: number;
  description: string;
}

export interface AppointmentListResponseDto {
  id: string;
  scheduledAt: string;
  allServices: Service[];
  services: Service[];
  caseId: string;
  isEmergency?: boolean;
  partner: {
    id: string;
    name: string;
    email: string;
    phone: string;
    clinicImg: {
      filename: string;
      filesize: number;
      mimetype: string;
      url: string;
    };
    address: string;
    city: string;
    country: string;
  };
  vet: {
    id: string;
    name: string;
    designation: string;
    profileImg: {
      filename: string;
      filesize: number;
      mimetype: string;
      url: string;
    };
  };
  pet: {
    name: string;
  };
  type: "in-clinic" | "video";
}

export interface AppointmentDetailResponseDto extends AppointmentListResponseDto {
  paymentIntentId?: string;
  pet: {
    name: string;
    photos: UploadedFile[];
  };
}

export interface AppointmentState {
  appointment: Nullable<AppointmentListResponseDto[]>;
  appointmentDetails: Map<string, AppointmentDetailResponseDto>;

  fetchAppointments: (
    page: number,
    reset?: boolean
  ) => Promise<{ data: AppointmentListResponseDto[]; nextPage: number }>;
  fetchAppointmentDetail: (
    id: string,
    type: "in-clinic" | "video"
  ) => Promise<AppointmentDetailResponseDto>;
  deleteAppointment: (id: string) => Promise<void>;
  cancelAppointment: (bookingId: string) => Promise<void>;
  cancelConsultation: (id: string) => Promise<void>;

  rescheduleAppointment: (bookingId: string) => Promise<void>;
}
