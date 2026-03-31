import { create } from "zustand";
import { HealthHistory, PetDetail, PetState } from "../types/pet";
import api from "@/utils/api";

export const usePetStore = create<PetState>((set, get) => ({
  petsDetailMap: new Map(),
  petBreeds: null,
  // healthHistoryMap: new Map(),
  pets: null,

  fetchPets: async (isDeceased?: boolean) => {
    const response = await api.get("/member/pets", {
      params: {
        isDeceased,
      },
    });

    set(() => ({
      pets: response.data,
    }));
    return response.data;
  },

  fetchPetBreeds: async () => {
    const response = await api.get("/member/pets/breeds");

    set(() => ({
      petBreeds: response.data,
    }));
  },

  addPet: async (payload) => {
    console.log("adding pet", payload);

    const response = await api.post("/member/pets", {
      ...payload,
      chipNumber: `${payload.chipNumber}`,
      dob: new Date(payload.dob).toISOString(),
    });

    const petMap = get().petsDetailMap.set(response.data.id, response.data);

    set(() => ({
      petsDetailMap: petMap,
    }));

    return response.data;
  },

  fetchPetDetails: async (id) => {
    const response = await api.get(`/member/pets/${id}`);

    const petMap = get().petsDetailMap.set(response.data.id, response.data);
    // const healthHistoryData = response.data.healthHistory;

    // const updatedHealthHistoryMap = get().healthHistoryMap.set(
    //   id,
    //   healthHistoryData
    // );

    set(() => ({
      petsDetailMap: petMap,
      // healthHistoryMap: updatedHealthHistoryMap,
    }));

    return response.data;
  },

  updatePet: async (id, payload) => {
    const response = await api.patch(`/member/pets/${id}`, {
      ...payload,
      chipNumber: `${payload.chipNumber}`,
      dob: payload.dob ? new Date(payload.dob).toISOString() : undefined,
    });
    const data = response.data;

    console.log("updated pet data", data);
    const existingHealthHistory = get().petsDetailMap.get(id)?.healthHistory;
    const existingBenefits = get().petsDetailMap.get(id)?.benefits;
    const existingSubscriptionDetails = get().petsDetailMap.get(id)?.subscriptionDetails;

    const updatedPetMap = get().petsDetailMap.set(id, {
      ...response.data,
      healthHistory: existingHealthHistory,
      benefits: existingBenefits,
      subscriptionDetails: existingSubscriptionDetails,
    });

    const updatedPets = get().pets?.map((pet) =>
      pet.id === id ? { ...pet, name: data.name, photos: data.photos } : pet
    );

    set(() => ({
      petsDetailMap: updatedPetMap,
      pets: updatedPets,
    }));

    return response.data;
  },

  addHealthHistory: async (petId, payload) => {
    const response = await api.post(`/member/pets/${petId}/health-history`, payload);

    console.log("addHealthHistory response", response);
    const petDetailData = get().petsDetailMap.get(petId) as PetDetail;
    if (!petDetailData) return;
    const petDetail = { ...petDetailData };

    if (petDetail?.healthHistory && petDetail?.healthHistory?.length > 0) {
      petDetail.healthHistory.push(response.data);
    } else if (petDetail) {
      petDetail.healthHistory = [response.data];
    }

    // const existingData = get().healthHistoryMap.get(petId);
    // let data;
    // if (existingData) {
    //   data = [response.data, ...existingData];
    // } else {
    //   data = [response.data];
    // }

    // const updatedHealthHistoryMap = get().healthHistoryMap.set(petId, data);
    const updatedPetDetailMap = get().petsDetailMap.set(petId, petDetail);

    set(() => ({
      // healthHistoryMap: updatedHealthHistoryMap,
      petsDetailMap: updatedPetDetailMap,
    }));

    return response.data;
  },

  updateHealthHistory: async (petId, healthHistoryId, payload) => {
    const response = await api.patch(
      `/member/pets/${petId}/health-history/${healthHistoryId}`,
      payload
    );

    const petDetail = get().petsDetailMap.get(petId) as PetDetail;

    const udpatedHealthHistory = petDetail.healthHistory?.map((item) => {
      if (item.id === healthHistoryId) {
        return response.data;
      } else {
        return item;
      }
    });

    console.log("udpatedHealthHistory", udpatedHealthHistory);

    const updatedPetDetailMap = get().petsDetailMap.set(petId, {
      ...petDetail,
      healthHistory: udpatedHealthHistory,
    });

    set(() => ({
      // healthHistoryMap: updatedHealthHistoryMap,
      petsDetailMap: updatedPetDetailMap,
    }));

    return response.data;
  },

  deleteHealthHistory: async (petId, healthHistoryId) => {
    const response = await api.delete(`/member/pets/${petId}/health-history/${healthHistoryId}`);

    const petDetail = get().petsDetailMap.get(petId) as PetDetail;
    const healthHistoryData = petDetail.healthHistory ? [...petDetail.healthHistory] : [];

    const udpatedHealthHistory = healthHistoryData?.filter(
      (item) => item.id?.toString() !== healthHistoryId.toString()
    );

    const updatedPetDetailMap = get().petsDetailMap.set(petId, {
      ...petDetail,
      healthHistory: udpatedHealthHistory,
    });

    console.log("updatedPetDetailMap", updatedPetDetailMap);

    set(() => ({
      // healthHistoryMap: updatedHealthHistoryMap,
      petsDetailMap: updatedPetDetailMap,
    }));

    return response.data;
  },

  deletePet: async (petId) => {
    const response = await api.delete(`/member/pets/${petId}`);

    const updatedPets = get().pets?.filter((pet) => pet.id !== petId);

    set(() => ({
      pets: updatedPets,
    }));
  },

  fetchBenefits: async (petId: string) => {
    const { data } = await api.get(`member/smollcare/benefits?petId=${petId}`);
    return {
      benefits: data.benefits.map(
        (benefit: { name: string; description: string; maxUsagePerSubscription: number }) => ({
          name: benefit.name,
          description: benefit.description,
          totalUsageCount: benefit.maxUsagePerSubscription,
        })
      ),
      price: data.price,
    };
  },
  buySubscription: async (petId: string, couponCode?: string) => {
    const { data } = await api.post(`/member/smollcare/subscribe/${petId}`, {
      coupon: couponCode,
    });


    return data;
  },
  activateSubscription: async (petId: string) => {
    await api.post(`/member/smollcare/activate/subscription/${petId}`);
    
  },

  cancelSubscription: async (petId: string) => {
    const res = await api.delete(`/member/smollcare/cancel/subscription/${petId}`);
    console.log(res);
  },

  validateCoupon: async (code: string) => {
    const response = await api.post("/member/smollcare/coupon/verify", {
      code: code.trim(),
    });
    return response.data;
  },
}));
