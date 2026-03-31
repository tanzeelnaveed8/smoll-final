import Layout from "@/components/app/Layout";
import ChatInboxItem from "@/components/app/chat/ChatInboxItem";
import { useCounsellorStore } from "@/store/modules/counsellor";
import { NavigationType } from "@/store/types";
import { Div } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}

const CounsellingInboxScreen: React.FC<Props> = (props) => {
  const { sessions } = useCounsellorStore();

  return (
    <Layout showBack title="Inbox" onBackPress={() => props.navigation.navigate("HomeScreen")}>
      <Div flex={1}>
        {sessions?.map((session) => (
          <ChatInboxItem
            key={session.id}
            onPress={() => {
              props.navigation.navigate("CounsellingChatScreen", {
                counsellorId: session.counsellorId,
                counsellorName: session.name,
              });
            }}
            title={session.name}
            subtitle={session.designation}
            image="https://via.placeholder.com/150"
          />
        ))}
      </Div>
    </Layout>
  );
};

export default CounsellingInboxScreen;
