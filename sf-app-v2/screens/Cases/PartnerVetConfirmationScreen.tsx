import Layout from "@/components/app/Layout";
import Accordion from "@/components/partials/Accordion";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import {
  fontCooper,
  fontCooperMedium,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useAppointmentStore } from "@/store/modules/appointments";
import { useCaseStore } from "@/store/modules/case";
import { usePartnerStore } from "@/store/modules/partner";
import { NavigationType } from "@/store/types";
import { ExpertAvailability } from "@/store/types/expert";
import { useRoute } from "@react-navigation/native";
import { IconCalendarMonth } from "@tabler/icons-react-native";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { Button, Div, Image, ScrollDiv, Text } from "react-native-magnus";

const faqData = [
  {
    question: "Should I arrive exactly on time?",
    answer: "Please arrive 10 minutes earlier to fill up any information needed.",
  },
  {
    question: "Who should I talk to at clinic?",
    answer: "Speak to the front desk and say that you have ‘smoll appointment’",
  },
  {
    question: "What things should I bring with me?",
    answer: "Hard copy of pet passport/health records if available.",
  },
  {
    question: "Anything I should consider?",
    answer:
      "If your pet is not vaccinated, large pet, or have anxiety against other pets, please inform the clinic from desk as soon as you arive",
  },
];

const PartnerVetConfirmationScreen: React.FC<{
  navigation: NavigationType;
}> = ({ navigation }) => {
  const route = useRoute();

  const { rescheduleAppointment } = useAppointmentStore();
  const { partnerVetDetails, bookPartnerVet } = usePartnerStore();
  const { casesQuotes } = useCaseStore();

  const bookingId = (route.params as Record<string, string | undefined>)?.bookingId;

  const partnerId = (route.params as Record<string, string>)?.partnerId;
  const partnerName = (route.params as Record<string, string>)?.partnerName;
  const caseId = (route.params as Record<string, string>)?.caseId;
  const vetId = (route.params as Record<string, string>)?.vetId;
  const selectedDate = (route.params as Record<string, string>)?.selectedDate;
  const selectedTime = (route.params as Record<string, string>)?.selectedTime;
  const scheduleAt = (route.params as Record<string, string>)?.scheduleAt;
  const selectedServices = (
    route.params as {
      selectedServices: { id: string; label: string; price: number }[];
    }
  )?.selectedServices;
  const paymentIntentId = (route.params as Record<string, string>)?.paymentIntentId;
  const isReschedule = (route.params as Record<string, boolean>)?.isReschedule;

  const [actionLoading, setActionLoading] = useState(false);

  const quote = useMemo(() => {
    return casesQuotes.get(caseId)?.find((quote) => quote.partner.id === partnerId);
  }, [casesQuotes, partnerId, caseId]);

  const partner = useMemo(() => {
    return quote?.partner;
  }, [quote]);

  const parsedSelectedTime = JSON.parse(selectedTime) as ExpertAvailability["intervals"][number];
  const parsedSelectedDate = new Date(selectedDate);

  const partnerDetails = useMemo(() => {
    return partnerVetDetails.get(vetId);
  }, [partnerVetDetails, vetId]);

  const scheduledTime = useMemo(() => {
    const date = dayjs(parsedSelectedDate).format("YYYY-MM-DD");

    const fromTime = dayjs(`${date}T${parsedSelectedTime.from}Z`).format("hh:mm A");

    const toTime = dayjs(`${date}T${parsedSelectedTime.to}Z`).format("hh:mm A");

    return `${fromTime} - ${toTime}`;
  }, [parsedSelectedDate, parsedSelectedTime]);

  const handleBook = async () => {
    if (!partnerId || !vetId || !caseId || !scheduleAt || !bookingId) {
      return;
    }

    try {
      setActionLoading(true);

      const updatedServices = selectedServices.map((item) => {
        return { id: item.id, label: item.label };
      });

      await rescheduleAppointment(bookingId);

      const { id } = await bookPartnerVet(
        vetId,
        partnerId,
        caseId,
        scheduleAt,
        updatedServices,
        undefined,
        bookingId
      );

      navigation.navigate("PartnerVetSuccessfullScreen", {
        bookingId: id,
        vetId,
        partnerId,
        caseId,
        scheduleAt,
        selectedServices,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout
      showBack
      title="Confirm Appointment"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
        <Div h={20}></Div>
        <ReadonlyItem
          field="Veterinarian"
          value={
            <Div row>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
                {partnerDetails?.name}
              </Text>

              <Image
                source={{
                  uri: partnerDetails?.profileImg?.url ?? "https://via.placeholder.com/150",
                }}
                w={50}
                h={50}
                rounded={100}
                right={0}
                top={-25}
                position="absolute"
                bg="#eeeeee"
                ml="auto"
                borderWidth={1}
                borderColor="#D0D7DC"
              />
            </Div>
          }
          mb={16}
        />

        <ReadonlyItem
          field="Clinic"
          value={
            <Div row>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
                {partnerDetails?.partnerName}
              </Text>

              <Image
                source={{
                  uri: partner?.clinicImg?.url ?? "https://via.placeholder.com/150",
                }}
                w={50}
                h={50}
                rounded={100}
                right={0}
                top={-25}
                position="absolute"
                bg="#eeeeee"
                ml="auto"
                borderWidth={1}
                borderColor="#D0D7DC"
              />
            </Div>
          }
          mb={12}
        />

        <Text
          fontFamily={fontHauoraSemiBold}
          fontSize="xl"
          lineHeight={24}
          color="darkGreyText"
          mb={8}
        >
          Date and time
        </Text>

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
            onPress={() => navigation.goBack()}
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

      <Div mt={20}>
        <ButtonPrimary
          loading={actionLoading}
          disabled={actionLoading}
          onPress={() => {
            if (bookingId) {
              handleBook();
            } else {
              navigation.navigate("PaymentDetailsScreen", {
                caseId,
                clinicName: partner?.name,
                partnerId,
                partnerName,
                scheduleAt,
                selectedServices,
                vetId,
                paymentIntentId,
              });
            }
          }}
        >
          Continue
        </ButtonPrimary>
      </Div>
    </Layout>
  );
};

const ReadonlyItem = ({
  field,
  value,
  mb,
}: {
  field: string;
  value: string | React.ReactNode;
  mb?: number;
}) => {
  return (
    <Div pb={16} borderBottomWidth={1} borderColor="#E0E0E0" mb={mb ? mb : 0}>
      <Text fontFamily={fontHauoraBold} color="darkGreyText">
        {field}
      </Text>

      {typeof value === "string" ? (
        <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Div>
  );
};

export default PartnerVetConfirmationScreen;

const RowText: React.FC<{
  name: string;
  percent?: string;
  value?: string;
  fontFamily: string;
  mb?: number;
}> = ({ name, percent, value, fontFamily, mb }) => {
  return (
    <Div flexDir="row" justifyContent="space-between" alignItems="center" mb={mb ? mb : 0}>
      <Div flexDir="row" alignItems="center">
        <Text fontSize={"xl"} fontFamily={fontFamily}>
          {name}
        </Text>

        {percent && (
          <Text ml={8} color="primary" fontSize={"md"} fontFamily={fontHauoraMedium}>
            {percent}
          </Text>
        )}
      </Div>

      {value && (
        <Text fontSize={"xl"} fontFamily={fontFamily}>
          {value}
        </Text>
      )}
    </Div>
  );
};
