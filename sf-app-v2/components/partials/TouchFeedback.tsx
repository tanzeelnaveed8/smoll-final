import { Vibration } from "react-native";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Props extends TouchableOpacityProps {}

const TouchFeedback: React.FC<Props> = ({ children, onPress, ...props }) => {
  return (
    <TouchableOpacity
      {...props}
      onPress={(e) => {
        Vibration.vibrate(0.5);

        if (onPress) {
          onPress(e);
        }
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

export default TouchFeedback;
