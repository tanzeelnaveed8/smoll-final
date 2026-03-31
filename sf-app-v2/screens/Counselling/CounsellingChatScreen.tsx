import Layout from "@/components/app/Layout";
import Chat from "@/components/app/chat/Chat";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { View } from "react-native-animatable";
import { IMessage } from "react-native-gifted-chat";
import { Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}

const CounsellingChatScreen: React.FC<Props> = (props) => {
  const route = useRoute();

  const counsellorId = (route.params as Record<string, string>).counsellorId;
  const counsellorName = (route.params as Record<string, string>).counsellorName;

  // TODO: This need to be send from the counsellor side
  // const messages: IMessage[] = [
  //   {
  //     _id: "01",
  //     text: `"${counsellorName}" will be your dedicated consultant.`,
  //     createdAt: new Date(),
  //     user: {
  //       _id: counsellorId,
  //       name: counsellorName,
  //     },
  //   },
  //   {
  //     _id: "00",
  //     text: "Welcome to Smoll Human Counselling!👋",
  //     createdAt: new Date(),
  //     user: {
  //       _id: counsellorId,
  //       name: counsellorName,
  //     },
  //   },
  // ];

  return (
    // <Layout showBack onBackPress={() => props.navigation.goBack()}>
    //   <Chat initialMessages={[]} recipientId={counsellorId} />
    // </Layout>
    <View>
      <Text>Hello</Text>
    </View>
  );
};

export default CounsellingChatScreen;
