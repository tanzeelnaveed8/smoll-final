import Layout from "@/components/app/Layout";
import CallIcon from "@/components/icons/CallIcon";
import DotIcon from "@/components/icons/DotIcon";
import LocationIcon from "@/components/icons/LocationIcon";
import MessageIcon from "@/components/icons/MessageIcon";
import WalletIcon from "@/components/icons/WalletIcon";
import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import {
  colorPrimary,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeading,
} from "@/constant/constant";
import { useAppointmentStore } from "@/store/modules/appointments";
import { NavigationType } from "@/store/types";
import { AppointmentDetailResponseDto } from "@/store/types/appointments";
import { useRoute } from "@react-navigation/native";
import {
  IconArrowRight,
  IconCalendarClock,
  IconHelpCircle,
  IconReceipt,
  IconUser,
  IconUserX,
} from "@tabler/icons-react-native";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ActivityIndicator, Linking, TouchableOpacity } from "react-native";
import { Button, Div, Image, ScrollDiv, Tag, Text } from "react-native-magnus";

const actionBtn = [
  {
    icon: (color?: string) => (
      <IconCalendarClock width={30} height={30} color={color || "#679FF0"} />
    ),
    text: "Reschedule",
  },
  {
    icon: (color?: string) => <IconUserX width={30} height={30} color={"#679FF0"} />,
    text: "Cancel",
  },
];

const AppointmentDetailsScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();

  const id = (route.params as { id: string })?.id;
  const type = (route.params as { type: string })?.type;

  const { fetchAppointmentDetail, cancelAppointment, cancelConsultation } = useAppointmentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [contactBtns, setContactBtns] = useState<
    {
      icon: React.ReactNode;
      text: string;
      link: string;
    }[]
  >([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [appointmentDetail, setAppointmentDetail] = useState<AppointmentDetailResponseDto | null>(
    null
  );

  const selectedServicesAmount = useMemo(() => {
    return (
      appointmentDetail?.services?.reduce((acc, service) => {
        return acc + service.price;
      }, 0) ?? 0
    );
  }, [appointmentDetail]);

  console.log("selectedServicesAmount:", selectedServicesAmount);

  const bookingCharges = useMemo(() => {
    const amount = (selectedServicesAmount ?? 0) * 0.229 + 1;
    return amount;
  }, [selectedServicesAmount]);

  console.log("bookingCharges:", bookingCharges);

  const [isJoinEnabled, setIsJoinEnabled] = useState(false);

  const checkJoinButtonStatus = useCallback(() => {
    if (!appointmentDetail?.scheduledAt) return false;
    const appointmentTime = dayjs(appointmentDetail.scheduledAt);
    const currentTime = dayjs();
    // Enable the button 5 minutes before and up to 30 minutes after the scheduled time
    return (
      currentTime.isAfter(appointmentTime.subtract(30, "seconds")) &&
      currentTime.isBefore(appointmentTime.add(30, "minute"))
    );
  }, [appointmentDetail?.scheduledAt]);

  useEffect(() => {
    if (appointmentDetail?.type === "video") {
      const intervalId = setInterval(() => {
        setIsJoinEnabled(checkJoinButtonStatus());
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [appointmentDetail, checkJoinButtonStatus]);

  useEffect(() => {
    if (!appointmentDetail) return;

    setContactBtns([]);
    const copy = [];

    if (appointmentDetail?.partner?.phone) {
      copy.push({
        icon: <CallIcon />,
        text: "Contact",
        link: `tel:${appointmentDetail?.partner?.phone}`,
      });
    }

    if (appointmentDetail?.partner?.email) {
      copy.push({
        icon: <MessageIcon />,
        text: "Email",
        link: `mailto:${appointmentDetail?.partner?.email}`,
      });
    }

    if (appointmentDetail?.partner?.address) {
      copy.push({
        icon: <LocationIcon />,
        text: "Location",
        link: `https://www.google.com/maps/search/?api=1&query=${appointmentDetail?.partner?.address}`,
      });
    }

    setContactBtns(copy);
  }, [appointmentDetail]);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);

      const data = await fetchAppointmentDetail(id, type as "in-clinic" | "video");

      console.log(JSON.stringify(data, null, 2));

      setAppointmentDetail(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    try {
      setDeleteLoading(true);

      if (appointmentDetail?.type === "video") {
        await cancelConsultation(id);
      } else {
        await cancelAppointment(id);
      }

      setShowCancelModal(false);
      setDeleteLoading(false);

      navigation.navigate("AppointmentsScreen");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRescheduleBooking = async () => {
    if (!appointmentDetail) return;

    try {
      setRescheduleLoading(true);

      navigation.navigate("PartnerVetScreen", {
        bookingId: id,
        partnerId: appointmentDetail.partner.id,
        partnerName: appointmentDetail?.partner?.name,
        caseId: appointmentDetail.caseId,
        selectedServices: appointmentDetail.services,
        backTo: "HomeScreen",
        isReschedule: true,
      });

      setShowRescheduleModal(false);
    } finally {
      setRescheduleLoading(false);
    }
  };

  const renderBottomContent = () => {
    return (
      <Div bg="bgColor" pb={20}>
        <Image
          source={require("../../assets/images/appointment-details-bg.png")}
          w={"100%"}
          h={50}
        />

        <Div px={20} mt={20}>
          <Div flexDir="row" style={{ gap: 8 }} mb={10}>
            <IconHelpCircle width={20} height={20} color="#222" />
            <Text fontSize={"sm"} fontFamily={fontHauoraBold} mt={2}>
              Help
            </Text>
          </Div>

          <Div flexDir="row" justifyContent="space-between" alignItems="flex-start" pb={10}>
            <Div>
              <Text fontSize={"sm"} fontFamily={fontHauoraBold} mb={3} color="#959594">
                Call us on 08:00 ~ 19:00
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("https://wa.me/+971585598910");
                  // Linking.openURL("tel:+97144510090");
                }}
              >
                <Text fontSize={"xl"} fontFamily={fontHauoraBold}>
                  +971 58 559 8910
                </Text>
              </TouchableOpacity>
            </Div>

            <Text fontSize={"sm"} fontFamily={fontHauoraBold}>
              or
            </Text>

            <Div>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("mailto:care@smoll.me");
                }}
              >
                <Text fontSize={"sm"} fontFamily={fontHauoraBold} mb={3} color="#959594">
                  Send us an email
                </Text>
                <Text fontSize={"xl"} fontFamily={fontHauoraBold}>
                  care@smoll.me
                </Text>
              </TouchableOpacity>
            </Div>
          </Div>
        </Div>
      </Div>
    );
  };

  return (
    <>
      <Layout
        title="Appointment Details"
        showBack
        style={{ paddingBottom: 0 }}
        onBackPress={() => navigation.navigate("AppointmentsScreen")}
      >
        {!isLoading && appointmentDetail && (
          <ScrollDiv showsVerticalScrollIndicator={false}>
            <Div flex={1}>
              <Div alignSelf="center" bg="#EFE9DB" px={25} py={7} rounded={20} mb={20}>
                <Text fontFamily={fontHauoraMedium} fontSize={"md"}>
                  {appointmentDetail?.caseId}
                </Text>
              </Div>
              <Div flex={1} pt={20}>
                <Div flex={1}>
                  <Div
                    justifyContent="center"
                    alignItems="center"
                    mb={24}
                    pb={26}
                    borderBottomWidth={1}
                    borderColor="#D0D7DC"
                  >
                    {appointmentDetail?.vet?.profileImg?.url ? (
                      <Image
                        w={100}
                        h={100}
                        rounded={100}
                        mx={"auto"}
                        mb={8}
                        src={appointmentDetail?.vet?.profileImg?.url}
                      />
                    ) : appointmentDetail.isEmergency ? (
                      <Image
                        w={100}
                        h={100}
                        rounded={100}
                        mx={"auto"}
                        mb={8}
                        source={require("@/assets/images/emergency-icon.png")}
                      />
                    ) : (
                      <Div
                        mb={8}
                        bg="#eeeeee"
                        w={100}
                        h={100}
                        rounded={100}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <IconUser width={"60%"} height={"60%"} color={"#fff"} />
                      </Div>
                    )}

                    <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} lineHeight={24} mb={4}>
                      {appointmentDetail?.isEmergency
                        ? "Emergency Appointment"
                        : appointmentDetail?.vet?.name}
                    </Text>

                    {appointmentDetail?.type !== "video" && !appointmentDetail?.isEmergency && (
                      <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold}>
                        {appointmentDetail?.vet?.designation ?? "-"}
                      </Text>
                    )}

                    <Div mb={16} mt={12} flexDir="row" justifyContent="center">
                      <Tag
                        fontSize={"sm"}
                        fontFamily={fontHauoraSemiBold}
                        px={8}
                        py={6}
                        rounded={37}
                        borderWidth={1}
                        borderColor="#222"
                        bg="transparent"
                      >
                        {appointmentDetail?.type === "video"
                          ? "Video Consultation"
                          : "Clinic Visit"}
                      </Tag>

                      {appointmentDetail?.isEmergency && (
                        <Tag
                          fontSize={"sm"}
                          fontFamily={fontHauoraSemiBold}
                          px={8}
                          py={6}
                          ml={10}
                          rounded={37}
                          borderWidth={1}
                          borderColor="#E02A2A"
                          bg="#E02A2A"
                          color="#fff"
                        >
                          Emergency
                        </Tag>
                      )}
                    </Div>

                    <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold} mb={8}>
                      Appointment On
                    </Text>

                    <Text
                      fontSize={"xl"}
                      fontFamily={fontHauoraSemiBold}
                      lineHeight={24}
                      color="primary"
                    >
                      {appointmentDetail?.scheduledAt &&
                        dayjs(appointmentDetail?.scheduledAt).format(
                          `DD MMM YYYY ${appointmentDetail?.isEmergency ? "" : ", hh:mm A"}`
                        )}
                    </Text>

                    {appointmentDetail?.type === "video" && (
                      <ButtonPrimary
                        disabled={!isJoinEnabled}
                        mt={24}
                        onPress={() => {
                          navigation.navigate("ConsultationWaitingScreen", {
                            consultationId: appointmentDetail.id,
                            caseId: appointmentDetail.caseId,
                            expertId: appointmentDetail.vet?.id,
                            petName: appointmentDetail.pet?.name,
                          });
                        }}
                      >
                        Join
                      </ButtonPrimary>
                    )}
                  </Div>

                  <Div pb={25} mb={18} borderBottomWidth={1} borderColor="#D0D7DC">
                    {!isLoading &&
                      appointmentDetail &&
                      appointmentDetail?.type.toLowerCase().includes("clinic") && (
                        <Div pb={16} mb={24} borderBottomWidth={1} borderColor="#D0D7DC">
                          <Text
                            fontSize={"sm"}
                            fontFamily={fontHauoraSemiBold}
                            color="darkGreyText"
                            mb={8}
                          >
                            Clinic Information
                          </Text>

                          <Div flexDir="row" alignItems="flex-start">
                            <Div w={"50%"} mb={8} justifyContent="space-between">
                              <TouchableOpacity
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  columnGap: 5,
                                }}
                                onPress={() => {
                                  navigation.navigate("ClinicDetailScreen", {
                                    id: appointmentDetail?.partner?.id,
                                  });
                                }}
                              >
                                <Text fontSize={"lg"} mb={8} fontFamily={fontHauoraSemiBold}>
                                  {appointmentDetail?.partner?.name ?? "-"}
                                </Text>

                                <IconArrowRight
                                  width={15}
                                  height={16}
                                  color="#222"
                                  style={{ marginTop: -2 }}
                                />
                              </TouchableOpacity>

                              <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                                {appointmentDetail?.partner?.address ?? "-"}
                              </Text>
                            </Div>

                            <Div w={"50%"} flexDir="row" mt={-4} pr={30} style={{ gap: 20 }}>
                              {contactBtns.map((item, i) => (
                                <TouchableOpacity
                                  key={i}
                                  onPress={() => {
                                    Linking.openURL(item.link);
                                  }}
                                >
                                  <Div
                                    style={{ gap: 8, height: 50 }}
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    {item.icon}
                                    <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold}>
                                      {item.text}
                                    </Text>
                                  </Div>
                                </TouchableOpacity>
                              ))}
                            </Div>
                          </Div>
                        </Div>
                      )}

                    <Text
                      fontSize={"sm"}
                      fontFamily={fontHauoraSemiBold}
                      color="darkGreyText"
                      mb={8}
                    >
                      Pet
                    </Text>

                    <Div flexDir="row" alignItems="center" mb={28}>
                      <Div>
                        <Image
                          w={48}
                          h={48}
                          rounded={48}
                          mr={8}
                          src={appointmentDetail?.pet?.photos[0]?.url}
                        />
                      </Div>

                      <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold}>
                        {appointmentDetail?.pet?.name}
                      </Text>
                    </Div>

                    <Div
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 14,
                        // justifyContent: "space-between",
                      }}
                    >
                      {actionBtn.map((item) => {
                        if (appointmentDetail?.type === "video") {
                          return null;
                        }

                        if (
                          (appointmentDetail?.isEmergency && item.text === "Reschedule") ||
                          (item.text === "Reschedule" &&
                            appointmentDetail.scheduledAt &&
                            dayjs().isAfter(dayjs(appointmentDetail.scheduledAt)))
                        ) {
                          return null;
                        }

                        if (
                          item.text === "Cancel" &&
                          !appointmentDetail.isEmergency &&
                          appointmentDetail.scheduledAt &&
                          dayjs().isAfter(dayjs(appointmentDetail.scheduledAt))
                        ) {
                          return null;
                        }

                        return (
                          <Div
                            mx={
                              !appointmentDetail.isEmergency && item.text === "Cancel" ? "auto" : 0
                            }
                            key={item.text}
                          >
                            <TouchableOpacity
                              disabled={Boolean(rescheduleLoading)}
                              key={item.text}
                              onPress={() => {
                                if (item.text.includes("Cancel")) {
                                  setShowCancelModal(true);
                                } else if (item.text.includes("Reschedule")) {
                                  setShowRescheduleModal(true);
                                }
                              }}
                            >
                              <Button
                                bg="transparent"
                                p={0}
                                pointerEvents="none"
                                flexDir="row"
                                style={{ gap: 8 }}
                                alignItems="center"
                              >
                                {item.icon()}
                                <Text
                                  fontSize={"xl"}
                                  fontFamily={fontHauoraSemiBold}
                                  color={"primary"}
                                >
                                  {item.text}
                                </Text>
                              </Button>
                            </TouchableOpacity>
                          </Div>
                        );
                      })}
                    </Div>
                  </Div>

                  {appointmentDetail?.type !== "video" && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          if (!appointmentDetail) return;
                          navigation.navigate("CaseQuoteDescriptionScreen", {
                            id: appointmentDetail?.partner?.id,
                            caseId: appointmentDetail?.caseId,
                            hasPartnerBooking: true,
                          });
                        }}
                      >
                        <Div pl={2} flexDir="row" alignItems="center" style={{ gap: 6 }} mb={20}>
                          <IconReceipt width={20} height={20} color="#222" />
                          <Text fontSize={"sm"} fontFamily={fontHauoraBold}>
                            Approved Quotation
                          </Text>
                          <IconArrowRight
                            width={15}
                            height={16}
                            color="#222"
                            style={{ marginTop: 3 }}
                          />
                        </Div>
                      </TouchableOpacity>

                      <Div bg="#EFE9DB" rounded={22} px={22} py={18} flex={1} maxW={"50%"} mb={20}>
                        <Text mb={6} fontSize={"sm"} fontFamily={fontHauoraMedium}>
                          You have paid
                        </Text>
                        <Text fontSize={"5xl"} fontFamily={fontHauoraBold} lineHeight={30}>
                          {bookingCharges?.toFixed(2)}
                          <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                            {" "}
                            AED
                          </Text>
                        </Text>
                      </Div>

                      <Div
                        style={{
                          marginLeft: 28,
                          marginVertical: 6,
                        }}
                      >
                        <DotIcon />
                      </Div>

                      <Div
                        flexDir="row"
                        alignItems="center"
                        justifyContent="space-around"
                        style={{ gap: 20 }}
                      >
                        <Div pl={16} flexDir="row" alignItems="flex-end" mb={20}>
                          <Div>
                            <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                              To be paid at clinic
                            </Text>
                            <Text fontSize={"5xl"} fontFamily={fontHauoraBold} lineHeight={36}>
                              {(selectedServicesAmount - bookingCharges).toFixed(2)}
                              <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                                {" "}
                                AED
                              </Text>
                            </Text>
                          </Div>
                        </Div>

                        <Div style={{ gap: 2 }}>
                          <WalletIcon mb={4} width={30} height={30} />
                          <Text
                            fontSize={"xs"}
                            lineHeight={15}
                            fontFamily={fontHauoraSemiBold}
                            maxW={180}
                          >
                            Final balance to be paid at the clinic, depending on services received.
                          </Text>
                        </Div>
                      </Div>
                    </>
                  )}
                </Div>
              </Div>
            </Div>

            <Div h={10} />

            {!isLoading && appointmentDetail?.type === "in-clinic" && renderBottomContent()}
          </ScrollDiv>
        )}

        {isLoading && (
          <Div justifyContent="center" alignItems="center" h={"90%"}>
            <ActivityIndicator size="large" color="primary" />
          </Div>
        )}
      </Layout>

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
            Are you sure you want to cancel your appointment with Dr. {appointmentDetail?.vet?.name}
            ?
          </Text>

          <ButtonPrimary
            bgColor="danger"
            mb={12}
            onPress={handleDeleteBooking}
            loading={deleteLoading}
            disabled={deleteLoading}
          >
            Yes, Cancel
          </ButtonPrimary>

          <ButtonPrimary
            bgColor="primary"
            onPress={() => {
              setShowCancelModal(false);
            }}
            disabled={deleteLoading}
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
    </>
  );
};

export default AppointmentDetailsScreen;
