import { fontHauoraMedium } from "@/constant/constant";
import { Button, ButtonProps } from "react-native-magnus";
import { IconArrowLeft, IconX } from "@tabler/icons-react-native";
import { TouchableOpacity } from "react-native";

interface PropTypes extends ButtonProps {
  text?: string;
  onPress?: () => void;
  showCloseIcon?: boolean;
}

const BackButton = (props: PropTypes) => {
  const { text, onPress, showCloseIcon, ...restProps } = props;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
      <Button
        {...restProps}
        onPress={onPress}
        pointerEvents="none"
        px={0}
        py={0}
        bg="transparent"
        fontFamily={fontHauoraMedium}
        fontSize="xl"
        lineHeight={20}
        color="#222222"
        prefix={
          showCloseIcon ? (
            <IconX
              size={28}
              color="#222222"
              strokeWidth={1.5}
              style={{ marginBottom: 4, marginRight: 4 }}
            />
          ) : (
            <IconArrowLeft
              size={28}
              color="#222222"
              strokeWidth={1.5}
              style={{ marginBottom: 4, marginRight: 4 }}
            />
          )
        }
      >
        {text}
      </Button>
    </TouchableOpacity>
  );
};

export default BackButton;
