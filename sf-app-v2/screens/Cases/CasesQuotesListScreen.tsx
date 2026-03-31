import Layout from "@/components/app/Layout";
import {
  colorPrimary,
  fontCooper,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useCaseStore } from "@/store/modules/case";
import { NavigationType } from "@/store/types";
import { CaseStatusEnum } from "@/store/types/case.d";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList } from "react-native-bidirectional-infinite-scroll";

import { Badge, Button, Div, Image, Text } from "react-native-magnus";

const CasesQuotesListScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { escalatedCases: cases, fetchCases } = useCaseStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nextPageId, setNextPageId] = useState<number | null>(1);
  const [page, setPage] = useState(1);

  const comingFrom = (route.params as Record<string, string | undefined>)?.from;

  useFocusEffect(
    useCallback(() => {
      handleFetchCases(undefined, true);
    }, [])
  );

  const handleFetchCases = async (isRefresh?: boolean, reset?: boolean) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetchCases(1, isRefresh ?? reset, true);

      setNextPageId(response.nextPage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageId) return;

    return new Promise<void>(async (resolve) => {
      const newPage = page + 1;
      try {
        const fetchedData = await fetchCases(newPage); // commented-out for now
        setNextPageId(fetchedData.nextPage); /// commented-out for now
        setPage(newPage);
      } finally {
        resolve();
      }
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout
        showBack
        onBackPress={() => {
          if (comingFrom) {
            navigation.navigate("HomeScreen");
          } else {
            navigation.goBack();
          }
        }}
        title="Quotations"
        loading={isLoading}
      >
        <Div mb={24}>
          {cases && cases.length > 0 && (
            <Text fontSize={"4xl"} fontWeight="bold" mb={20} fontFamily={fontCooper}>
              Quotations
            </Text>
          )}

          {!isLoading && cases && cases.length > 0 && (
            <Text fontSize={"lg"} mt={10} fontFamily={fontHauoraSemiBold}>
              In-Clinic Requests
            </Text>
          )}
        </Div>
        <Div flex={1}>
          <FlatList
            data={cases}
            onStartReached={() => Promise.resolve()}
            ListEmptyComponent={() => (
              <Div h={600} justifyContent="center">
                <Text
                  fontSize={"5xl"}
                  textAlign="center"
                  maxW={300}
                  mx={"auto"}
                  lineHeight={35}
                  fontFamily={fontCooper}
                >
                  You don't have any escalated cases
                </Text>
              </Div>
            )}
            style={{ height: "100%" }}
            onEndReached={handleLoadMore} // required, should return a promise
            onEndReachedThreshold={20} // optional
            activityIndicatorColor={"black"} // optional
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                tintColor={colorPrimary}
                onRefresh={() => handleFetchCases(true)}
              />
            }
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Div mb={index + 1 === cases?.length ? 0 : 12}>
                <Div flexDir="row" justifyContent="space-between">
                  <Text
                    fontSize={"md"}
                    mb={8}
                    fontFamily={fontHauoraSemiBold}
                    style={{
                      textTransform: "capitalize",
                    }}
                  >
                    {dayjs(item.createdAt).fromNow()}
                  </Text>

                  {Boolean(item.requestCount) && (
                    <Button
                      bg="transparent"
                      onPress={() => {
                        navigation.navigate("CaseQuotesScreen", {
                          id: item.id,
                          hasPartnerBooking: item.hasPartnerBooking,
                        });
                      }}
                    >
                      {item.hasNewQuotation && <Badge bg="#f52c11" mt={1} />}
                      <Text fontFamily={fontHauoraSemiBold} fontSize={"lg"} color="primary" ml={-4}>
                        View
                      </Text>
                    </Button>
                  )}
                </Div>

                <Div bg="transparent" p={0} flexDir="row" alignItems="center" mb={12}>
                  {item.pet?.photos?.[0]?.url && (
                    <Image
                      source={{ uri: item.pet?.photos?.[0]?.url }}
                      w={58}
                      h={58}
                      mr={7}
                      rounded={100}
                    />
                  )}
                  <Div flex={1}>
                    <Div mb={4} flexDir="row" justifyContent="space-between" flex={1}>
                      <Div
                        flexDir="row"
                        justifyContent="space-between"
                        alignItems="center"
                        w={"100%"}
                      >
                        <Text fontFamily={fontHauoraSemiBold} fontSize={"xl"}>
                          {item.pet?.name}
                        </Text>
                      </Div>

                      {item.status === CaseStatusEnum.OPEN_ESCALATED && (
                        <Text fontFamily={fontHauoraSemiBold} fontSize={"lg"} color="#2F6E20">
                          {item.requestCount} Request
                        </Text>
                      )}
                    </Div>

                    <Div>
                      <Text color="#494949" fontFamily={fontHauoraSemiBold} fontSize={"md"}>
                        Expert: {item.vet}
                      </Text>

                      <Text fontFamily={fontHauoraSemiBold} fontSize={"md"} color="#494949">
                        Case Id: {item.id}
                      </Text>
                    </Div>
                  </Div>
                </Div>

                <Div
                  py={8}
                  // borderTopWidth={1}
                  borderBottomWidth={1}
                  borderColor="#D0D7DC"
                  flexDir="row"
                  justifyContent="space-between"
                >
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("CaseDetailScreen", {
                        caseId: item.id,
                      })
                    }
                  >
                    <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold}>
                      View Case Brief
                    </Text>
                  </TouchableOpacity>

                  <Text fontFamily={fontHauoraMedium} fontSize={"lg"} color="#2F6E20">
                    {item.requestCount} Quotations
                  </Text>
                </Div>
              </Div>
            )}
            keyExtractor={(item, i) => item.id}
          />
        </Div>
      </Layout>
    </SafeAreaView>
  );
};

export default CasesQuotesListScreen;
