import { AxiosError } from "axios";
import { create } from "zustand";
import { AuthState } from "../types/auth";
import api from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OneSignal } from "react-native-onesignal";
import { useUserInfoStore } from "./userInfo";

export const useAuthStore = create<AuthState>((set) => ({
  
  async login(payload) {
    let exist = true;
    try {
    //  console.log("THISB IS PAYLOAD ------------>",payload)
      await api.post("/member/auth/login", payload);

    } catch (err) {
      const error = err as AxiosError;

      if (error.response?.status === 404) {
        exist = false;
      } else {
        throw err;
      }
    }

    if (!exist) {
      await api.post("/member/auth/register", payload);
      await api.post("/member/auth/login", payload);
    }
  },
  



  async verifyOtp(payload) {
    console.log("this is otp payload--->",payload)



    const res = await api.post("/member/auth/verify-otp", payload);

    console.log("response------------------000000000000",res?.data)
    const token = res?.data?.accessToken;
    console.log("token is here ---1111")
    const zegoToken = res?.data?.zegoToken;
    const envs = res?.data?.envs as Record<string, string>;
    // const subscription=res?.data?.subscription;
    // const organizationName=res?.data?.organization?.organizationName;
    // const smollVetAccessEndDate=res?.data?.organization?.smollVetAccessEndDate;
    // const smollVetAccessStartDate=res?.data?.organization?.smollVetAccessStartDate;
    console.log("token is here ---2222222222222222222222222",token)
    await AsyncStorage.setItem("accessToken", token);
    await AsyncStorage.setItem("zegoToken", zegoToken);
    await AsyncStorage.setItem("envs", JSON.stringify(envs));

    // await  AsyncStorage.setItem("subscription",subscription);
    // console.log("subscriotion->",res.data)

// ✅ Store in Zustand and AsyncStorage
  // const { saveUserInfo } = useUserInfoStore.getState();

  //  await saveUserInfo({
  //      // ✅ now declared
  // zegoToken,
  // subscription,
  // organizationName,
  // smollVetAccessEndDate,
  // smollVetAccessStartDate

  // });

console.log("after come eeeeeeeeeeeeeeeeeeeeeeeeeeeeee")

    if (envs?.ONESIGNAL_APP_ID) {
      OneSignal.initialize(envs.ONESIGNAL_APP_ID);
      const playerId = await OneSignal.User.pushSubscription.getIdAsync();
      if (playerId) {
        console.log("here ----------------", playerId)
      const aa=   await api.patch("/members/me", { playerId });
      console.log("me")

      console.log("here also come correct=================",aa)

      }
    }
  },
  
  async verifyNumberOtp(payload) {
    console.log("this is otp payload--->",payload)
    const res = await api.post("/members/verify-phone", payload);

    console.log("response------------------000000000000",res?.data)
   console.log("after come eeeeeeeeeeeeeeeeeeeeeeeeeeeeee")

  },
 




  async codelogin(payload:any) {
    console.log("this is otp payload--->",payload)
    


    const res = await api.post("/member/org-code/verify", payload);

    console.log("response---------------",res?.status) 






  },


  async deactivateAccount() {
    await api.post("/members/me/deactivate");
  },
}));
