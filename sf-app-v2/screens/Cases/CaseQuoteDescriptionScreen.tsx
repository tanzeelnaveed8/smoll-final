import Layout from "@/components/app/Layout";
import CaseQuoteDescriptionModalIcon from "@/components/icons/CaseQuoteDescriptionModalIcon";
import EssentialCheckIcon from "@/components/icons/EssentialCheckIcon";
import InformationIcon from "@/components/icons/InformationIcon";
import BottomSheet from "@/components/partials/BottomSheet";
import {
  fontCooper,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useCaseStore } from "@/store/modules/case";
import { NavigationType } from "@/store/types";
import { CaseQuotesDto } from "@/store/types/case";
import { useRoute } from "@react-navigation/native";
import { IconArrowRight, IconInfoCircleFilled } from "@tabler/icons-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { Button, Div, ScrollDiv, Text } from "react-native-magnus";
import CollapsibleView from "./CollapsibleView";
import QuoteDescriptionInfoIcon from "@/components/icons/QuoteDescriptionInfoIcon";

const serviceTypes = [
  {
    title: "Essential",
    text: "Must be performed and can not be deselected",
    icon: <EssentialCheckIcon width={13} height={14} />,
  },
  {
    title: "Contingent",
    text: "Subject to an essential service and can not be deselected",
    icon: <EssentialCheckIcon fill="#FFC433" color="#222" width={13} height={14} />,
  },
  {
    title: "Recommended",
    text: "Vet recommended up to you to decide and you can deselect it if you want",
    icon: <EssentialCheckIcon fill="#014EF7" color="#fff" width={13} height={14} />,
  },
];

const CaseQuoteDescriptionScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { casesQuotes, fetchCaseQuotes } = useCaseStore();

  const id = (route.params as Record<string, string>)?.id;
  const caseId = (route.params as Record<string, string>)?.caseId;
  const hasPartnerBooking = (route.params as Record<string, string>)?.hasPartnerBooking;

  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState<
    { id: string; label: string; price: number }[]
  >([]);
  const [showQuotesWork, setShowQuotesWork] = useState(false);

  const caseQuote = casesQuotes.get(caseId);

  useEffect(() => {
    fetchQuotes();
  }, [id, caseId]);

  const clinicQuote = useMemo(() => {
    return caseQuote?.find((q) => q.partner.id === id);
  }, [caseQuote]);

  useEffect(() => {
    if (!clinicQuote) return;
    const servicesData = clinicQuote.services.map((item) => {
      return { id: item.id, label: item.label, price: item.price };
    });

    setSelectedServices(servicesData);
  }, [clinicQuote]);

  const handleSelectService = (id: string) => {
    if (selectedServices.find((item) => item.id === id)) {
      const updatedServices = selectedServices.filter((item) => item.id !== id);
      setSelectedServices(updatedServices);
    } else {
      const newService = clinicQuote?.services.filter((item) => item.id === id)?.pop();

      if (!newService) return;
      const serviceObj = {
        label: newService.label,
        id: newService.id,
        price: newService.price,
      };
      setSelectedServices([...selectedServices, serviceObj]);
    }
  };

  const fetchQuotes = async () => {
    try {
      setLoading(true);

      await fetchCaseQuotes(caseId);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuote = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0);
  };

  const getMinQuote = (caseQuotes?: CaseQuotesDto) => {
    let q = 0;

    caseQuotes?.services?.forEach((service) => {
      if (service.label !== "Recommended") {
        q += service.price;
      }
    });

    return q;
  };

  return (
    <Layout
      showBack
      backBtnText=""
      title="Case"
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={loading}
    >
      <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} mb={20}>
        Service Details
      </Text>

      <Div flex={1} py={16} px={20} borderWidth={1} borderColor="#222" rounded={28} mb={20}>
        <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold}>
          {clinicQuote?.partner?.name}
        </Text>

        {/* <PartnerVetStarRating rating={4} color="" /> */}

        <Text
          fontSize={"md"}
          color="darkGreyText"
          fontFamily={fontHauoraSemiBold}
          mb={20}
          maxW={250}
        >
          {clinicQuote?.partner?.address}
        </Text>

        <Div mb={24} flexDir="row" justifyContent="space-between" alignItems="center">
          <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold}>
            Service
          </Text>

          {!hasPartnerBooking && (
            <Div flexDir="row" alignItems="center" style={{ gap: 12 }}>
              {serviceTypes.map((item) => (
                <Div key={item.title} flexDir="row" alignItems="center" style={{ gap: 4 }}>
                  {item.icon}

                  <Text fontSize={9} fontFamily={fontHauoraSemiBold}>
                    {item.title}
                  </Text>
                </Div>
              ))}
            </Div>
          )}
        </Div>

        <Div flex={1}>
          <ScrollDiv
            borderBottomWidth={2}
            borderBottomColor="#222"
            showsVerticalScrollIndicator={false}
          >
            {clinicQuote?.services.map((item, i) => (
              <Div mb={16} key={i}>
                <ProposalDetailCard
                  key={item.id}
                  id={item.id}
                  servicesName={item.name}
                  type={item.label}
                  tagType={item.type}
                  price={item.price}
                  description={item.description}
                  borderWidth={clinicQuote?.services.length === i + 1 ? 0 : 1}
                  selectedServices={selectedServices}
                  onSelect={() => {
                    handleSelectService(item.id);
                  }}
                  hasPartnerBooking={Boolean(hasPartnerBooking)}
                />
              </Div>
            ))}
          </ScrollDiv>

          <Div>
            <Div pt={15} flexDir="row" justifyContent="space-between" alignItems="center">
              <Div flexDir="row" alignItems="flex-end" mb={8}>
                <Div>
                  <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                    Minimum
                  </Text>
                  <Text fontSize={"5xl"} fontFamily={fontHauoraBold} lineHeight={36}>
                    {getMinQuote(clinicQuote)}
                    <Text fontSize={"lg"} fontFamily={fontHauoraMedium}>
                      {" "}
                      AED
                    </Text>
                  </Text>
                </Div>

                <Div w={80} h={1} mx={20} mb={8} bg="#222" />

                <Div>
                  <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                    Maximum
                  </Text>

                  <Text fontSize={"5xl"} fontFamily={fontHauoraBold} lineHeight={36}>
                    {getTotalQuote()}
                    <Text fontSize={"lg"} fontFamily={fontHauoraMedium}>
                      {" "}
                      AED
                    </Text>
                  </Text>
                </Div>
              </Div>
            </Div>

            <Text fontSize={"2xl"} fontFamily={fontCooper} mb={10}>
              Upfront transparent pricing
            </Text>
          </Div>
        </Div>
      </Div>
      {/* </ScrollDiv> */}

      {/* <ButtonPrimary
        onPress={() => {
          if (hasPartnerBooking) {
            navigation.goBack();
          } else {
            navigation.navigate("PartnerVetScreen", {
              partnerId: clinicQuote?.partner?.id,
              partnerName: clinicQuote?.partner?.name,
              caseId,
              selectedServices,
            });
          }
        }}
      >
        {hasPartnerBooking ? "Go Back" : "Make an Appointment"}
      </ButtonPrimary> */}

      <Button
        bg="transparent"
        borderWidth={2}
        // alignItems="flex-end"
        rounded={30}
        borderColor="#222"
        disabled={getMinQuote(clinicQuote) < 1}
        py={16}
        w={"100%"}
        onPress={() => {
          if (hasPartnerBooking) {
            navigation.navigate("AppointmentsScreen");
          } else {
            if (clinicQuote?.isEmergency || clinicQuote?.isDirectEscalated) {
              navigation.navigate("EmergencyScreen", {
                isEmergency: clinicQuote?.isEmergency,
                isDirectEscalated: clinicQuote?.isDirectEscalated,
                partnerId: clinicQuote?.partner?.id,
                partnerName: clinicQuote?.partner?.name,
                partnerVetId: clinicQuote?.meta?.partnerVetId,
                scheduleAt: clinicQuote?.meta?.scheduledAt,
                caseId,
                selectedServices,
                petName: clinicQuote?.petName,
              });
            } else {
              navigation.navigate("PartnerVetScreen", {
                partnerId: clinicQuote?.partner?.id,
                partnerName: clinicQuote?.partner?.name,
                caseId,
                selectedServices,
              });
            }
          }
        }}
      >
        <Text color="#222" fontSize={"2xl"} fontFamily={fontHauoraSemiBold}>
          {hasPartnerBooking ? "Appointments" : "Proceed"}
        </Text>

        {!hasPartnerBooking && (
          <IconArrowRight
            width={30}
            height={30}
            color={"#222"}
            style={{ marginBottom: -5, marginLeft: 7 }}
          />
        )}
      </Button>
      <Div flexDir="row" alignItems="center" justifyContent="center" style={{ gap: 1 }} mt={8}>
        {/* <IconCircleCheckFilled
          width={16}
          height={16}
          color={"#fff"}
          fill={"#000"}
        /> */}
        <TouchableOpacity onPress={() => setShowQuotesWork(true)}>
          <Div flexDir="row" alignItems="center" style={{ gap: 1 }}>
            {/* <IconInfoCircleFilled
              width={16}
              height={16}
              color={"#fff"}
              fill={"#000"}
            /> */}
            <QuoteDescriptionInfoIcon />
            <Text ml={3} fontSize={"sm"} mt={-1} fontFamily={fontHauoraMedium}>
              Understand how quotes work
            </Text>
          </Div>
        </TouchableOpacity>
      </Div>

      <BottomSheet
        isVisible={showQuotesWork}
        h={400}
        showCloseIcon
        closeButtonStyle={{
          marginLeft: "auto",
          marginBottom: 0,
        }}
        onCloseIconClick={() => {
          setShowQuotesWork(false);
        }}
        barMb={10}
        roundedTop={40}
      >
        <Div px={10}>
          <Div flexDir="row" alignItems="flex-start" mb={22}>
            <InformationIcon width={28} height={28} />
            <Text
              fontSize={"md"}
              ml={8}
              fontFamily={fontHauoraBold}
              style={{ position: "relative", top: 4 }}
            >
              How Quotations work?
            </Text>
          </Div>
        </Div>

        <CaseQuoteDescriptionModalIcon />
      </BottomSheet>
    </Layout>
  );
};

export default CaseQuoteDescriptionScreen;

const ProposalDetailCard: React.FC<{
  servicesName: string;
  id: string;
  price: number;
  type: string;
  description: string;
  selectedServices: { id: string; label: string }[];
  onSelect: () => void;
  borderWidth?: number;
  hasPartnerBooking?: boolean;
  tagType: string;
}> = ({
  id,
  servicesName,
  type,
  price,
  description,
  onSelect,
  selectedServices,
  borderWidth,
  hasPartnerBooking,
  tagType,
}) => {
  const [typeStyles, setTypeStyles] = useState({
    bg: "#E7F3F7",
    color: "#222",
  });

  useEffect(() => {
    if (type === "Essential") {
      setTypeStyles({ bg: "#848484", color: "#fff" });
    } else if (type === "Recommended") {
      setTypeStyles({ bg: "#10AFE1", color: "#fff" });
    } else if (type === "Continget" || type === "Contigent") {
      setTypeStyles({ bg: "#FFC400", color: "#222" });
    }
  }, [type]);

  return (
    <Div pb={16} borderBottomWidth={borderWidth} borderColor="#D0D7DC">
      <Div
        style={{
          flexDirection: "row",
        }}
      >
        <TouchableOpacity
          onPress={onSelect}
          disabled={hasPartnerBooking}
          style={{
            pointerEvents: type === "Recommended" ? "auto" : "none",
            marginTop: Platform.OS === "ios" ? 4 : 6,
            marginRight: 8,
          }}
        >
          {type === "Essential" && <EssentialCheckIcon />}
          {type === "Recommended" && (
            <>
              {selectedServices.find((item) => item.id === id) ? (
                <EssentialCheckIcon fill="#014EF7" color="#fff" />
              ) : (
                <Div w={16} h={17} rounded={100} borderWidth={1.5} borderColor="#014EF7" />
              )}
            </>
          )}
          {(type === "Contingent" || type === "Contigent") && (
            <EssentialCheckIcon fill="#FFC433" color="#222" />
          )}
        </TouchableOpacity>

        <CollapsibleView
          type={type}
          servicesName={servicesName}
          price={price}
          description={description}
          key={id}
          tagType={tagType}
        />
      </Div>
    </Div>
  );
};
