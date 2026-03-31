import Layout from "@/components/app/Layout";
import { colorPrimary, fontCooper, fontHauoraBold, fontHauoraSemiBold } from "@/constant/constant";
import { appointmentFormatedTime, useAppointmentStore } from "@/store/modules/appointments";
import { NavigationType } from "@/store/types";
import { AppointmentListResponseDto } from "@/store/types/appointments";
import { useFocusEffect } from "@react-navigation/native";
import { IconChevronRight, IconUser } from "@tabler/icons-react-native";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";

import { Div, Image, Tag, Text } from "react-native-magnus";

const AppointmentsScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { fetchAppointments, appointment: appointmentData } = useAppointmentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [nextPageId, setNextPageId] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [appointment, setAppointment] = useState<null | AppointmentListResponseDto[]>(null);

  // const appointmentData = dummyDataArray;

  useEffect(() => {
    if (!appointmentData) return;

    const now = new Date(); // Get the current date and time
    const currentDate = new Date().getDate();

    // Separate appointments into upcoming and archived
    const upcomingAppointments = appointmentData.filter((item) => {
      if (item.isEmergency) {
        const scheduledAt = new Date(item.scheduledAt); // Convert to Date object
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(now.getDate() - 1); // Set to 1 day ago
        return scheduledAt > oneDayAgo; // Include only emergency appointments that are less than 1 day old
      }

      const scheduledAt = new Date(item.scheduledAt); // Convert to Date object
      return scheduledAt > now; // Include only future appointments
    }) as AppointmentListResponseDto[];

    const archivedAppointments = appointmentData.filter((item) => {
      if (item.isEmergency) {
        const scheduledAt = new Date(item.scheduledAt); // Convert to Date object
        const oneDayAgo = new Date(now);
        oneDayAgo.setDate(now.getDate() - 1); // Set to 1 day ago
        return scheduledAt <= oneDayAgo; // Include emergency appointments that are 1 day old or older
      }

      const scheduledAt = new Date(item.scheduledAt); // Convert to Date object
      return scheduledAt <= now; // Include only past or current appointments
    }) as AppointmentListResponseDto[];

    if (activeTab === "Upcoming") {
      setAppointment(upcomingAppointments);
    } else {
      setAppointment(archivedAppointments);
    }
  }, [activeTab, appointmentData]);

  useFocusEffect(
    useCallback(() => {
      handleFetchAppointments(undefined, true);
    }, [])
  );

  const handleFetchAppointments = async (isRefresh?: boolean, reset?: boolean) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetchAppointments(1, reset);

      setNextPageId(response.nextPage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageId) return;

    return new Promise<void>(async (resolve) => {
      try {
        const fetchedData = await fetchAppointments(nextPageId);
        setNextPageId(fetchedData.nextPage);
      } finally {
        resolve();
      }
    });
  };

  const actionBtns = ["Upcoming", "Past"];

  return (
    <Layout
      showBack
      backBtnText=""
      title="Appointments"
      onBackPress={() => {
        navigation.navigate("HomeScreen");
      }}
      // loading={isLoading}
    >
      <Div flex={1}>
        <Div flex={1} pt={24}>
          <Div
            flexDir="row"
            justifyContent="space-around"
            mb={45}
            borderWidth={1}
            borderColor="#ccc"
            rounded={12}
          >
            {actionBtns.map((item) => (
              <TouchableOpacity
                key={item}
                style={{
                  width: item === activeTab ? "50%" : "50%",
                  // borderWidth: 1,
                  borderRightWidth: item === activeTab && activeTab === "Upcoming" ? 1 : 0,
                  borderLeftWidth: item === activeTab && activeTab === "Past" ? 1 : 0,
                  borderColor: "#ccc",
                  borderRadius: 12,
                  alignItems: "center",
                  padding: 5,
                  paddingVertical: 8,
                  backgroundColor: item !== activeTab ? "#FAF8F5" : "#f1ebe2",
                }}
                onPress={() => {
                  setActiveTab(item);
                  handleFetchAppointments(undefined, true);
                }}
              >
                <Text
                  fontSize={"lg"}
                  fontWeight="500"
                  fontFamily={fontHauoraBold}
                  // ml={8}
                  color={item !== activeTab ? "#ccc" : "#222"}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </Div>

          {isLoading ? (
            <Div h={"65%"} justifyContent="center">
              <ActivityIndicator size={"large"} color={colorPrimary} />
            </Div>
          ) : (
            <FlatList
              ListEmptyComponent={() => (
                <Div minH={350} justifyContent="flex-end">
                  <Text
                    fontSize={"5xl"}
                    textAlign="center"
                    fontFamily={fontCooper}
                    maxW={"80%"}
                    mx={"auto"}
                    lineHeight={36}
                  >
                    You don't have any {activeTab === "Upcoming" ? "upcoming" : "archived"}{" "}
                    appointments
                  </Text>
                </Div>
              )}
              onEndReached={handleLoadMore} // required, should return a promise
              onEndReachedThreshold={20} // optional
              activityIndicatorColor={"black"} // optional
              showsVerticalScrollIndicator={false}
              data={appointment}
              renderItem={({ item, index }) => (
                <AppointmentCard
                  isEmergency={item.isEmergency}
                  img={item.partner?.clinicImg?.url ?? item.vet?.profileImg?.url}
                  pet={item.pet.name}
                  text={`Your upcoming ${
                    item.type === "in-clinic" ? "visit" : "consultation"
                  } with ${item.partner?.name ?? item.vet?.name}`}
                  scheduledTime={item.scheduledAt}
                  type={item.type === "in-clinic" ? "Clinic Visit" : "Video Consultation"}
                  alert={item.isEmergency ? "Emergency" : ""}
                  onPress={() => {
                    if (!item.scheduledAt && item.type === "in-clinic") {
                      navigation.navigate("PartnerVetScreen", {
                        bookingId: item.id,
                        caseId: item.caseId,
                        partnerId: item.partner?.id,
                        partnerName: item.partner?.name,
                        selectedServices: item.services,
                      });
                    } else {
                      navigation.navigate("AppointmentDetailsScreen", {
                        id: item.id,
                        type: item.type,
                      });
                    }
                  }}
                />
              )}
              keyExtractor={(item, index) => `${index}`}
            />
          )}
        </Div>
      </Div>
    </Layout>
  );
};

export default AppointmentsScreen;

const AppointmentCard: React.FC<{
  type: string;
  img: string;
  text: string;
  pet: string;
  alert?: string;
  isEmergency?: boolean;
  isLastChild?: boolean;
  scheduledTime: string;
  onPress: () => void;
}> = (props) => {
  return (
    <TouchableOpacity style={{ marginBottom: 20 }} onPress={props.onPress}>
      <Div
        flexDir="row"
        pb={16}
        borderBottomWidth={1}
        borderColor={props.isLastChild ? "transparent" : "#D0D7DC"}
      >
        <Div
          w={60}
          h={60}
          rounded={100}
          bg="#eeeeee"
          mr={16}
          justifyContent="center"
          alignItems="center"
          borderColor="#D0D7DC"
          borderWidth={1}
        >
          {props.img ? (
            <Image w={"100%"} h={"100%"} rounded={100} src={props.img} />
          ) : (
            <IconUser size={24} width={40} height={40} color="#fff" />
          )}
        </Div>

        <Div maxW={230}>
          <Div mb={4} flexDir="row" style={{ gap: 4 }}>
            <Tag
              fontSize={"sm"}
              fontFamily={fontHauoraSemiBold}
              px={8}
              py={6}
              rounded={37}
              borderWidth={1}
              borderColor="#222"
              style={{ alignSelf: "flex-start" }}
              bg="transparent"
            >
              {props.type}
            </Tag>

            {props.alert && (
              <Tag
                fontSize={"sm"}
                fontFamily={fontHauoraSemiBold}
                px={8}
                py={6}
                rounded={37}
                borderWidth={1}
                borderColor="#E02A2A"
                bg="#E02A2A"
                color="#fff"
                style={{ alignSelf: "flex-start" }}
              >
                {props.alert}
              </Tag>
            )}
          </Div>

          <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} mb={4} lineHeight={24}>
            {props.text}
          </Text>

          <Text fontSize={"md"} fontFamily={fontHauoraBold} color="darkGreyText" mb={4}>
            Pet: {props.pet}
          </Text>

          {props.scheduledTime ? (
            <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} lineHeight={24} color="primary">
              {dayjs(props.scheduledTime).format(
                `DD MMM YYYY ${props.isEmergency ? "" : ", hh:mm A"}`
              )}
            </Text>
          ) : (
            <Tag fontSize={"sm"} fontFamily={fontHauoraSemiBold} px={8} py={6} rounded={37}>
              Pending reschedule
            </Tag>
          )}
        </Div>

        <IconChevronRight
          width={32}
          height={32}
          color={"#222"}
          style={{ alignSelf: "center", marginLeft: "auto" }}
        />
      </Div>
    </TouchableOpacity>
  );
};
