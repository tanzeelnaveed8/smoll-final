import { fontHauoraSemiBold } from "@/constant/constant";
import { IconSquareRoundedPlus } from "@tabler/icons-react-native";
import React from "react";
import { Button, Text } from "react-native-magnus";

const AddButton: React.FC<{ text: string; onPress?: () => void; styles?: {} }> = ({
  text,
  onPress,
  styles,
}) => {
  return (
    <Button
      fontSize={"lg"}
      fontFamily={fontHauoraSemiBold}
      color="#679FF0"
      flexDir="column"
      alignItems="center"
      mx={"auto"}
      style={{ gap: 4, ...styles }}
      p={0}
      bg="transparent"
      onPress={onPress}
    >
      <IconSquareRoundedPlus
        width={38}
        height={38}
        color={"#679FF0"}
        strokeWidth={0.9}
        style={{ marginTop: 2 }}
      />
      <Text color="primary" fontSize={"lg"} fontFamily={fontHauoraSemiBold}>
        {text}
      </Text>
    </Button>
  );
};

export default AddButton;
