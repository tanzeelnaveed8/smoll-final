import { fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import React, { JSXElementConstructor, ReactElement } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Button, Div, Icon, Modal, Text } from "react-native-magnus";

const windowWidth = Dimensions.get("window").width;

let initial = true;
const ModalCard: React.FC<{
  onClose?: () => void;
  backBtn?: boolean;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  pt?: number;
  title?: string;
  height?: string | number;
}> = ({ onClose, children, backBtn, pt, title, height }) => {
  return (
    <Modal
      isVisible
      px={20}
      pb={30}
      pt={pt ? pt : 10}
      h={height ? height : "98%"}
      roundedTop={12}
      swipeDirection={["down"]}
    >
      <Div flexDir="row" position="relative">
        <Button bg="transparent" px={0} onPress={onClose} style={{ alignItems: "center" }}>
          <Icon fontSize={"5xl"} color="#222222" name={backBtn ? "arrowleft" : "close"} />
          {backBtn && (
            <Text fontSize="xl" fontWeight="500" ml={4}>
              Back
            </Text>
          )}
        </Button>
        {title && (
          <Text fontFamily={fontHauoraSemiBold} fontSize={"xl"} style={styles.title}>
            {title}
          </Text>
        )}
      </Div>
      {children}
    </Modal>
  );
};

export default ModalCard;

const styles = StyleSheet.create({
  title: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -(windowWidth * 0.1) }],
  },
});
