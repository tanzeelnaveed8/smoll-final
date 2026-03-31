import React, { useState } from "react";
import { Button, Div, Image, Modal, Text } from "react-native-magnus";
import ButtonPrimary from "../partials/ButtonPrimary";
import { IconArrowRight } from "@tabler/icons-react-native";
import {
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeadingBold,
} from "@/constant/constant";
import blueWatch from "@/assets/images/blue-watch.png";
import receiptSlip from "@/assets/images/receipt-slip.png";
import important from "@/assets/images/important.png";
import name from "@/assets/images/NameCard3D.png";
import { TouchableOpacity } from "react-native";

interface BottomPopupProps {
  type: "emergency" | "appointment" | "quotation"|"namesetup";
  petName: string;
  onClose: () => void;
  onButtonPress: () => void;
}

const popUpTypes = {
  emergency: {
    bgColor: "#f23113",
    title: "Things can't wait!",
    description: (petName: string) => `${petName}'s case must be\nchecked at cinic ASAP!`,
    buttonText: "Proceed",
    icon: {
      image: important,
      h: 180,
      w: 130,
    },
  },
  appointment: {
    bgColor: "#32AF92",
    title: "One last step!",
    description: (petName: string) => `Let's confirm ${petName}'s appointment.`,
    buttonText: "Proceed",
    icon: {
      image: blueWatch,
      h: 170,
      w: 120,
    },
  },
  
  quotation: {
    bgColor: "#0587F6",
    title: "Quotation has arrived!",
    description: (petName: string) =>
      `Quotation for ${petName}'s\ncase has been received,\nlet's take a look at it.`,
    buttonText: "View Quotations",
    icon: {
      image: receiptSlip,
      h: 210,
      w: 150,
    },
  },
  
  namesetup: {
    bgColor: "#2098d8",
    title: "Your Name!",
      description: (petName: string) =>
      `To join the public chat, please make sure your name is set in your profile`,
    buttonText: "Your Profile",
    icon: {
      image: name,
      h: 210,
      w: 150,
    },
  },
};

const BottomPopup: React.FC<BottomPopupProps> = ({ type, petName, onClose, onButtonPress }) => {
  console.log("first------------",type)
  const [popup, setPopup] = useState(true);
  const handleSwipe = () => {
    onClose();
    setPopup(false);
  };

  return (
    <Modal
      h={"36.4%"}
      roundedTop={24}
      bg={popUpTypes[type].bgColor}
      py={54}
      px={38}
      swipeDirection={["down"]}
      coverScreen={true}
      scrollTo={() => {}}
      scrollOffset={1}
      propagateSwipe={true}
      avoidKeyboard={true}
      isVisible={popup}
      onSwipeComplete={handleSwipe}
      backdropColor="transparent"
    >
      <Div flex={1} row={true} position="relative">
        <Div flex={1} row={false} justifyContent="space-between" h={"100%"} w={"100%"} mr={60}>
          <Div>
            <Text color="#fff" fontSize={"4xl"} fontFamily={fontHauoraSemiBold}>
              {popUpTypes[type].title}
            </Text>
            <Text color="#fff" fontSize={"lg"} mt={8} fontFamily={fontHauoraMedium}  maxW={type=="namesetup"?"75%":"100%"}>
              {popUpTypes[type].description(petName)}
            </Text>
          </Div>
          <Button
            onPress={() => onButtonPress()}
            rounded={100}
            bg="#fff"
            px={24}
            fontFamily={fontHauoraBold}
            color={popUpTypes[type].bgColor}
            suffix={<IconArrowRight color={popUpTypes[type].bgColor} />}
          >
            {popUpTypes[type].buttonText}
          </Button>
        </Div>
        <Div position="absolute" right={-12} top={20}>
          <Image
            source={popUpTypes[type].icon.image}
            h={popUpTypes[type].icon.h}
            w={popUpTypes[type].icon.w}
            resizeMode="contain"
          />
        </Div>
      </Div>
    </Modal>
  );
};

export default BottomPopup;
