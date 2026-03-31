import { NavigationProp } from "@react-navigation/native";

export type Nullable<T> = T | null;

export type NavigationType = NavigationProp<ReactNavigation.RootParamList> & {
  navigate: (screen: string, params?: object) => void;
};

export type PaymentPageRoute = {
  caseId: string;
  clinicName: string;
  selectedServices: { id: string; label: string; price: number }[];
  vetId: string;
  partnerId: string;
  partnerName: string;
  scheduleAt: string;
  paymentIntentId: string;
  isEmergency?: string;
  isDirectEscalated?: string;
};

export interface SendBirdExtendedBaseMessage {
  message: string;
  plainUrl: string;
  sender: {
    userId: string;
    nickname: string;
    profileUrl: string;
  };
}

export type TimeBtnType = "morning" | "noon" | "evening";

export type IntervalStateType = Record<
  TimeBtnType,
  {
    from: string;
    to: string;
  }[]
>;
