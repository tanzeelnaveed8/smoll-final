import Layout from "@/components/app/Layout";
import StarRating from "@/components/partials/StarRating";
import {
  colorErrorText,
  colorGray49,
  colorPrimary,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useCaseStore } from "@/store/modules/case";
// import { useCaseStore } from "@/store/modules/case";
// import { useCasesStore } from "@/store/modules/case";
import { NavigationType } from "@/store/types";
import { CaseQuotesDto } from "@/store/types/case";
import { useRoute } from "@react-navigation/native";
import { IconHome } from "@tabler/icons-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { Div, Image, Tag, Text } from "react-native-magnus";
import { IconArrowRight } from "@tabler/icons-react-native";
import { useUserStore } from "@/store/modules/user";

const CaseQuotesScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const caseId = (route.params as Record<string, string>)?.id;
  const hasPartnerBooking = (route.params as Record<string, string>)?.hasPartnerBooking;

  const { fetchCaseQuotes, casesQuotes } = useCaseStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setRefresh] = useState(false);

  const caseQuotes = useMemo(() => casesQuotes.get(caseId), [caseId, casesQuotes]);

  const { readQuotation, SET_NAV_NOTIF, navNotif } = useUserStore();

  useEffect(() => {
    handleFetchRequests();
  }, []);

  const getTotalQuote = (caseQuotes: CaseQuotesDto) => {
    const q = caseQuotes.services.reduce((total, curr) => {
      return total + curr.price;
    }, 0);

    return q;
  };

  const getMinQuote = (caseQuotes: CaseQuotesDto) => {
    let q = 0;
    caseQuotes.services.forEach((service) => {
      if (service.label !== "Recommended") {
        q += service.price;
      }
    });

    return q;
  };

  const handleFetchRequests = async (isRefreshing?: boolean) => {
    const caseQuotes = casesQuotes.get(caseId);

    if (caseQuotes?.length && !isRefreshing) {
      return;
    }

    try {
      if (isRefreshing) {
        setRefresh(true);
      } else {
        setIsLoading(true);
      }

      await fetchCaseQuotes(caseId);
    } finally {
      setIsLoading(false);
      setRefresh(false);
    }
  };

  const handleQuotationPress = (quotation: CaseQuotesDto) => {
    SET_NAV_NOTIF(navNotif ? Number(navNotif) - 1 : null);
    navigation.navigate("CaseQuoteDescriptionScreen", {
      id: quotation.partner.id,
      caseId,
      hasPartnerBooking,
    });
    readQuotation(caseId, quotation.id);
  };

  return (
    <Layout
      showBack
      title="Case"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <Div flex={1}>
        <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} mb={20}>
          Quotations
        </Text>

        {!isLoading && (
          <FlatList
            data={caseQuotes}
            ListEmptyComponent={() => {
              return <Text>No quotes yet. :(</Text>;
            }}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleFetchRequests} />
            }
            renderItem={({ item }) => {
              return (
                <Div
                  py={16}
                  px={20}
                  borderWidth={1}
                  borderColor={
                    hasPartnerBooking !== undefined
                      ? hasPartnerBooking !== item.partner.id
                        ? "#ddd"
                        : "#222"
                      : "#222"
                  }
                  rounded={35}
                  mb={25}
                  position="relative"
                  overflow="hidden"
                >
                  {hasPartnerBooking !== undefined && hasPartnerBooking !== item.partner.id && (
                    <Div
                      position="absolute"
                      w={"120%"}
                      h={"150%"}
                      bg="#eeeeee50"
                      top={0}
                      left={0}
                      zIndex={10}
                      pointerEvents="none"
                    />
                  )}
                  <TouchableOpacity onPress={() => handleQuotationPress(item)}>
                    <Div flexDir="row" justifyContent="space-between">
                      <Div maxW={"70%"}>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate("ClinicDetailScreen", {
                              id: item.partner.id,
                            });
                          }}
                        >
                          <Div row alignItems="center">
                            <Text
                              fontSize={"xl"}
                              mb={4}
                              fontFamily={fontHauoraSemiBold}
                              style={{
                                borderBottomWidth: 1,
                              }}
                            >
                              {item.partner.name}
                            </Text>
                            {!item.isViewed && (
                              <Tag ml={6} mt={2} bg={colorErrorText} py={2} px={6}>
                                <Text
                                  textTransform="capitalize"
                                  color="#fff"
                                  fontFamily={fontHauoraSemiBold}
                                >
                                  NEW
                                </Text>
                              </Tag>
                            )}
                          </Div>
                        </TouchableOpacity>

                        {/* <PartnerVetStarRating rating={4} color="" /> */}

                        <Text
                          fontSize={"md"}
                          color="darkGreyText"
                          fontFamily={fontHauoraSemiBold}
                          mb={20}
                        >
                          {item.partner.address}
                        </Text>
                      </Div>

                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate("ClinicDetailScreen", {
                            id: item.partner.id,
                          });
                        }}
                      >
                        <Image
                          source={{ uri: item.partner?.clinicImg?.url }}
                          w={80}
                          h={80}
                          rounded={100}
                          bg="#fefefe"
                        />
                      </TouchableOpacity>
                    </Div>

                    <Div flexDir="row" alignItems="flex-end">
                      <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                        Min{"  "}
                      </Text>
                      <Text fontSize={"lg"} fontFamily={fontHauoraMedium}>
                        AED {getMinQuote(item)}
                      </Text>
                    </Div>

                    <Div flexDir="row" justifyContent="space-between" alignItems="center">
                      <Div flexDir="row" alignItems="flex-end">
                        <Text fontSize={"md"} fontFamily={fontHauoraMedium} mb={3}>
                          Max{"  "}
                        </Text>
                        <Text fontSize={"2xl"} fontFamily={fontHauoraBold}>
                          AED {getTotalQuote(item)}
                        </Text>
                      </Div>

                      <IconArrowRight
                        color={
                          hasPartnerBooking !== undefined
                            ? hasPartnerBooking !== item.partner.id
                              ? "#bbb"
                              : "#222"
                            : "#222"
                        }
                        width={34}
                        height={34}
                        strokeWidth={2.4}
                      />
                    </Div>
                    {/* <Div maxW="60%">
                    <Text
                      fontSize={"xl"}
                      fontFamily={fontHauoraSemiBold}
                      mb={6}
                    >
                      {item.partner.name}
                    </Text>

                    <Div mb={6}>
                      <Text
                        fontSize={"md"}
                        color="darkGreyText"
                        fontFamily={fontHauoraMedium}
                      >
                        {item.rating}/5 Rating
                      </Text>
                    </Div>
                    <Text
                      fontSize={"md"}
                      color="darkGreyText"
                      fontFamily={fontHauoraSemiBold}
                    >
                      {item.partner.address}
                    </Text>
                  </Div>

                  <Div alignItems="flex-end">
                    <Text
                      fontSize={"xl"}
                      fontFamily={fontHauoraSemiBold}
                      color="primary"
                    >
                      ~{getTotalQuote(item)} AED
                    </Text>
                    <Text
                      fontSize={"md"}
                      color="darkGreyText"
                      fontFamily={fontHauoraMedium}
                    >
                      Proposal
                    </Text>
                  </Div> */}
                  </TouchableOpacity>
                </Div>
              );
            }}
            keyExtractor={(item, i) => `${i}`}
          />
        )}

        {isLoading && (
          <Div flex={1} justifyContent="center" maxH={"70%"}>
            <ActivityIndicator size="large" color={colorPrimary} />
          </Div>
        )}
      </Div>
    </Layout>
  );
};

export default CaseQuotesScreen;
