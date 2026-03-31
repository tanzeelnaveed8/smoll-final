import React from "react";
import ModalCard from "./ModalCard";
import { Button, Div, Image, Text } from "react-native-magnus";
import { IconChevronRight } from "@tabler/icons-react-native";

const HumanCounsellingMessageCard: React.FC<{
  onPress: () => void;
}> = ({ onPress }) => {
  return (
    <Button
      bg="transparent"
      p={0}
      flexDir={"row"}
      alignItems="center"
      style={{ gap: 24 }}
      onPress={onPress}
    >
      <Image w={72} h={72} source={require("../../assets/images/user-img.png")} />
      <Div flexDir="row" alignItems="center" style={{ gap: 36 }}>
        <Div>
          <Text fontSize={"xl"} mb={4} lineHeight={24}>
            Dr. Susan James
          </Text>
          <Text mb={4} fontSize={"md"} color="darkGreyText">
            DVM, GPCERT (FelP)
          </Text>
          <Text fontSize={"md"} color="darkGreyText">
            Certified Coach & Master NLP
          </Text>
        </Div>

        <IconChevronRight width={24} height={24} color={"#222222"} />
      </Div>
    </Button>
  );
};

export default HumanCounsellingMessageCard;
