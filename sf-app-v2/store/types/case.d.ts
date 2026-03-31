import { Nullable } from "../types";
import { Expert } from "./expert";
import { UploadedFile } from "./file";
import { Pet, PetDetail } from "./pet";

export enum CaseStatusEnum {
  OPEN = "open",
  OPEN_ESCALATED = "openEscalated",
  CLOSED = "closed",
}

type CaseDataDto = {
  name: string;
  forwardBy: string;
  caseId: string;
  nuOfRequest: number;
};

type CaseRequestsDto = {
  title: string;
  id: string;
  rating: number;
  address: string;
};

type VetDoctorListDto = {
  name: string;
  speciality: string;
  experience: number;
  verified: boolean;
  nextAvailable: string;
};

interface CreateCasePayloadDto {
  petId: string;
  vetId: string;
  description: string;
  assets: UploadedFile[];
  status: CaseStatusEnum;
}

export interface Case {
  id: string;
  description: string;
  createdAt: string;
  assets: UploadedFile[];
  status: CaseStatusEnum;
}

export interface CaseListResponseDto {
  id: string;
  pet: {
    name: string;
    photos?: UploadedFile[];
  };
  vet: string;
  status: CaseStatusEnum;
  consultationId?: string;
  scheduledAt?: string;
  hasPartnerBooking?: boolean;
  requestCount?: number;
  createdAt: string;
  hasNewQuotation?: boolean;
}

export interface CaseDetail {
  id: string;
  description: string;
  createdAt: string;
  assets: UploadedFile[];
  vetNote: Nullable<string>;
  status: CaseStatusEnum;
  pet: PetDetail;
  assignedVet: Expert;
  scheduleAt?: string;
  isEmergency?: boolean;
  isDirectEscalated?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  receptionistName: string;
  phone: string;
  email: string;
  clinicImg: Nullable<UploadedFile>;
  address: Nullable<string>;
  country: Nullable<string>;
  city: Nullable<string>;
  openingHours: Nullable<string>;
  postalCode: Nullable<string>;
  timeZone: string;
  specialities: { id: string; name: string }[];
  createdAt: Date;
}

export interface ClinicServiceDto {
  id: string;
  name: string;
  price: number;
  description: string;
  currency: string;
  label: string;
  type: string;
}

export interface CaseQuotesDto {
  id: string;
  note: string;
  services: ClinicServiceDto[];
  partner: Clinic;
  isEmergency?: boolean;
  isDirectEscalated?: boolean;
  meta?: {
    scheduledAt: string;
    partnerVetId: string;
  };
  petName: string;
  isViewed?: boolean;
}

export interface CasesState {
  cases: Nullable<CaseListResponseDto[]>;
  escalatedCases: Nullable<CaseListResponseDto[]>;
  casesQuotes: Map<string, CaseQuotesDto[]>;
  caseRequests: CaseRequestsDto[];
  vetDoctorList: VetDoctorListDto[];

  createCase: (payload: CreateCasePayloadDto) => Promise<{ id: string }>;
  removeCase: (id: string) => Promise<void>;
  fetchCases: (
    page: number,
    reset?: boolean,
    isEscalated?: boolean
  ) => Promise<{
    nextPage: number;
    data: CaseListResponseDto[];
  }>;
  fetchCase: (id: string) => Promise<CaseDetail>;
  fetchCaseQuotes: (id: string) => Promise<CaseDetail>;
  fetchVetDoctors: () => Promise<void>;
}
