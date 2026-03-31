import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontHauoraMedium, fontHauoraSemiBold, fontHeading } from "@/constant/constant";
import { IconCalendarClock, IconUserX } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { Div, Image, Text } from "react-native-magnus";
import { showMessage, hideMessage } from "react-native-flash-message";
import FlashCustomContent from "@/components/partials/FlashCustomContent";
import { useExpertStore } from "@/store/modules/expert";
import { useRoute } from "@react-navigation/native";
import { NavigationType } from "@/store/types";
import { usePartnerStore } from "@/store/modules/partner";
import { useAppointmentStore } from "@/store/modules/appointments";
import BottomSheet from "@/components/partials/BottomSheet";

interface Props {
  navigation: NavigationType;
}

const btns = [
  {
    text: "Reschedule",
    icon: <IconCalendarClock width={30} height={30} color={"#679FF0"} />,
  },
  {
    text: "Cancel",
    icon: <IconUserX width={30} height={30} color={"#679FF0"} />,
  },
];

const PartnerVetSuccessfullScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();

  const { cancelAppointment } = useAppointmentStore();
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const bookingId = (route.params as Record<string, string>)?.bookingId;
  const partnerId = (route.params as Record<string, string>)?.partnerId;
  const partnerName = (route.params as Record<string, string>)?.partnerName;
  const caseId = (route.params as Record<string, string>)?.caseId;
  const vetId = (route.params as Record<string, string>)?.vetId;

  const selectedServices = (route.params as { selectedServices: { id: string; label: string }[] })
    ?.selectedServices;

  const handleCancelClick = async () => {
    try {
      setIsLoading(true);

      showMessage({
        renderCustomContent: () => <FlashCustomContent loader message="Cancelling..." />,
        message: "",
        type: "info",
        autoHide: false,
      });

      await cancelAppointment(bookingId);

      showMessage({
        renderCustomContent: () => (
          <FlashCustomContent message="Appointment cancelled successfully." />
        ),
        message: "",
        type: "success",
        autoHide: true,
      });

      navigation.navigate("HomeScreen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!bookingId) return;

    try {
      setRescheduleLoading(true);

      navigation.navigate("PartnerVetScreen", {
        bookingId,
        vetId,
        partnerId,
        partnerName,
        backTo: "HomeScreen",
        caseId,
        selectedServices,
        isReschedule: true,
      });

      setShowRescheduleModal(false);
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <Layout onBackPress={() => {}}>
      <Div flex={1} justifyContent="space-between" pt={20}>
        <Div>
          <Image
            source={require("../../assets/images/congratulation-tick.png")}
            w={100}
            h={100}
            style={{ transform: [{ translateX: -10 }] }}
            mb={32}
          />

          <Text fontSize={"6xl"} mb={8} fontFamily={fontHeading}>
            Thank you for booking with us
          </Text>
          <Text fontSize={"lg"} fontFamily={fontHauoraMedium} mb={32}>
            We will send a notification once your appointment is close.
          </Text>

          <Div>
            {btns.map((item) => (
              <TouchableOpacity
                key={item.text}
                style={{
                  flexDirection: "row",
                  gap: 16,
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <Div>
                  <IconCalendarClock width={32} height={32} color={"#679FF0"} />
                </Div>
                <Text
                  fontSize={"lg"}
                  fontFamily={fontHauoraSemiBold}
                  color="primary"
                  onPress={() => {
                    if (item.text.includes("Reschedule")) {
                      setShowRescheduleModal(true);
                    } else {
                      setShowCancelModal(true);
                    }
                  }}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </Div>
        </Div>

        <ButtonPrimary
          disabled={isLoading || rescheduleLoading}
          onPress={() => {
            // navigation.navigate("AppointmentsScreen");
            navigation.navigate("AppointmentDetailsScreen", {
              id: bookingId,
              type: "in-clinic",
            });
          }}
        >
          Appointment details
        </ButtonPrimary>
      </Div>

      <BottomSheet
        isVisible={showCancelModal}
        h={340}
        showCloseIcon
        onCloseIconClick={() => {
          setShowCancelModal(false);
        }}
        roundedTop={24}
      >
        <Div>
          <Text fontSize={"6xl"} mb={8} fontFamily={fontHeading}>
            Cancel Booking
          </Text>

          <Text fontSize={"md"} fontFamily={fontHauoraMedium} mb={16}>
            Are you sure you want to cancel your appointment with
            {partnerName}?
          </Text>

          <ButtonPrimary
            bgColor="danger"
            mb={12}
            onPress={handleCancelClick}
            loading={isLoading}
            disabled={isLoading}
          >
            Yes, Cancel
          </ButtonPrimary>

          <ButtonPrimary
            bgColor="primary"
            onPress={() => {
              setShowCancelModal(false);
            }}
            disabled={isLoading}
          >
            Keep it Booked
          </ButtonPrimary>
        </Div>
      </BottomSheet>

      <BottomSheet
        isVisible={showRescheduleModal}
        h={340}
        showCloseIcon
        onCloseIconClick={() => {
          setShowRescheduleModal(false);
        }}
        roundedTop={24}
      >
        <Div>
          <Text fontSize={"6xl"} mb={8} fontFamily={fontHeading}>
            Reschedule Booking
          </Text>

          <Text fontSize={"md"} fontFamily={fontHauoraMedium} mb={16}>
            Are you sure you want to reschedule your appointment?
          </Text>

          <ButtonPrimary
            bgColor="danger"
            mb={12}
            onPress={handleRescheduleBooking}
            loading={rescheduleLoading}
            disabled={rescheduleLoading}
          >
            Yes, Reschedule
          </ButtonPrimary>

          <ButtonPrimary
            bgColor="primary"
            onPress={() => {
              setShowRescheduleModal(false);
            }}
            disabled={rescheduleLoading}
          >
            Cancel
          </ButtonPrimary>
        </Div>
      </BottomSheet>
    </Layout>
  );
};

export default PartnerVetSuccessfullScreen;
