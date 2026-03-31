import Layout from "@/components/app/Layout";
import AvailabilityAndDateSelector from "@/components/partials/AvailabilityAndDateSelector";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import DoctorCard from "@/components/partials/DoctorCard";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { usePartnerStore } from "@/store/modules/partner";
import { IntervalStateType, NavigationType } from "@/store/types";
import { ExpertAvailability } from "@/store/types/expert";
import { hasAvailabilityDateTimePassed } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, TouchableOpacity } from "react-native";
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
type TimeBtnType = "morning" | "noon" | "evening";
const timeTabBtns = ["morning", "noon", "evening"];

const PartnerVetDetailScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { partnerVetDetails, fetchPartnerVetDetails, fetchPartnerVetAvailability } =
    usePartnerStore();

  const bookingId = (route.params as Record<string, string | undefined>)?.bookingId;
  const caseId = (route.params as Record<string, string>)?.caseId;
  const partnerId = (route.params as Record<string, string>)?.partnerId;
  const partnerName = (route.params as Record<string, string>)?.partnerName;
  const vetId = (route.params as Record<string, string>)?.vetId;
  const backTo = (route.params as Record<string, string>)?.backTo;
  const selectedServices = (
    route.params as {
      selectedServices: { id: string; label: string; price: number }[];
    }
  )?.selectedServices;
  const isReschedule = (route.params as Record<string, boolean>)?.isReschedule;
  const [availability, setAvailability] = useState<ExpertAvailability[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedTime, setSelectedTime] = useState<{
    value: { from: string; to: string };
    label: string;
  } | null>(null);
console.log("000000000000000000000000000000000000000000000000000000")
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const [activeTimeTab, setActiveTimeTab] = useState<TimeBtnType>(timeTabBtns[0] as TimeBtnType);
  const [intervalData, setIntervalData] = useState<IntervalStateType | null>(null);

  const partnerDetails = useMemo(() => {
    return partnerVetDetails.get(vetId);
  }, [partnerVetDetails, vetId]);

  useEffect(() => {
    handleFetchExpertDetails();
  }, [partnerId, vetId]);

  const handleFetchExpertDetails = async (isRefresh?: boolean) => {
    try {
      setIsLoading(true);

      if (!partnerDetails) {
        const details = await fetchPartnerVetDetails(vetId, partnerId);
      }

      handleDateSelect(dayjs().format("YYYY-MM-DD"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    try {
      if (selectedDate !== date) {
        setSelectedTime(null);
      }

      setAvailabilityLoading(true);
      setSelectedDate(date);

      const _availability = await fetchPartnerVetAvailability(vetId, partnerId, new Date(date));

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

  const formatTime = useCallback(
    (availability: ExpertAvailability, interval: { from: string; to: string }) => {
      const date = availability.dayOfWeek
        ? dayjs().day(dayOfWeekMap[availability.dayOfWeek]).format("YYYY-MM-DD")
        : "";

      const fromTime = dayjs(`${date}T${interval.from}Z`).format("hh:mm A");
      const toTime = dayjs(`${date}T${interval.to}Z`).format("hh:mm A");

      return `${fromTime} - ${toTime}`;
    },
    []
  );

  const handleProceed = async () => {
    if (!selectedDate || !selectedTime) {
      return;
    }

    const _date = dayjs(selectedDate).format("YYYY-MM-DD");

    const scheduleAt = dayjs(
      _date.toString() + "T" + dayjs(`${_date}T${selectedTime.value.from}Z`).format("HH:mm")
    )
      .utc()
      .format();

    navigation.navigate("PartnerVetConfirmationScreen", {
      from: "PartnerVetDetailScreen",
      bookingId,
      vetId,
      partnerId,
      partnerName,
      selectedTime: JSON.stringify(selectedTime?.value),
      selectedDate,
      caseId,
      scheduleAt,
      selectedServices,
      isReschedule,
    });
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
              <>
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
              </>
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
      title={partnerDetails?.name}
      onBackPress={() => {
        if (backTo) {
          navigation.navigate(backTo);
        } else {
          navigation.goBack();
        }
      }}
      loading={isLoading}
    >
      <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
        <Div mb={24}>
          <DoctorCard
            name={partnerDetails?.name ?? ""}
            speciality={partnerDetails?.designation ?? ""}
            experience={partnerDetails?.yearsOfExperience ?? 0}
            image={partnerDetails?.profileImg?.url ?? ""}
            verified={true}
          />
        </Div>

        <Div maxW={350} mb={20}>
          <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} mb={4}>
            Address - {partnerDetails?.partnerName}
          </Text>
          <Text color="darkGreyText" mb={6} fontSize={"lg"} fontFamily={fontHauoraMedium}>
            {partnerDetails?.partnerAddress}
          </Text>
        </Div>

        <Div pb={20} borderTopWidth={1} borderColor="#D0D7DC">
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
                    {Array.from({ length: 4 }).map(() => (
                      <Skeleton.Box mt="sm" h={40} w={80} rounded={4} />
                    ))}
                  </Div>
                </Div>
              )}

              {!availabilityLoading &&
                availability.length > 0 &&
                availability.map((a) => (
                  <Div
                    key={a.dayOfWeek || a.date}
                    pb={12}
                    mb={12}
                    borderBottomWidth={1}
                    borderColor="#E0E0E0"
                  >
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
                      <Div flexDir="row" flexWrap="wrap" justifyContent="center" style={{ gap: 8 }}>
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
                ))}

              {!availabilityLoading && availability.length === 0 && <Text>No availability</Text>}
            </Div>
          </Div>
        </Div>
      </ScrollDiv>
      <ButtonPrimary
        disabled={isActionLoading || !selectedTime}
        loading={isActionLoading}
        onPress={handleProceed}
      >
        Proceed
      </ButtonPrimary>
    </Layout>
  );
};

export default PartnerVetDetailScreen;
