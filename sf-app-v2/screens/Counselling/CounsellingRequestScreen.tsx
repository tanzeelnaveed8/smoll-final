import Layout from "@/components/app/Layout";
import { colorPrimary } from "@/constant/constant";
import { SocketEventEnum } from "@/socket/events";
import { useSocket } from "@/socket/provider";
import { useCounsellorStore } from "@/store/modules/counsellor";
import { NavigationType } from "@/store/types";
import React, { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Div, Text } from "react-native-magnus";
import StartNewConversationActionModal from "./StartNewConversationActionModal";

const CounsellingRequestScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { fetchSessions, requestSession } = useCounsellorStore();
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(SocketEventEnum.SESSION_ACCEPTED, async (data) => {
        // fetch the session
        await fetchSessions();
        // redirect to the session screen
        navigation.navigate("CounsellingChatScreen", {
          counsellorId: data.counsellorId,
          counsellorName: data.counsellorName,
        });
      });
    }

    requestSession();
  }, []);

  return (
    <>
      <Layout showBack onBackPress={() => navigation.goBack()} title="Messages">
        <Div flex={1}>
          <Div h={40}></Div>
          <Div mb={60}>
            <Text fontSize={"6xl"} textAlign="center" mb={8}>
              Welcome to Human Counselling
            </Text>
            <Text textAlign="center" maxW={347} mx={"auto"}>
              Our counselors are here to help you navigate challenges, achieve your goals, and
              enhance your well-being.
            </Text>
          </Div>

          <Div>
            <ActivityIndicator size="large" color={colorPrimary} />
            <Text textAlign="center" mt={8}>
              Please wait while we assign a counsellor.
            </Text>
          </Div>
        </Div>

        <StartNewConversationActionModal />
      </Layout>
    </>
  );
};

export default CounsellingRequestScreen;
