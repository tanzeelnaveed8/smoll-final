import { fontHauoraBold } from "@/constant/constant";
import { ActivityIndicator } from "react-native";
import { Div, Text } from "react-native-magnus";

interface Props {
  message: string;
  loader?: boolean;
}

const FlashCustomContent: React.FC<Props> = (props) => {
  return (
    <Div flex={1} row justifyContent="center" alignItems="center">
      {props.loader && (
        <Div mr={8}>
          <ActivityIndicator size="small" color="#fff" />
        </Div>
      )}
      <Text color="#fff" fontFamily={fontHauoraBold}>
        {props.message}
      </Text>
    </Div>
  );
};

export default FlashCustomContent;
