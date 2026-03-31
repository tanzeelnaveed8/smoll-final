import { create } from "zustand";
import api from "@/utils/api";
import { UserState,User } from "../types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserInfoStore } from "./userInfo";

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  callId: null,
  navNotif: null,
  
  setUser: (user:User) => set({ user }),

  /** Mutations */
  SET_CALL_ID: (callId) => {
    set(() => ({
      callId: callId,
    }));
  },
  UPDATE_PET_COUNT: (increment: number = 1) => {
    const user = get().user;

    if (user) {
      set({
        user: {
          ...user,
          petCount: (user.petCount || 0) + increment,
        },
      });
    }
  },
  SET_NAV_NOTIF: (val: number | null) => {
    console.log(val, "SET NAV NOT VALUE");
    set(() => ({
      navNotif: val,
    }));
  },

  fetchEnvs: async () => {
    const res = await api.get("/envs");
    return res.data;
  },

  /** Actions */
  async findUser(skipErr) {
    const res = await api.get("/members/me" + (skipErr ? "?skiperr" : ""));
       
// console.log("thisb is data ->",res)
      
    const subscription=res?.data?.subscription?.type;
     const validUntil=res?.data?.subscription?.validUntil;
     const organizationName=res?.data?.subscription?.organizationName;
     const organizationProfileImg=res?.data?.subscription?.organizationProfileImg
    

       await  AsyncStorage.setItem("subscription",res?.data?.subscription?.type);
    console.log("subscriotion->",res?.data)

// ✅ Store in Zustand and AsyncStorage
  const { saveUserInfo } = useUserInfoStore.getState();

    const groupChat = res?.data?.subscription?.groupChat;
    // console.log("this is grouchat object-->", res?.data?.subscription);

  
   await saveUserInfo({
       // ✅ now declared
 
  subscription,
validUntil,
  organizationName,
  id: groupChat?.id,
  loginMethod: groupChat?.loginMethod,
  isEnabled: groupChat?.isEnabled,
  organizationProfileImg
  
  
  


  });


    set(() => ({
      user: res.data,
    }));

    return res.data;
  },

  async updateUser(payload) {
    console.log("come here with payload -->",payload)
    const res = await api.patch(`/members/me`, payload);
     console.log("after sucress this -->",res?.data)
    set(() => ({
      user: res.data,
    }));

    return res.data;
  },

  async sendVerificationEmail() {
    await api.post("/members/send-email-verification");
  },
  async sendVerificationPhone() {
      console.log("this is -->")
      try{
      
await api.post("/members/send-phone-verification");
      }catch(e:any){
console.log("eeeeeeeeeeeeeeeeeeeeeeeeee",e)
      }
    
  },


  async verifyEmail(otp: string) {
  const aa =   await api.post("/members/verify-email", { otp });

    const user = get().user;

    if (!user) return;

    set(() => ({
      user: {
        ...user,
        isEmailVerified: true,
      },
    }));
  },

  async createPaymentIntent(customerId, price, currency) {
    const res = await api.post("/member/stripe/create-payment-session", {
      customerId,
      price,
      currency,
    });

    return res.data;
  },

  async readQuotation(caseId: string, quotationId: string) {
    await api.patch(`/member/cases/${caseId}/quotes/${quotationId}/read`);
  },

  async clearPopupNotification(type: "emergency" | "appointment" | "quotation") {
    await api.post("/members/me/clear-popups", { type });
  },
}));
