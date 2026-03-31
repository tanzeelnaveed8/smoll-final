import BottomSheet from "@/components/partials/BottomSheet";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { IconMessages, IconVideo } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { Div, Text } from "react-native-magnus";

const cardData = [
  {
    heading: "Chat with a qualified counsellor",
    text: "Ask anything to a counsellor with a single click.",
    icon: <IconMessages width={32} height={32} color={"#679FF0"} />,
  },
  {
    heading: "Video Consultant  with Counsellor",
    text: "Schedule a personalised video session with a professional counsellor.",
    icon: <IconVideo width={32} height={32} color={"#679FF0"} />,
  },
];

const StartNewConversationActionModal = () => {
  const [showModal, setShowModal] = useState(true);

  return (
    <BottomSheet
      height={"50%"}
      isVisible={showModal}
      title="Action"
      showCloseIcon
      onCloseIconClick={() => {
        setShowModal(false);
      }}
    >
      <Div>
        <FlatList
          data={cardData}
          renderItem={({ item, index }) => (
            <Div flexDir="row" alignItems="center" style={{ gap: 24 }} mb={index === 0 ? 24 : 0}>
              {item.icon}
              <Div>
                <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} mb={4}>
                  {item.heading}
                </Text>
                <Text fontSize={"lg"} color="darkGreyText" fontFamily={fontHauoraMedium} maxW={294}>
                  {item.text}
                </Text>
              </Div>
            </Div>
          )}
          keyExtractor={(item) => item.heading}
        />
      </Div>
    </BottomSheet>
  );
};

export default StartNewConversationActionModal;
