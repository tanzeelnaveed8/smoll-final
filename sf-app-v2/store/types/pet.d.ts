import { Nullable } from "../types";
import { UploadedFile } from "./file";

export enum PetGenderEnum {
  MALE = "male",
  FEMALE = "female",
}

export enum PetSpeciesEnum {
  DOG = "dog",
  CAT = "cat",
}

export interface Benefit {
  id: number;
  name: string;
  description?: string;
  totalUsageCount: number;
  consumedUsageCount: number;
  history: {
    partnerId: string;
    clinicName: string;
    note: string;
    createdAt: string;
    vet?: string;
  }[];
}

export type PetDetail = {
  id?: string;
  careId?: string | null;
  name: string;
  age: number;
  weight?: number;
  species: string;
  spayedOrNeutered: boolean;
  gender: PetGenderEnum;
  breed: string;
  dob: string;
  chipNumber: string;
  photos: UploadedFile[];
  healthHistory?: HealthHistory[];
  preExistingConditions: string;
  isDeceased?: boolean;
  benefits?: Benefit[];
  subscriptionDetails?: {
    startDate: string;
    endDate: string;
    status?: "Canceled" | "Active";
  } | null;
};

export interface Pet {
  id: string;
  careId?: string | null;
  name: string;
  photos: UploadedFile[];
  isDeceased?: boolean;
}

export interface GroupProfiles {
  id: string;
  name: string;

  profileImg: {
    filename: string;
    filesize: number;
    mimetype: string;
    url: string;
  };

  pets: {
    name: string;
    photos: {
      url: string;
      filename: string;
      filesize: number;
      mimetype: string;
    }[];
    profileImg: {
      filename: string;
      filesize: number;
      mimetype: string;
      url: string;
    };
  }[];
}
export type HealthHistory = {
  id?: string;
  name: string;
  description: string;
  date: string;
  documents: UploadedFile[];
};

export interface PetPayloadDto extends PetDetail {}
export interface PetBreeds {
  cats: string[];
  dogs: string[];
}

export interface PetState {
  pets: Nullable<Pet[]>;
  petsDetailMap: Map<string, Nullable<PetDetail>>;
  // healthHistoryMap: Map<string, HealthHistory[]>;
  petBreeds: Nullable<PetBreeds>;

  fetchPetBreeds: () => Promise<void>;
  fetchPets: (isDeceased?: boolean) => Promise<Pet[]>;
  fetchPetDetails: (id: string) => Promise<PetDetail>;
  addPet: (pet: PetPayloadDto) => Promise<PetDetail>;
  updatePet: (id: string, payload: Partial<PetDetail>) => Promise<PetDetail>;

  addHealthHistory: (petId: string, payload: HealthHistory) => Promise<HealthHistory>;
  updateHealthHistory: (
    petId: string,
    healthHistoryId: string,
    payload: HealthHistory
  ) => Promise<PetDetail>;

  deleteHealthHistory: (petId: string, healthHistoryId: string) => Promise<void>;

  deletePet: (petId: string) => Promise<void>;

  fetchBenefits: (petId: string) => Promise<{ benefits: Benefit[]; price: string } | null>;

  buySubscription: (
    petId: string,
    couponCode?: string
  ) => Promise<{
    paymentIntent: string | null;
    paymentIntentClientSecret: string | null;
    ephemeralKey: string | null;
    percentageOff: number | null;
  }>;

  activateSubscription: (petId: string) => Promise<void>;
  cancelSubscription: (petId: string) => Promise<void>;
  validateCoupon: (code: string) => Promise<{
    valid: boolean;
    discountPercentage?: number;
    reason?: string;
  }>;
}
