import Layout from "@/components/app/Layout";
import Chat from "@/components/app/chat/Chat";
import { SocketEventEnum } from "@/socket/events";
import { useSocket } from "@/socket/provider";
import { useExpertStore } from "@/store/modules/expert";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Div, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}

const ExpertsChatScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  const socket = useSocket();

  const { expertDetailMap, fetchExpertDetail, updateExpertStatus } = useExpertStore();
  const [loading, setLoading] = useState(false);

  const expertId = (route.params as Record<string, string>).expertId;
  const expertName = (route.params as Record<string, string>).expertName;

  const expertDetailData = expertDetailMap.get(expertId);
  // console.log("expertDetailData", expertDetailData?.isOnline);

  useEffect(() => {
    try {
      setLoading(true);
      const expertDetail = expertDetailMap.get(expertId);
      if (!expertDetail) {
        fetchExpertDetail(expertId);
      }
    } finally {
      setLoading(false);
    }
  }, [expertId]);

  return (
    <Layout
      showBack
      onBackPress={() => props.navigation.goBack()}
      title={expertName}
      loading={loading}
      style={{ paddingBottom: 0 }}
    >
      {!expertDetailData?.isOnline && (
        <Div
          h={60}
          // bg="red"
          justifyContent="center"
          alignItems="center"
          position="relative"
        >
          <Div
            p={10}
            bg="primary"
            h={"100%"}
            w={"150%"}
            justifyContent="center"
            position="absolute"
          >
            <Text w={"70%"} mx={"auto"} textAlign="center" color="#fff">
              The expert is currently offline but will respond as soon as they are online.
            </Text>
          </Div>
        </Div>
      )}

      <Chat
        initialMessages={[]}
        recipientId={expertId}
        chatFor="experts"
        chatWithName={expertName}
        expertIsOnline={Boolean(expertDetailData?.isOnline)}
      />
    </Layout>
  );
};

export default ExpertsChatScreen;
