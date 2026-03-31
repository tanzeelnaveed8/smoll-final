import { Button, Div, Text } from "react-native-magnus";
import { IconChevronLeft } from "@tabler/icons-react-native";

type PropsType = {
  text: string;
};

const SettingBackButton = (props: PropsType) => {
  const { text } = props;
  return (
    <Div flexDir="row" alignItems="center" mb={4} ml={-8}>
      <Button px={0} py={0} bg="transparent" alignItems="center">
        <IconChevronLeft
          fontSize={"xl"}
          color="#222222"
          style={{ marginTop: 2.5 }}
          strokeWidth={1.5}
        />
        <Text fontWeight="400" fontSize="xl" color="#222222">
          {text}
        </Text>
      </Button>
    </Div>
  );
};

export default SettingBackButton;
