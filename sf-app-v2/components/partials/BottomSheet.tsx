import React from "react";
import { Modal, Div, ModalProps, Button, Text } from "react-native-magnus";
import { IconX } from "@tabler/icons-react-native";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { fontHauoraSemiBold } from "@/constant/constant";

interface Props extends ModalProps {
  showCloseIcon?: boolean;
  onCloseIconClick?: () => void;
  barMb?: number;
  title?: string;
  height?: string | number;
  px?: number;
  closeButtonStyle?: StyleProp<ViewStyle>;
}

const BottomSheet: React.FC<Props> = (props) => {
  const {
    children,
    showCloseIcon = false,
    title,
    onCloseIconClick,
    barMb = 28,
    height,
    px,
    closeButtonStyle,
    ...restProps
  } = props;

  return (
    <Modal
      h={height ? height : "80%"}
      roundedTop={12}
      bg="bgColor"
      pb={20}
      swipeDirection={["down"]}
      coverScreen={true}
      scrollTo={() => {}}
      scrollOffset={1}
      propagateSwipe={true}
      avoidKeyboard={true}
      onSwipeComplete={onCloseIconClick}
      onBackdropPress={onCloseIconClick}
      onBackButtonPress={onCloseIconClick}
      {...restProps}
    >
      <Div mx="auto" w={44} h={4} mt={8} rounded={4} bg="#DEDEDE" mb={barMb} />

      {title ? (
        <Div borderBottomColor="#DEDEDE" borderBottomWidth={1}>
          <Div px={20}>
            <Div row justifyContent="space-between" alignItems="center" pb={24}>
              {showCloseIcon ? (
                <Button p={4} bg="transparent" onPress={onCloseIconClick}>
                  <IconX size={24} color="#222222" strokeWidth={1.5} />
                </Button>
              ) : (
                <Div w={24} />
              )}
              <Text
                fontSize={"xl"}
                fontWeight="600"
                fontFamily={fontHauoraSemiBold}
                textAlign="center"
                flex={1}
              >
                {title}
              </Text>
              <Div w={24} />
            </Div>
          </Div>
        </Div>
      ) : (
        <></>
      )}

      {!title && showCloseIcon ? (
        <Div px={20} mb={16} style={closeButtonStyle ? closeButtonStyle : {}}>
          <Div row justifyContent="space-between" alignItems="center">
            {showCloseIcon ? (
              <Button px={0} py={0} bg="transparent" onPress={onCloseIconClick}>
                <IconX size={24} color="#222222" strokeWidth={1.5} />
              </Button>
            ) : (
              <Div w={24} />
            )}
            <Text fontSize={"xl"} fontWeight="600" textAlign="center" flex={1}>
              {title}
            </Text>
            <Div w={24} />
          </Div>
        </Div>
      ) : (
        <></>
      )}

      <Div px={typeof px === "number" ? px : 20} pb={20}>
        {children}
      </Div>
    </Modal>
  );
};

export default BottomSheet;
