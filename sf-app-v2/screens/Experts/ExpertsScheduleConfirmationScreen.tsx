import React, { useEffect, useMemo, useState } from "react";
import { Button, Div, ScrollDiv, Text } from "react-native-magnus";
import {
  fontCooper,
  fontCooperMedium,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { IconCalendarMonth } from "@tabler/icons-react-native";
import Accordion from "@/components/partials/Accordion";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import Layout from "@/components/app/Layout";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { useExpertStore } from "@/store/modules/expert";
import { usePetStore } from "@/store/modules/pet";
import { ExpertAvailability } from "@/store/types/expert";
import dayjs from "dayjs";
import { CreateCasePayloadDto } from "@/store/types/case";
import { useCaseStore } from "@/store/modules/case";
import { AxiosError } from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const faqData = [
  {
    question: "How do I join the online consultation?",
    answer:
      "You'll receive a push notificaiton, Click on it to join the video call. Or you can also go to appointments tab on the app.",
  },
  {
    question: "What should I prepare before the consultation?",
    answer:
      "Have your pet nearby, any relevant medical records or photos ready, and a list of questions or concerns you want to discuss.",
  },
  {
    question: "What if I have technical issues?",
    answer:
      "Test your camera and microphone beforehand. If you encounter problems during the call, there will be a support contact provided in your confirmation email.",
  },
  {
    question: "How long will the consultation last?",
    answer: "Typically, online consultations last 15-30 minutes.",
  },
];

// Define the params type for your stack navigator
type RootStackParamList = {
  ExpertsListDetailScreen: {
    expertId: string;
    caseData: string;
    petId: string;
  };
  ExpertsScheduleSuccessScreen: {
    consultationId: string;
  };
  // ... other screens
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ExpertsScheduleConfirmationScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();

  const { selectedTime, selectedDate, caseData, petId, expertId, scheduleAt } =
    route.params as Record<string, string>;

  console.log("parsedSelectedTime selectedTime", selectedTime);

  const { expertDetailMap, scheduleConsultation } = useExpertStore();
  const { petsDetailMap, fetchPetDetails } = usePetStore();
  const { createCase, removeCase } = useCaseStore();

  const expert = expertDetailMap.get(expertId);
  const pet = petsDetailMap.get(petId);

  const parsedSelectedTime = JSON.parse(selectedTime) as ExpertAvailability["intervals"][number];
  const parsedSelectedDate = new Date(selectedDate);
  const parsedCase = JSON.parse(caseData) as CreateCasePayloadDto;

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!pet) {
      fetchPet();
    }
  }, [pet]);

  const scheduledTime = useMemo(() => {
    const date = dayjs(parsedSelectedDate).format("YYYY-MM-DD");

    const fromTime = dayjs(`${date}T${parsedSelectedTime.from}Z`).format("hh:mm A");

    const toTime = dayjs(`${date}T${parsedSelectedTime.to}Z`).format("hh:mm A");

    return `${fromTime} - ${toTime}`;
  }, [parsedSelectedDate, parsedSelectedTime]);

  const fetchPet = async () => {
    try {
      setIsLoading(true);
      await fetchPetDetails(petId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleConsultation = async () => {
    let caseId;

    try {
      setActionLoading(true);

      const { id } = await createCase(parsedCase);
      caseId = id;

      const { id: consultationId } = await scheduleConsultation(expertId, {
        caseId,
        scheduleAt: scheduleAt,
        petId,
      });

      navigation.navigate("ExpertsScheduleSuccessScreen", {
        consultationId: consultationId,
      });
    } catch (err) {
      const error = err as AxiosError<any, any>;

      if (error?.response?.data?.message?.includes("already scheduled") && caseId) {
        await removeCase(caseId);
      }

      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  console.log("Confirm Appointment pet", pet);

  return (
    <Layout
      showBack
      title="Confirm Appointment"
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={isLoading}
    >
      <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
        <Text fontFamily={fontHauoraBold} fontSize="xl" lineHeight={24} mb={24}>
          Basic Details
        </Text>

        <ReadonlyItem field="Expert" value={expert?.name ?? ""} mb={16} />

        <ReadonlyItem field="Pet" value={pet?.name ?? ""} mb={12} />
        <ReadonlyItem field="Case Brief" value={parsedCase.description ?? ""} mb={12} />

        <Div flexDir="row" justifyContent="space-between" mb={24}>
          <Div flexDir="row" alignItems="center">
            <IconCalendarMonth size={32} color="#222222" strokeWidth={1.5} />
            <Text
              ml={16}
              fontFamily={fontHauoraSemiBold}
              fontSize="lg"
              lineHeight={24}
              color="#222222"
            >
              {scheduledTime} {"\n"}
              {dayjs(parsedSelectedDate).format("ddd, D MMM YYYY")}
            </Text>
          </Div>

          <Button
            bg="transparent"
            fontFamily={fontHauoraSemiBold}
            fontSize="lg"
            lineHeight={24}
            color="#0189F9"
            onPress={() => {
              navigation.push("ExpertsListDetailScreen", {
                expertId,
                caseData: caseData,
                petId,
              });
            }}
          >
            Change
          </Button>
        </Div>

        <Div mt={24}>
          <Text fontFamily={fontHauoraSemiBold} fontSize="lg" lineHeight={24} color="#222222">
            (FAQ) Frequently Asked Questions
          </Text>

          <Div pt={12}>
            {faqData.map((item, i) => (
              <Accordion key={i}>
                <Accordion.title>
                  <Text fontFamily={fontCooper} fontSize="lg" lineHeight={20} color="#494949">
                    {item.question}
                  </Text>
                </Accordion.title>
                <Accordion.content>
                  <Text>{item.answer}</Text>
                </Accordion.content>
              </Accordion>
            ))}
          </Div>
        </Div>
      </ScrollDiv>

      <ButtonPrimary
        loading={actionLoading}
        disabled={actionLoading}
        onPress={handleScheduleConsultation}
      >
        Schedule
      </ButtonPrimary>
    </Layout>
  );
};

const ReadonlyItem = ({ field, value, mb }: { field: string; value: string; mb?: number }) => {
  return (
    <Div pb={16} borderBottomWidth={1} borderColor="#E0E0E0" mb={mb ? mb : 0}>
      <Text
        fontFamily={fontHauoraSemiBold}
        fontSize={"xl"}
        // lineHeight={16}
        color="darkGreyText"
      >
        {field}
      </Text>
      <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
        {value}
      </Text>
    </Div>
  );
};

export default ExpertsScheduleConfirmationScreen;
