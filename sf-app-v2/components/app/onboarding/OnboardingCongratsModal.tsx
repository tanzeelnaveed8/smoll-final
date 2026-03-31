import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import React from "react";
import { Div, Image, Text } from "react-native-magnus";

interface Props {
  isVisible: boolean;
  onSuccess: () => void;
}

const OnboardingCongratsModal: React.FC<Props> = (props) => {
  return (
    <BottomSheet isVisible={props.isVisible} h="58%">
      <Div>
        <Div px={18} mb={32}>
          <Image
            w={90}
            h={90}
            mb={24}
            mx={"auto"}
            source={require("../../../assets/images/congratulation-screen-tick.png")}
          />
          <Text fontSize={"6xl"} textAlign="center" mb={8}>
            Congratulations, your account has been created.
          </Text>
          <Div flexDir="row" justifyContent="center">
            <Text fontSize={"lg"} textAlign="center" maxW={314}>
              To enjoy Smoll's services, you need to build your profile and your pet's profile.
            </Text>
          </Div>
        </Div>

        <ButtonPrimary onPress={props.onSuccess}>Let's Go</ButtonPrimary>
      </Div>
    </BottomSheet>
  );
};

export default OnboardingCongratsModal;
