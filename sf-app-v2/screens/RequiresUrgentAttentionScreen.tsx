import ButtonPrimary from "@/components/partials/ButtonPrimary";
import ModalCard from "@/components/partials/ModalCard";
import React from "react";
import { Div, Image, Text } from "react-native-magnus";

const RequiresUrgentAttentionScreen = () => {
  return (
    <ModalCard onClose={() => {}} visible={true}>
      <Div style={{ flex: 1, justifyContent: "space-between", paddingTop: 10 }}>
        <Div>
          <Image w={92} h={92} mb={4} source={require("../assets/images/warning.png")} />
          <Text fontSize={"5xl"} mb={8}>
            Your pet requires urgent physical attention!
          </Text>

          <Text fontSize={"lg"}>
            Your pet needs immediate physical attention! If you notice any unusual behavior, sudden
            changes in eating or drinking habits, visible injuries, or signs of distress, it's
            crucial to act quickly.
          </Text>
        </Div>

        <ButtonPrimary bgColor="dark">Book In-Clinic Visit</ButtonPrimary>
      </Div>
    </ModalCard>
  );
};

export default RequiresUrgentAttentionScreen;
