import { ReactElement } from "react";
import { fontHauora } from "@/constant/constant";
import { Div, Text, Toggle } from "react-native-magnus";
import { IconChevronRight } from "@tabler/icons-react-native";
import { Dimensions, TouchableOpacity } from "react-native";

type PropsType = {
  title: string;
  icon?: ReactElement;
  iconSize?: number;
  description?: string;
  toggleBtn?: boolean;
  onPress?: () => void;
  toggleValue?: boolean;
  disabled?: boolean;
};

const windowWidth = Dimensions.get("window").width;

const SettingButton: React.FC<PropsType> = (props) => {
  const { icon, toggleBtn = false, title, onPress, toggleValue, disabled } = props;
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <Div
        w="full"
        py={8}
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        opacity={disabled ? 0.5 : 1}
      >
        <Div flexDir="row" alignItems="center">
          {icon && (
            <Div mr={12} mt={3} alignSelf="center">
              {icon}
            </Div>
          )}
          <Div alignSelf="center">
            <Text color="#222222" fontWeight="400" fontSize={"4xl"} fontFamily={fontHauora}>
              {title}
            </Text>
          </Div>
        </Div>
        {toggleBtn && (
          <Toggle
            on={toggleValue}
            onPress={() => onPress?.()}
            bg="gray200"
            circleBg="white"
            activeBg="primary"
            h={24}
            w={44}
          />
        )}
        {!toggleBtn && (
          <Div>
            <IconChevronRight size={20} color="#7B7B7B" />
          </Div>
        )}
      </Div>
    </TouchableOpacity>
  );
};

export default SettingButton;
