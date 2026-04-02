import {
  ActivityIndicator,
  Dimensions,
  Platform,

  StatusBar,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Badge, Div, ThemeProvider } from "react-native-magnus";

import * as Font from "expo-font";
import React, { useCallback, useEffect, useState } from "react";
import { fontHauora, fontHauoraSemiBold } from "./constant/constant";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AccountSetupAddressScreen from "./screens/AccountSetup/AccountSetupAddressScreen";
import AccountSetupEmailOtpScreen from "./screens/AccountSetup/AccountSetupEmailOtpScreen";
import AccountSetupEmailScreen from "./screens/AccountSetup/AccountSetupEmailScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

import { ToastProvider } from "react-native-toast-notifications";
import CounsellingChatScreen from "./screens/Counselling/CounsellingChatScreen";
import CounsellingInboxScreen from "./screens/Counselling/CounsellingInboxScreen";
import CounsellingRequestScreen from "./screens/Counselling/CounsellingRequestScreen";
import HomeScreen from "./screens/HomeScreen";
import { SocketProvider } from "./socket/provider";

import PartnerVetConfirmationScreen from "./screens/Cases/PartnerVetConfirmationScreen";
import PartnerVetDetailScreen from "./screens/Cases/PartnerVetDetailScreen";
import PartnerVetScreen from "./screens/Cases/PartnerVetScreen";
import PartnerVetSuccessfullScreen from "./screens/Cases/PartnerVetSuccessfullScreen";
import ConsultationCaseBriefScreen from "./screens/Consultation/ConsultationCaseBriefScreen";
import ConsultationFeedbackScreen from "./screens/Consultation/ConsultationFeedbackScreen";
import ConsultationVideoScreen from "./screens/Consultation/ConsultationVideoScreen";
import ConsultationWaitingScreen from "./screens/Consultation/ConsultationWaitingScreen";
import ExpertsChatScreen from "./screens/Experts/ExpertsChatScreen";
import ExpertsInboxScreen from "./screens/Experts/ExpertsInboxScreen";
import ExpertsListDetailScreen from "./screens/Experts/ExpertsListDetailScreen";
import ExpertsListScreen from "./screens/Experts/ExpertsListScreen";
// import PetProfileCongratulationsScreen from "./screens/PetProfile/PetProfileCongratulationsScreen";
import PetProfileCongratulationsScreen from "./screens/PetProfile/PetProfileCongratulationsScreen";
import PetProfileMedicalHistoryScreen from "./screens/PetProfile/PetProfileMedicalHistoryScreen";
import PetProfileScreen from "./screens/PetProfile/PetProfileScreen";

import SlotBookingScreen from "./screens/doctorsScreens/SlotBookingScreen";
import EditInfoScreen from "./screens/settings/EditInfoScreen";
import PetEditInfoScreen from "./screens/settings/PetEditInfoScreen";
import PetProfileDetailsScreen from "./screens/settings/PetProfileDetailsScreen";
import PetProfileListScreen from "./screens/settings/PetProfileListScreen";
import SettingPersonalInfoScreen from "./screens/settings/SettingPersonalInfoScreen";
import SettingsMainScreen from "./screens/settings/SettingsMainScreen";
import { useUserStore } from "./store/modules/user";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import FlashMessage from "react-native-flash-message";
import { OneSignal } from "react-native-onesignal";
// import OneSignal from "react-native-onesignal";
import CaseDetailScreen from "./screens/Cases/CaseDetailScreen";
import RequestCallBackScreen from "./screens/Consultation/UnavailableScreen";
import ExpertsScheduleConfirmationScreen from "./screens/Experts/ExpertsScheduleConfirmationScreen";
import ExpertsScheduleSuccessScreen from "./screens/Experts/ExpertsScheduleSuccessScreen";
import SplashScreen from "./screens/SplashScreen";
import * as rootNavigation from "./utils/root-navigation";
import { navigationRef } from "./utils/root-navigation";

import { useUIStore } from "@/store/modules/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import * as Sentry from "@sentry/react-native";
import { IconMessage, IconWindow, IconMessages, IconMessageCircle } from "@tabler/icons-react-native";
import Config from "react-native-config";
import { SafeAreaProvider,  SafeAreaView } from "react-native-safe-area-context";
import { ZIMEventHandler } from "zego-zim-react-native";
import Popup from "./components/Popup";
import SocketListener from "./components/SocketListener";
import OnboardingUserModal from "./components/app/onboarding/OnboardingUserModal";
import SignupScreen from "./components/app/onboarding/SignupScreen";
import { useSound } from "./functions/useSound";
import AppointmentDetailsScreen from "./screens/Appointments/AppointmentDetailsScreen";
import AppointmentsScreen from "./screens/Appointments/AppointmentsScreen";
import CaseQuoteDescriptionScreen from "./screens/Cases/CaseQuoteDescriptionScreen";
import CaseQuotesScreen from "./screens/Cases/CaseQuotesScreen";
import CasesQuotesListScreen from "./screens/Cases/CasesQuotesListScreen";
import PaymentDetailsScreen from "./screens/Cases/PaymentDetailsScreen";
import ClinicDetailScreen from "./screens/Clinic/ClinicDetailScreen";
import ClinicListScreen from "./screens/Clinic/ClinicListScreen";
import HomeServicesScreen from "./screens/HomeServices/HomeServicesScreen";
import ServiceDetailsScreen from "./screens/HomeServices/ServiceDetailsScreen";
import SelectDateTimeScreen from "./screens/HomeServices/SelectDateTimeScreen";
import YourCartScreen from "./screens/HomeServices/YourCartScreen";
import CheckoutScreen from "./screens/HomeServices/CheckoutScreen";
import ProductDetailsScreen from "./screens/Nutritions/ProductDetailsScreen";
import RecentOrdersScreen from "./screens/Orders/RecentOrdersScreen";
import OrderDetailScreen from "./screens/Orders/OrderDetailScreen";
import UnavailableScreen from "./screens/Consultation/UnavailableScreen";
import EmergencyScreen from "./screens/EmergencyScreen";
import NewOnboardingScreen from "./screens/NewOnboardingScreen";
import NotificationScreen from "./screens/NotificationScreen";
import PetProfileBenefitsScreen from "./screens/PetProfile/PetProfileBenefitsScreen";
import PetProfileSmollcarePaymentScreen from "./screens/PetProfile/PetProfileSmollcarePaymentScreen";
import SubscriptionScreen from "./screens/Subscription/SubscriptionScreen";
import SmollcarePaymentSuccessScreen from "./screens/smollcarePaymentSuccess/SmollcarePaymentSuccessScreen";
import { useExpertStore } from "./store/modules/expert";
import { initializeChat, zim } from "./utils/chat.v2";
import { transformMessages } from "./utils/helpers";
import ImmersiveMode from "react-native-immersive-mode";
import Welcome from "./screens/Welcome";
import CodeVerification from "./components/app/onboarding/CodeVerification";
import PhoneVerificationScreen from "./screens/PhoneVerificationScreen";
import Groupchat from "./components/app/chat/Groupchat";
import GroupchatIcon from "./components/icons/groupchatIcon";
import IndexIcon from "./components/icons/IndexIcon";
import { useUserInfoStore } from "./store/modules/userInfo";
import GroupProfile from "./screens/PetProfile/GroupProfile";
import { useGroupNotificationStore } from "./store/modules/groupNotification";
// const unreadCount = useGroupNotificationStore((state) => state.count);



Sentry.init({
  dsn: Config.SENTRY_DSN,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

async function loadFonts() {
  await Font.loadAsync({
    Hauora: require("./assets/fonts/Hauora//Hauora-Regular.ttf"),
    HauoraMedium: require("./assets/fonts/Hauora/Hauora-Medium.ttf"),
    HauoraSemiBold: require("./assets/fonts/Hauora/Hauora-SemiBold.ttf"),
    HauoraBold: require("./assets/fonts/Hauora/Hauora-Bold.ttf"),

    Cooper: require("./assets/fonts/Cooper/CooperLtBT-Regular.ttf"),
    CooperMedium: require("./assets/fonts/Cooper/CooperMdBT-Regular.ttf"),
    CooperBold: require("./assets/fonts/Cooper/CooperBlkBT-Regular.ttf"),
  });
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const BASE_FONT_SCALE = SCREEN_WIDTH < 350 ? 0.85 : 1; // Reduce base font size by 15% on small screens

const BASE_FONT_SCALE =
  SCREEN_WIDTH < 320
    ? 0.72 // Very small screens (iPhone SE 1st gen)
    : SCREEN_WIDTH < 350
      ? 0.75 // Small screens
      : SCREEN_WIDTH < 375
        ? 0.85 // Medium screens
        : 1;

// Create a utility function to scale fonts
export const scaleFontSize = (size: number): number => {
  return Math.round(size * BASE_FONT_SCALE);
};

const theme = {
  fontSize: {
    // "5xl": 28,
    // "2xl": 20,
    // xl: 18,
    // lg: 16,
    // md: 14,
    "8xl": scaleFontSize(54),
    "7xl": scaleFontSize(34),
    "6xl": scaleFontSize(32),
    "5xl": scaleFontSize(28),
    "4xl": scaleFontSize(24),
    "2xl": scaleFontSize(20),
    xl: scaleFontSize(18),
    lg: scaleFontSize(16),
    md: scaleFontSize(14),
    sm: scaleFontSize(12),
    xs: scaleFontSize(11),
  },
  colors: {
    primary: "#679FF0",
    primaryLight: "#518cb0",
    bgColor: "#FAF8F5",
    darkGreyText: "#494949",
  },
  components: {
    Text: {
      fontFamily: fontHauora,
      color: "#222",
    },
    Input: {
      fontFamily: fontHauora,
    },
    Button: {
      fontFamily: fontHauora,
    },
  },
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const [allUnreadMessageCount, setAllUnreadMessageCount] = useState(0);
  const [unreadgroupmessage, setUnreadgroupmessage] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const { unreadMessages } = useExpertStore();
  const { navNotif, user } = useUserStore();

  const userInfo = useUserInfoStore((state) => state.userInfo);
  // const unreadCount = useGroupNotificationStore.getState().count;
  const unreadCount = useGroupNotificationStore((state) => state.count);


  // console.log("this is unread in my appp---->>>>>>>>>", unreadCount)
  useEffect(() => {
    let countMessage = 0;
    Array.from(unreadMessages.values()).forEach((count) => (countMessage += count));
    setAllUnreadMessageCount(countMessage);
  }, [unreadMessages.values()]);



  useEffect(() => {
    if (!user?.name) setShowNameModal(true);
  }, []);

  useEffect(() => {
    console.log("Updated unread count:", unreadCount);
    setUnreadgroupmessage(unreadCount);
  }, [unreadCount]);


  const TabButton: React.FC<{
    focused: boolean;
    icon: React.ReactNode;
    isNotification?: Boolean;
  }> = ({ focused, icon, isNotification }) => {
    const styles: { container: ViewStyle } = {
      container: {
        borderBottomRightRadius: 4,
        borderBottomLeftRadius: 4,
        position: "relative",
      },
    };

    return (
      <Div position= "relative" justifyContent = "center" alignItems = "center" >
        <Div h={ 4 } bg = { focused? "#000": "transparent" } w = { 60} mb = { 2} style = { styles.container } />
          { icon }
    {
      isNotification && (
        <Div position="absolute" top = { 4} right = { 6} >
          <Badge bg="#f52c11" position = "absolute" />
            </Div>
        )}
</Div>
    );
  };
let ischatenalble = userInfo?.isEnabled
// let ischatenalble =true
// console.log("this is enable or not -->",ischatenalble)
return (
  <>
  <Tab.Navigator
        screenOptions= {{
  tabBarStyle: {
    height: 62,
      paddingBottom: 8,
        paddingTop: 2,
          backgroundColor: "#FAF8F5",
            paddingHorizontal: 48,
          },
  tabBarLabelStyle: {
    fontSize: 14,
      fontFamily: fontHauoraSemiBold,
          },
  tabBarInactiveTintColor: "#494949",
    tabBarActiveTintColor: "#222",
        }}
      >
  <Tab.Screen
          name="Home"
component = { HomeScreen }
options = {{
  headerShown: false,
    tabBarIcon: ({ focused }) => (
      <TabButton
                focused= { focused }
  icon = {< IconWindow width = { 24} height = { 24} color = { focused? "#000": "#494949" } />}
/>
            ),
          }}
/>
{

  ischatenalble ?
    <Tab.Screen
          name="Chat"
  component = {Groupchat}
  options = {{
    headerShown: false,
      tabBarIcon: ({ focused }) => (
        <TabButton
                focused= { focused }
    // icon={<IconMessages width={24} height={24} color={focused ? "#000" : "#494949"} />}
    icon = {< GroupchatIcon width = { 24} height = { 24}  color = { focused? "#000": "#494949" } />}
  isNotification = { Boolean(unreadgroupmessage) }

    />
            ),
}}
/>

       : <Tab.Screen
          name="Inbox"
component = { ExpertsInboxScreen }
options = {{
  headerShown: false,
    tabBarIcon: ({ focused }) => (
      <TabButton
                focused= { focused }
  // icon={<IconMessage width={24} height={24} color={focused ? "#000" : "#494949"} />}
  icon = { < IndexIcon focused = { focused? "#000": "#494949" } height = { 24} width = { 24} />}
isNotification = { Boolean(allUnreadMessageCount) }
  />
            ),
          }}
/>
}

</Tab.Navigator>
  < OnboardingUserModal isVisible = { true} onSuccess = {() => setShowNameModal(false)} />
    </>
  );
};

const App = () => {

  const { user } = useUserStore();

  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { backgroundColor } = useUIStore();
  const [envs, setEnvs] = useState<{
    ONESIGNAL_APP_ID: string;
    STRIPE_PUBLISHABLE_KEY: string;
    ZEGO_APP_ID: string;
    ZEGO_APP_SIGN: string;
    ZEGO_SERVER_SECRET: string;
  } | null>(null);

  const {
    getUnreadMessage,
    fetchExperts,
    conversations,
    setConversations,
    activeConvo,
    setUnreadMessage,
    unreadMessages,
  } = useExpertStore();
  const { play } = useSound();
  const { SET_NAV_NOTIF } = useUserStore();

  useEffect(() => {
    (async () => {
      loadFonts().then(() => setFontsLoaded(true));

      if (Platform.OS === "ios") {
        PushNotificationIOS.requestPermissions({
          alert: true,
          badge: false,
          sound: false,
          critical: true,
        });
      }

      // Ensure OneSignal is initialized before adding event listeners
      if (envs) {
        OneSignal.Notifications.requestPermission(true);
        OneSignal.User.pushSubscription.optIn();

        OneSignal.Notifications.addEventListener("click", async (event) => {
          const additionalData = event.notification?.additionalData as {
            notificationType?: string;
            consultationId?: string;
            caseId?: string;
            vetId?: string;
            petName?: string;
            partnerId?: string;
            partnerBookingId?: string;
            expertId?: string;
            expertName?: string;
          };

          if (additionalData?.notificationType === "consultation-notification") {
            rootNavigation.navigate("AppointmentDetailsScreen", {
              id: additionalData.consultationId,
              type: "video",
            });
          }

          if (
            additionalData?.notificationType === "quote-submitted" ||
            additionalData?.notificationType === "quote-updated"
          ) {
            const caseId = additionalData.caseId;
            const partnerId = additionalData.partnerId;

            rootNavigation.navigate("CaseQuoteDescriptionScreen", {
              caseId,
              id: partnerId,
            });
          }

          if (additionalData?.notificationType === "partner-booking-notification") {
            const partnerBookingId = additionalData.partnerBookingId;

            rootNavigation.navigate("AppointmentDetailsScreen", {
              id: partnerBookingId,
              type: "in-clinic",
            });
          }

          if (additionalData?.notificationType === "chat") {
            rootNavigation.navigate("ExpertsChatScreen", {
              expertId: additionalData.expertId,
              expertName: additionalData.expertName,
            });
          }

          if (additionalData?.notificationType === "vet-consultation-reminder") {
            rootNavigation.navigate("ConsultationWaitingScreen", {
              consultationId: additionalData.consultationId,
              petName: additionalData.petName,
            });
          }
        });

        // Method for listening for notifications received
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", async (event) => {
          const additionalData = event.notification?.additionalData as {
            expertId?: string;
            notificationType?: string;
          };
          const expertId = (rootNavigation.getCurrentRoute()?.params as Record<string, string>)
            ?.expertId;

          if (
            rootNavigation.getCurrentRoute()?.name === "ExpertsChatScreen" &&
            additionalData?.expertId === expertId &&
            additionalData.notificationType === "chat"
          ) {
            return;
          }

          event.notification.display();
        });
      }

      // ImmersiveMode.setBarMode("BottomSticky");
      // ImmersiveMode.fullLayout(false);
      if (Platform.OS === "android") {
  ImmersiveMode.setBarMode("Normal");  
}
    })();

    return () => {
      OneSignal.Notifications.removeEventListener("click", () => { });
      OneSignal.Notifications.removeEventListener("foregroundWillDisplay", () => { });
      PushNotificationIOS.removeEventListener("register");
      PushNotificationIOS.removeEventListener("notification");
    };
  }, [envs]);

  useEffect(() => {
    (async () => {
      if (user && user.name) {
        Sentry.setUser({
          id: user.id,
          name: user.name,
          email: `${user.email}`,
        });

        const storedEnvs = await AsyncStorage.getItem("envs");

        if (storedEnvs) {
          const parsedEnvs = JSON.parse(storedEnvs);
          setEnvs(parsedEnvs);

          try {
            // Ensure OneSignal is initialized before any other OneSignal methods
            // OneSignal.initialize(parsedEnvs?.ONESIGNAL_APP_ID as string);
            // 1. Initialize OneSignal first
            OneSignal.initialize(parsedEnvs?.ONESIGNAL_APP_ID as string);

            // 2. Login user if you have a playerId
            if (user.playerId) {
              OneSignal.login(user.playerId);
            }

            // 3. Then request permission + opt-in
            OneSignal.Notifications.requestPermission(true);
            OneSignal.User.pushSubscription.optIn();
          } catch (err) {
            console.log("One signal Initialization issue", err);
          }

          // if (user.playerId) {
          //   OneSignal.login(user.playerId);
          // }

          const experts = await fetchExperts();

          await initializeChat(
            parsedEnvs?.ZEGO_APP_ID as string,
            parsedEnvs?.ZEGO_APP_SIGN as string,
            user.id,
            user.playerId,
            user.name,
            user?.profileImg?.url ?? ""
          );

          await getUnreadMessage();

          const eventHandler: Partial<ZIMEventHandler> = {
            receivePeerMessage: async (zim, { messageList, fromConversationID }) => {
              console.log("zim", activeConvo);
              const convoName = experts?.find((exp) => exp.id === fromConversationID)
                ?.name as string;
              const transformedMessages = transformMessages(messageList, {
                recipientId: fromConversationID,
                chatWithName: convoName,
              });

              const updatedConversations = conversations;

              const prevMessages = conversations.get(fromConversationID) || [];
              updatedConversations.set(fromConversationID, [
                ...transformedMessages,
                ...prevMessages,
              ]);
              setConversations(updatedConversations);

              const updatedUnreadMessages = unreadMessages;
              //IF fromConversation user is same as active user then clear unread message

              if (activeConvo === fromConversationID) {
                updatedUnreadMessages.delete(fromConversationID);
              } else {
                //Handling unread message count
                const count = unreadMessages.get(fromConversationID) || 0;
                updatedUnreadMessages.set(fromConversationID, count + 1);
              }

              setUnreadMessage(updatedUnreadMessages);

              // play("messageReceived"); MOVE IT TO CHAT
            },
          };

          zim.on("receivePeerMessage", eventHandler.receivePeerMessage!);

          return () => {
            zim.off("receivePeerMessage");
          };
        }

        //SETTING NAV NOTIFICATON
        SET_NAV_NOTIF(user?.navNotif?.newQuotation || 0);
      }
    })();
  }, [user]);

  if (!fontsLoaded) {
    return (
      <SafeAreaView style= {styles.safeAreaViewContainer } >
      <ThemeProvider theme={ theme }>
        <Div flex={ 1 } justifyContent = "center" alignItems = "center" >
          <ActivityIndicator size="large" color = { theme.colors.primary } />
            </Div>
            </ThemeProvider>
            </SafeAreaView>
    );
  }

return (
  <ThemeProvider theme= { theme } >
  <SafeAreaProvider>
  <SafeAreaView style={ [styles.safeAreaViewContainer, { backgroundColor }] }>
    <StatusBar barStyle="dark-content" />
      <NavigationContainer ref={ navigationRef }>
        <ToastProvider
              placement="bottom"
textStyle = {{
  textTransform: "capitalize",
              }}
duration = { 2500}
  >
  <SocketProvider>
  <Stack.Navigator
                  initialRouteName="HomeScreen"
screenOptions = {{
  headerShown: false,
    statusBarColor: "#FAF8F5",
                  }}
                >
  <Stack.Screen name="SplashScreen" component = { SplashScreen } />
    <Stack.Screen
                    name="OnboardingScreen"
component = { OnboardingScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen name = "NewOnboardingScreen" component = { NewOnboardingScreen } />
    <Stack.Screen name="SignupScreen" component = { SignupScreen } />
      <Stack.Screen name="WelcomeScreen" component = { Welcome } />
        <Stack.Screen
                    name="codeVerification"
component = {CodeVerification}
  />
  <Stack.Screen
                    name="AccountSetupAddressScreen"
component = { AccountSetupAddressScreen }
  />
  <Stack.Screen
                    name="AccountSetupEmailScreen"
component = { AccountSetupEmailScreen }
  />

  <Stack.Screen
                    name="AccountSetupEmailOtpScreen"
component = { AccountSetupEmailOtpScreen }
  />
  <Stack.Screen name="PhoneVerificationScreen" component={PhoneVerificationScreen}/>

  < Stack.Screen
name = "HomeScreen"
component = { TabNavigation }
options = {{ headerShown: false, gestureEnabled: false }}
/>

  < Stack.Screen name = "NotificationScreen" component = { NotificationScreen } />
    <Stack.Screen
                    name="ClinicListScreen"
component = { ClinicListScreen }
  // options={{ headerShown: false, gestureEnabled: false }}
  />
  <Stack.Screen name="ClinicDetailScreen" component = { ClinicDetailScreen } />

    <Stack.Screen name="HomeServicesScreen" component={HomeServicesScreen} />
    <Stack.Screen name="ServiceDetailsScreen" component={ServiceDetailsScreen} />
    <Stack.Screen name="SelectDateTimeScreen" component={SelectDateTimeScreen} />
    <Stack.Screen name="YourCartScreen" component={YourCartScreen} />
    <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
    <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
    <Stack.Screen name="RecentOrdersScreen" component={RecentOrdersScreen} />
    <Stack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />

    <Stack.Screen name="PetProfileScreen" component = { PetProfileScreen } />
      <Stack.Screen name="GroupProfile" component = { GroupProfile } />
        <Stack.Screen
                    name="PetProfileMedicalHistoryScreen"
component = { PetProfileMedicalHistoryScreen }
  />
  <Stack.Screen
                    name="PetProfileCongratulationsScreen"
component = { PetProfileCongratulationsScreen }
  />
  <Stack.Screen
                    name="CounsellingRequestScreen"
component = { CounsellingRequestScreen }
  />
  <Stack.Screen name="CounsellingInboxScreen" component = { CounsellingInboxScreen } />
    <Stack.Screen name="CounsellingChatScreen" component = { CounsellingChatScreen } />
      <Stack.Screen name="ExpertsListScreen" component = { ExpertsListScreen } />
        <Stack.Screen name="SubscriptionScreen" component = { SubscriptionScreen } />
          <Stack.Screen
                    name="ExpertsListDetailScreen"
component = { ExpertsListDetailScreen }
options = {{ headerTintColor: "#222" }}
/>
  < Stack.Screen name = "ExpertsInboxScreen" component = { ExpertsInboxScreen } />
    <Stack.Screen name="Groupchat" component = { Groupchat } />
      <Stack.Screen name="ExpertsChatScreen" component = { ExpertsChatScreen } />
        <Stack.Screen
                    name="ConsultationCaseBriefScreen"
component = { ConsultationCaseBriefScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen
name = "ConsultationWaitingScreen"
component = { ConsultationWaitingScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen name = "UnavailableScreen" component = { UnavailableScreen } />
    <Stack.Screen
                    name="ConsultationVideoScreen"
component = { ConsultationVideoScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen name = "RequestCallBackScreen" component = { RequestCallBackScreen } />
    <Stack.Screen name="EmergencyScreen" component = { EmergencyScreen } />
      <Stack.Screen
                    name="ExpertsScheduleConfirmationScreen"
component = { ExpertsScheduleConfirmationScreen }
  />
  <Stack.Screen
                    name="ExpertsScheduleSuccessScreen"
component = { ExpertsScheduleSuccessScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen name = "CasesQuotesListScreen" component = { CasesQuotesListScreen } />
    <Stack.Screen name="CaseDetailScreen" component = { CaseDetailScreen } />
      <Stack.Screen name="CaseQuotesScreen" component = { CaseQuotesScreen } />
        <Stack.Screen
                    name="CaseQuoteDescriptionScreen"
component = { CaseQuoteDescriptionScreen }
  />
  <Stack.Screen name="PartnerVetScreen" component = { PartnerVetScreen } />
    <Stack.Screen name="SlotBookingScreen" component = { SlotBookingScreen } />
      <Stack.Screen name="PartnerVetDetailScreen" component = { PartnerVetDetailScreen } />
        <Stack.Screen
                    name="PartnerVetConfirmationScreen"
component = { PartnerVetConfirmationScreen }
  />
  <Stack.Screen
                    name="PartnerVetSuccessfullScreen"
component = { PartnerVetSuccessfullScreen }
  />
  <Stack.Screen
                    name="SettingPersonalInfoScreen"
component = { SettingPersonalInfoScreen }
  />
  <Stack.Screen name="EditInfoScreen" component = { EditInfoScreen } />
    <Stack.Screen name="PetEditInfoScreen" component = { PetEditInfoScreen } />
      <Stack.Screen
                    name="ConsultationFeedbackScreen"
component = { ConsultationFeedbackScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen name = "PetProfileListScreen" component = { PetProfileListScreen } />
    <Stack.Screen
                    name="PetProfileDetailsScreen"
component = { PetProfileDetailsScreen }
options = {{
  gestureEnabled: false,
                    }}
/>
  < Stack.Screen
name = "PetProfileBenefitsScreen"
component = { PetProfileBenefitsScreen }
  />
  <Stack.Screen name="SettingsMainScreen" component = { SettingsMainScreen } />
    {/* Appointments Screens */ }
    < Stack.Screen name = "AppointmentsScreen" component = { AppointmentsScreen } />
      <Stack.Screen
                    name="AppointmentDetailsScreen"
component = { AppointmentDetailsScreen }
  />

  <Stack.Screen name="PaymentDetailsScreen" component = { PaymentDetailsScreen } />

    <Stack.Screen
                    name="PetProfileSmollcarePaymentScreen"
component = { PetProfileSmollcarePaymentScreen }
  />
  {/* Smoll care payment success */ }
  < Stack.Screen name = "paymentSuccess" component = { SmollcarePaymentSuccessScreen } />
    </Stack.Navigator>
    < Popup />
    <SocketListener />
    </SocketProvider>
    < FlashMessage position = "top" />
      </ToastProvider>
      </NavigationContainer>
      </SafeAreaView>
      </SafeAreaProvider>
      </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
  },
});

export default Sentry.wrap(App);