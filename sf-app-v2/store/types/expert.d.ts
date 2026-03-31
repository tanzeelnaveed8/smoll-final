import { IMessage } from "react-native-gifted-chat";
import { Nullable } from "../types";
import { Case } from "./case";
import { UploadedFile } from "./file";

export enum ConsultationStatusEnum {
  INITIATED = "initiated",
  IN_REVIEW = "in_review",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

interface Expert {
  id: string;
  name: string;
  phone: string;
  designation: string;
  address: string;
  country: string;
  about?: string;
  verified?: boolean;
  //   availability: {};
  byAppointmentOnly: boolean;
  isOnline: boolean;
  yearsOfExperience: Nullable<number>;
  profileImg: Nullable<UploadedFile>;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpertAvailability {
  id: string;
  dayOfWeek: string;
  date: string;
  intervals: { from: string; to: string }[];
}

interface RateExpertPayloadDto {
  id: string;
  caseId: string;
  rating: number;
  comment?: string;
}

interface FilterDetails {
  id: string;
  name: string;
}

// Response
export interface FindOneConsultationResDto {
  id: string;
  createdAt: string;
  status: ConsultationStatusEnum;
  case: Case;
  vet: Expert;
}

interface ExpertState {
  expertDetailMap: Map<string, Expert>;
  experts: Nullable<Expert[]>;
  expertFilter: Nullable<FilterDetails[]>;
  unreadMessages: Map<string, number>;
  conversations: Map<string, IMessage[]>;
  activeConvo: string | null;

  fetchExperts: () => Promise<Expert[]>;
  fetchExpertsBySpeciality: (params?: {
    specialityId?: string;
    online?: boolean;
  }) => Promise<Expert[]>;
  fetchExpertDetail: (id: string) => Promise<void>;
  updateExpertStatus: (id: string, status: boolean) => void;
  fetchExpertAvailability: (id: string, date?: Date) => Promise<ExpertAvailability[]>;
  findOneConsultation: (id: string) => Promise<FindOneConsultationResDto>;
  requestConsultation: (vetId: string, petId: string) => Promise<{ id: string }>;
  scheduleConsultation: (
    id: string,
    payload: {
      caseId: string;
      petId: string;
      scheduleAt: string;
    }
  ) => Promise<{ id: string }>;
  updateConsultation: (payload: { id: string; caseId: string }) => Promise<void>;
  rateExpert: (payload: RateExpertPayloadDto) => Promise<void>;
  getUnreadMessage: () => Promise<void>;
  setUnreadMessage: (value: Map<string, number>) => void;
  setConversations: (value: Map<string, IMessage[]>) => void;
  setActiveConvo: (value: string | null) => void;
  fetchExpertFilter: () => Promise<FilterDetails[]>;
  setExpertFilter: (value: any[]) => void;
}
