import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontCooper, fontHauoraMedium } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconArrowRight } from "@tabler/icons-react-native";
import { Div, Text } from "react-native-magnus";
import React from "react";

const EmergencyScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute() as {
    params: {
      isEmergency?: boolean;
      isDirectEscalated?: boolean;
      partnerId: string;
      partnerName: string;
      caseId: string;
      petName: string;
      partnerVetId: string;
      scheduleAt: string;
      selectedServices: {
        id: string;
        label: string;
        price: number;
      }[];
    };
  };

  const {
    isEmergency,
    isDirectEscalated,
    partnerId,
    partnerName,
    caseId,
    selectedServices,
    petName,
    partnerVetId,
    scheduleAt,
  } = route.params;

  return (
    <Layout
      showBack
      style={{ paddingBottom: 35 }}
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <Div flex={1} justifyContent="center" alignItems="center" maxW={320} mx={"auto"}>
        <Text fontSize={"6xl"} fontFamily={fontCooper} mb={10}>
          {isEmergency ? "Emergency" : "Direct Escalation"}
        </Text>
        <Text fontSize={"lg"} lineHeight={22} textAlign="center" fontFamily={fontHauoraMedium}>
          {isEmergency
            ? `Due to the conditions of ${petName} case you will be booked immediately
          with the vet on duty at ${partnerName}`
            : `Expert has escalated the case on their behalf and you will be booked immediately
          with the assigned vet at ${partnerName}`}
        </Text>
      </Div>

      <ButtonPrimary
        bgColor="danger"
        flexDir="row-reverse"
        alignItems="center"
        icon={<IconArrowRight size={24} color={"#fff"} />}
        onPress={() => {
          navigation.navigate("PaymentDetailsScreen", {
            partnerId: partnerId,
            partnerName,
            caseId,
            selectedServices,
            isEmergency: isEmergency,
            isDirectEscalated: isDirectEscalated,
            vetId: partnerVetId,
            scheduleAt,
          });
        }}
      >
        Confirm Appointment
      </ButtonPrimary>
    </Layout>
  );
};

export default EmergencyScreen;
