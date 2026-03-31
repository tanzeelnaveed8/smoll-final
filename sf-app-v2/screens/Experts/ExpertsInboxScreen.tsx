import Layout from "@/components/app/Layout";
import ChatInboxItem from "@/components/app/chat/ChatInboxItem";
import {
  colorPrimary,
  fontCooper,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useExperts } from "@/functions/useExperts";
import { useQuotations } from "@/functions/useQuotations";
import { useUserInfoStore } from "@/store/modules/userInfo";
import { NavigationType } from "@/store/types";
import { CaseStatusEnum } from "@/store/types/case.d";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { Badge, Button, Div, Image, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}
const actionBtns = ["Chats", "Quotations"];

const ExpertsInboxScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState("Chats");
   const userInfo = useUserInfoStore((state) => state.userInfo);

  const { experts, unreadMessages, loading, actionLoading, handleInboxItemPress } =
    useExperts(navigation);

  const { cases, isLoading, isRefreshing, handleFetchCases, handleLoadMore, comingFrom } =
    useQuotations();

// showBack={true}
  return (
    <Layout title="Inbox" loading={loading} onBackPress={() => navigation.navigate("Home")     }  showBack={userInfo?.isEnabled}>
      <Div flex={1} pt={44}>
        <Div
          flexDir="row"
          justifyContent="space-around"
          mb={26}
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
                borderRightWidth: item === activeTab && activeTab === "Inbox" ? 1 : 0,
                borderLeftWidth: item === activeTab && activeTab === "Quotations" ? 1 : 0,
                borderColor: "#ccc",
                borderRadius: 12,
                alignItems: "center",
                padding: 5,
                paddingVertical: 8,
                backgroundColor: item !== activeTab ? "#FAF8F5" : "#f1ebe2",
              }}
              onPress={() => {
                setActiveTab(item);
                // handleFetchAppointments(undefined, true);
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

        {activeTab === "Chats" && (
          <Div flex={1}>
            {experts?.map((expert) => (
              <ChatInboxItem
                key={expert.id}
                onPress={() => handleInboxItemPress(expert.id, expert.name)}
                title={expert.name}
                subtitle={expert.designation}
                loading={actionLoading}
                image={expert.profileImg?.url ?? "https://via.placeholder.com/150"}
                expertId={expert.id}
                verified={expert.verified}
                about={expert.about}
                unreadMessageCount={unreadMessages.get(expert.id)}
                isOnline={expert.isOnline}
              />
            ))}
          </Div>
        )}

        {activeTab === "Quotations" && (
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
                        <Text
                          fontFamily={fontHauoraSemiBold}
                          fontSize={"lg"}
                          color="primary"
                          ml={-4}
                        >
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
        )}
      </Div>
    </Layout>
  );
};

export default ExpertsInboxScreen;
