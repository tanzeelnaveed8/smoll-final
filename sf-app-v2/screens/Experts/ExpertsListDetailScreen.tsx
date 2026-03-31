import Layout from "@/components/app/Layout";
import ChatIcon from "@/components/icons/ChatIcon";
import VideoIcon from "@/components/icons/VideoIcon";
import AvailabilityAndDateSelector from "@/components/partials/AvailabilityAndDateSelector";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import DoctorCard from "@/components/partials/DoctorCard";
import {
  colorPrimary,
  fontCooper,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { SocketEventEnum } from "@/socket/events";
import { useSocket } from "@/socket/provider";
import { useExpertStore } from "@/store/modules/expert";
import { useUserStore } from "@/store/modules/user";
import { NavigationType, TimeBtnType } from "@/store/types";
import { ExpertAvailability } from "@/store/types/expert";
import { hasAvailabilityDateTimePassed } from "@/utils/helpers";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, RefreshControl, TouchableOpacity } from "react-native";
import { Button, Div, ScrollDiv, Skeleton, Text } from "react-native-magnus";

const dayOfWeekMap: { [key: string]: number } = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const windowWidth = Dimensions.get("window").width;

const timeTabBtns = ["morning", "noon", "evening"];

type IntervalStateType = Record<
  TimeBtnType,
  {
    from: string;
    to: string;
  }[]
>;

type IntervalType = {
  from: string;
  to: string;
}[];

const ExpertsListDetailScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const socket = useSocket();
const { user } = useUserStore();
// console.log("first",user);
  const expertId =
    (route.params as Record<string, string>)?.id ??
    (route.params as Record<string, string>)?.expertId;
  // Incase of change schedule from schedule confirmation screen
  const caseData = (route.params as Record<string, string>)?.caseData;

  const {
    expertDetailMap,
    updateExpertStatus,
    fetchExpertDetail,
    fetchExpertAvailability,
    requestConsultation,
  } = useExpertStore();

  const [availability, setAvailability] = useState<ExpertAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<{
    value: { from: string; to: string };
    label: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeTimeTab, setActiveTimeTab] = useState<TimeBtnType>(timeTabBtns[0] as TimeBtnType);
  const [intervalData, setIntervalData] = useState<IntervalStateType | null>(null);

  console.log("selectedDate = ", selectedDate);

  useFocusEffect(
    useCallback(() => {
      handleFetchExpertDetails();
    }, [expertId])
  );

  const formatTime = useCallback(
    (availability: ExpertAvailability, interval: { from: string; to: string }) => {
      const date = dayjs().day(dayOfWeekMap[availability.dayOfWeek]).format("YYYY-MM-DD");

      const fromTime = dayjs(`${date}T${interval.from}Z`).format("hh:mm A");
      const toTime = dayjs(`${date}T${interval.to}Z`).format("hh:mm A");

      return `${fromTime} - ${toTime}`;
    },
    []
  );

  const handleFetchExpertDetails = async (isRefresh?: boolean) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      await fetchExpertDetail(expertId);
      handleDateSelect(dayjs().format("YYYY-MM-DD"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    try {
      if (selectedDate !== date) {
        setSelectedTime(null);
      }

      setAvailabilityLoading(true);
      setSelectedDate(date);

      const _availability = await fetchExpertAvailability(expertId, new Date(date));

      console.log("_availability[0].intervals", _availability[0].intervals);

      const getHour = (time: string) => {
        const dateTime = dayjs(`2025-01-21T${time}Z`);
        return dateTime.hour();
      };
      const morningTimings = _availability[0].intervals.filter((item) => getHour(item.from) < 12);
      const noonTimings = _availability[0].intervals.filter((item) => {
        const time = getHour(item.from);

        if (time > 12 && time < 17) {
          return item;
        }
      });
      const eveningTimings = _availability[0].intervals.filter((item) => getHour(item.from) > 17);

      if (morningTimings.length > 0) {
        setActiveTimeTab("morning");
      } else if (noonTimings.length > 0) {
        setActiveTimeTab("noon");
      } else if (eveningTimings.length > 0) {
        setActiveTimeTab("evening");
      }

      setIntervalData({
        morning: morningTimings,
        noon: noonTimings,
        evening: eveningTimings,
      });

      setAvailability(_availability);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleRequestConsultation = async () => {
   
    //          if(!user?.email){
    //             alert("Please update your email in profile to request a consultation.");
    //             return;

    //          }
    //          if(!user?.phone){
    //             alert("Please update your number in profile to request a consultation.");
    //             return;

    //          }

            
    // navigation.navigate("ConsultationCaseBriefScreen", {
    //   expertId: expertId,
    // });
      // Check if email is missing
  if (!user?.email) {

                navigation.navigate("AccountSetupEmailScreen", {
                  updateEmail: "true",
                  fromwherecall:"ExpertsListDetailScreen"
                });
            
    return;
  }

  // Check if phone is missing
  if (!user?.phone) {
    // PhoneVerificationScreen
navigation.navigate("PhoneVerificationScreen")
    return;
  }


  // Both email and phone exist — proceed
  navigation.navigate("ConsultationCaseBriefScreen", {
    expertId: expertId,
  });

  };

  const handleScheduleConsultation = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    try {
      setIsActionLoading(true);

      // const scheduledAt = selectedDate
      const _date = dayjs(selectedDate).format("YYYY-MM-DD");

      const scheduleAt = dayjs(
        _date.toString() + "T" + dayjs(`${_date}T${selectedTime.value.from}Z`).format("HH:mm")
      )
        .utc()
        .format();

      navigation.navigate("ConsultationCaseBriefScreen", {
        from: "ExpertsListDetailScreen",
        expertId,
        selectedTime: JSON.stringify(selectedTime?.value),
        selectedDate,
        scheduleAt,
        caseData,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const TimeBtnText: React.FC<{ time: string; color: string }> = ({ time, color }) => {
    const font = windowWidth > 390 ? 15 : 14;

    return (
      <Div flexDir="row" w={"100%"} justifyContent="center" flexWrap="wrap">
        <Text color={color} fontFamily={fontHauoraMedium} lineHeight={20} fontSize={font}>
          {time.split(" - ")[0]}
        </Text>
        <Text color={color} fontFamily={fontHauoraMedium} lineHeight={20} fontSize={font}>
          -
        </Text>
        <Text color={color} fontFamily={fontHauoraMedium} lineHeight={20} fontSize={font}>
          {time.split(" - ")[1]}
        </Text>
      </Div>
    );
  };

  const TimeButton: React.FC<{
    a: ExpertAvailability;
    marginTop?: number;
    data: {
      from: string;
      to: string;
    }[];
  }> = ({ a, data, marginTop }) => {
    return (
      <>
        {/* {data.length > 0 && (
          <Text
            w={"100%"}
            px={12}
            mt={marginTop || 0}
            fontFamily={fontHauoraSemiBold}
          >
            {heading}
          </Text>
        )} */}
        {data.length > 0 &&
          data.map((intr, index) => {
            const time = formatTime(a, intr);

            const isDisabled = hasAvailabilityDateTimePassed(
              selectedDate ?? dayjs().format("YYYY-MM-DD"),
              intr.from
            );

            return (
              <Button
                key={`${index}:${a.dayOfWeek ?? a.date}:${time}`}
                w={170}
                maxW={"50%"}
                p={10}
                borderWidth={1}
                borderColor="#E0E0E0"
                rounded={8}
                bg={
                  selectedTime?.label === `${index}:${a.dayOfWeek ?? a.date}:${time}`
                    ? "#222"
                    : "transparent"
                }
                onPress={() => {
                  setSelectedTime({
                    value: { from: intr.from, to: intr.to },
                    label: `${index}:${a.dayOfWeek ?? a.date}:${time}`,
                  });
                }}
                disabled={isDisabled}
              >
                <TimeBtnText
                  time={time}
                  color={
                    selectedTime?.label === `${index}:${a.dayOfWeek ?? a.date}:${time}`
                      ? "#fff"
                      : "#494949"
                  }
                />
                {/* {time} */}
              </Button>
            );
          })}

        {data.length === 0 && (
          <Div w={"100%"} flexDir="row" py={15} flexWrap="wrap" style={{ gap: 8 }}>
            <Text mx={"auto"}>No available slots</Text>
          </Div>
        )}
      </>
    );
  };

  return (
    <Layout
      showBack
      title={expertDetailMap.get(expertId)?.name ?? ""}
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={isLoading}
    >
      <ScrollDiv
        flex={1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={colorPrimary}
            onRefresh={() => handleFetchExpertDetails(true)}
          />
        }
      >
        {/* <Header title="Book a Slot" /> */}

        <Div mb={24}>
          <DoctorCard
            name={expertDetailMap.get(expertId)?.name ?? ""}
            speciality={expertDetailMap.get(expertId)?.designation ?? ""}
            isOnline={expertDetailMap.get(expertId)?.isOnline ?? false}
            image={expertDetailMap.get(expertId)?.profileImg?.url ?? ""}
            verified={true}
          />
        </Div>

        <Div maxW={350} mb={8}>
          <Text
            fontSize={"2xl"}
            fontWeight="bold"
            // fontFamily={fontHauoraSemiBold}
            fontFamily={fontCooper}
            mb={4}
            color="#368526"
          >
            Instant Chat
          </Text>
          <Text color="darkGreyText" mb={6} fontSize={"lg"} fontFamily={fontHauoraMedium}>
            You can easily chat with an expert if they are online
          </Text>
        </Div>

        <Div pb={20}>
          <ButtonPrimary
            bgColor="dark"
            mb={10}
            disabled={!expertDetailMap.get(expertId)?.isOnline || isRequesting}
            loading={isRequesting}
            onPress={handleRequestConsultation}
            icon={<VideoIcon />}
            textColor="#222"
            bg="#6CDE79"
          >
            Video
          </ButtonPrimary>

          <ButtonPrimary
            bgColor="primary"
            mb={10}
            disabled={!expertDetailMap.get(expertId)?.isOnline || isRequesting}
            onPress={() => {
              navigation.navigate("ExpertsChatScreen", {
                expertId: expertDetailMap.get(expertId)?.id ?? "",
                expertName: expertDetailMap.get(expertId)?.name ?? "",
              });
            }}
            icon={<ChatIcon />}
            textColor="#222"
            bg="#B8D7DE"
          >
            Text
          </ButtonPrimary>

          <Text fontSize={"lg"} my={5} fontFamily={fontHauoraMedium} textAlign="center">
            Or book a session for a later time
          </Text>

          <Div>
            <AvailabilityAndDateSelector
              // allAvailability={allAvailability}
              onSelect={handleDateSelect}
            />

            <Div mt={16}>
              <Text
                fontFamily={fontHauoraSemiBold}
                fontSize="xl"
                lineHeight={24}
                color="#222222"
                mb={16}
              >
                Availability
              </Text>

              {availabilityLoading && (
                <Div flex={1}>
                  <Skeleton.Box mt="sm" w={100} h={25} mb={4} rounded={4} />
                  <Div flexDir="row" flexWrap="wrap" style={{ gap: 8 }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton.Box mt="sm" h={40} w={80} rounded={4} key={index} />
                    ))}
                  </Div>
                </Div>
              )}

              {!availabilityLoading &&
                availability.length > 0 &&
                availability.map((a) => {
                  return (
                    <Div key={a.id} pb={12} mb={12} borderBottomWidth={1} borderColor="#E0E0E0">
                      <Text
                        fontFamily={fontHauoraSemiBold}
                        fontSize="xl"
                        lineHeight={24}
                        color="#222222"
                        mb={12}
                        textTransform="capitalize"
                      >
                        {a.dayOfWeek ?? dayjs(a.date).format("ddd, DD MMM")}
                      </Text>

                      {a.intervals.length > 0 && (
                        <Div
                          flexDir="row"
                          flexWrap="wrap"
                          justifyContent="center"
                          style={{ gap: 8 }}
                        >
                          <Div
                            w={"100%"}
                            rounded={40}
                            px={20}
                            py={8}
                            flexDir="row"
                            justifyContent="center"
                            alignItems="center"
                            style={{ columnGap: 12 }}
                          >
                            {timeTabBtns.map((item) => (
                              <TouchableOpacity
                                key={item}
                                onPress={() => {
                                  setActiveTimeTab(item as TimeBtnType);
                                }}
                              >
                                <Button
                                  bg={activeTimeTab === item ? "#222" : "transparent"}
                                  borderWidth={1.5}
                                  borderColor={"#222"}
                                  rounded={100}
                                  px={22}
                                  py={8}
                                  color={activeTimeTab === item ? "#fff" : "#222"}
                                  fontFamily={fontHauoraSemiBold}
                                  pointerEvents="none"
                                  textTransform="capitalize"
                                >
                                  {item}
                                </Button>
                              </TouchableOpacity>
                            ))}
                          </Div>
                          {intervalData && (
                            <TimeButton
                              a={a}
                              data={
                                intervalData[activeTimeTab.toLowerCase() as keyof IntervalStateType]
                              }
                            />
                          )}
                          {/* <TimeButton a={a} data={noonTimings} marginTop={5} />
                          <TimeButton
                            a={a}
                            data={eveningTimings}
                            marginTop={5}
                          /> */}
                        </Div>
                      )}

                      {a.intervals.length === 0 && (
                        <Div flexDir="row" flexWrap="wrap" style={{ gap: 8 }}>
                          <Text>No availability</Text>
                        </Div>
                      )}
                    </Div>
                  );
                })}

              {!availabilityLoading && availability.length === 0 && <Text>No availability</Text>}
            </Div>
          </Div>
        </Div>
      </ScrollDiv>
      <ButtonPrimary
        onPress={handleScheduleConsultation}
        disabled={isActionLoading || !selectedTime}
        loading={isActionLoading}
      >
        Proceed
      </ButtonPrimary>
    </Layout>
  );
};

export default ExpertsListDetailScreen;
