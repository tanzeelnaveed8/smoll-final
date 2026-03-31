import { ExpertAvailability } from "./expert";
import { UploadedFile } from "./file";

export interface PartnerVet {
  id: string;
  name: string;
  designation: string;
  yearsOfExperience: number;
  profileImg: UploadedFile;
  about?: string;
}

export interface ClinicDetails {
  id: string;
  name: string;
  receptionistName: string;
  phone: string;
  email: string;
  clinicImg: {
    filename: string;
    filesize: number;
    mimetype: string;
    url: string;
  };
  imgCollections: [
    {
      filename: string;
      filesize: number;
      mimetype: string;
      url: string;
    },
  ];
  address: string;
  country: string;
  city: string;
  openingHours: string;
  postalCode: string;
  timeZone: string;
  specialities: [
    {
      id: string;
      name: string;
    },
  ];
  vets: {
    designation: string;
    id: string;
    name: string;
    profileImg: { url: string };
    yearsOfExperience: number;
  }[];
  createdAt: "2024-12-15T03:19:13.782Z";
}

export interface PartnerVetDetails extends PartnerVet {
  availabilities: ExpertAvailability[];
  partnerName: string;
  partnerAddress: string;
}

interface Clinic {
  id: string;
  name: string;
  clinicImg: UploadedFile;
  openingHours: string;
  country: string;
  city: string;
  address: string;
  specialities: { id: string; name: string }[];
}

export interface State {
  partnerVets: Map<string, PartnerVet[]>;
  partnerVetDetails: Map<string, PartnerVetDetails>;
  clinics: Clinic[];
  clinicDetails: Map<string, ClinicDetails>;

  fetchPartnerVets: (partnerId: string) => Promise<void>;
  fetchClinics: (search?: string, city?: string) => Promise<void>;
  fetchClinicDetails: (id: string) => Promise<ClinicDetails>;

  fetchPartnerVetDetails: (id: string, partnerId: string) => Promise<PartnerVetDetails>;
  fetchPartnerVetAvailability: (
    id: string,
    partnerId: string,
    date?: Date
  ) => Promise<ExpertAvailability[]>;
  bookPartnerVet: (
    id: string,
    partnerId: string,
    caseId: string,
    date: string,
    services: { id: string; label: string }[],
    paymentIntentId?: string,
    bookingId?: string
  ) => Promise<{ id: string }>;

  emergencyBookPartner: (
    id: string,
    caseId: string,
    paymentIntentId: string,
    services: {
      id: string;
      label: string;
    }[]
  ) => Promise<{ id: string }>;
}
