import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontHauoraMedium, fontHauoraSemiBold, fontHeading } from "@/constant/constant";
import { IconCalendarClock } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { Div, Image, Text } from "react-native-magnus";
import { showMessage, hideMessage } from "react-native-flash-message";
import FlashCustomContent from "@/components/partials/FlashCustomContent";
import { useExpertStore } from "@/store/modules/expert";
import { useRoute } from "@react-navigation/native";
import { NavigationType } from "@/store/types";
import { useAppointmentStore } from "@/store/modules/appointments";

interface Props {
  navigation: NavigationType;
}

const btns = [
  //   {
  //     text: "Resehdule Booking",
  //     icon: <IconCalendarClock width={32} height={32} color={"#427594"} />,
  //   },
  {
    text: "Cancel Booking",
    icon: <IconCalendarClock width={32} height={32} color={"#679FF0"} />,
  },
];

const ExpertsScheduleSuccessScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();

  const { cancelConsultation } = useAppointmentStore();
  const [isLoading, setIsLoading] = useState(false);

  const consultationId = (route.params as Record<string, string>)?.consultationId;

  const handleCancelClick = async () => {
    try {
      setIsLoading(true);

      showMessage({
        renderCustomContent: () => <FlashCustomContent loader message="Cancelling..." />,
        message: "",
        type: "info",
        autoHide: false,
      });

      await cancelConsultation(consultationId);

      showMessage({
        renderCustomContent: () => (
          <FlashCustomContent message="Consultation cancelled successfully." />
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
            <TouchableOpacity
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
                onPress={handleCancelClick}
              >
                Cancel Booking
              </Text>
            </TouchableOpacity>
          </Div>
        </Div>

        <ButtonPrimary
          disabled={isLoading}
          onPress={() => {
            // navigation.navigate("AppointmentsScreen");
            navigation.navigate("AppointmentDetailsScreen", {
              id: consultationId,
              type: "video",
            });
          }}
        >
          View Appointment
        </ButtonPrimary>
      </Div>
    </Layout>
  );
};

export default ExpertsScheduleSuccessScreen;
