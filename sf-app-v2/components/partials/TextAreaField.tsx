import { colorDisableBg, colorDisableBorder } from "@/constant/constant";
import { forwardRef, useState } from "react";
import { Keyboard, ScrollView, TextInput, TextInputProps } from "react-native";
import { Div, useTheme } from "react-native-magnus";

interface Props extends TextInputProps {
  disabled?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  mb?: number;
  // ref?: React.Ref<TextInput>;
}

const TextAreaField: React.FC<Props> = forwardRef<TextInput, Props>((props, ref) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    Keyboard.dismiss();
  };

  return (
    <Div mb={props.mb}>
      <TextInput
        ref={ref}
        multiline={true}
        numberOfLines={20}
        textAlignVertical="top"
        style={{
          paddingVertical: 16,
          paddingHorizontal: 12,
          fontSize: theme.theme?.fontSize?.xl,
          borderWidth: 1,
          borderColor: props.disabled
            ? colorDisableBorder
            : isFocused
              ? "#427594"
              : props.borderColor
                ? props.borderColor
                : "#222222",
          backgroundColor: props.disabled
            ? colorDisableBg
            : props.backgroundColor
              ? props.backgroundColor
              : "transparent",
          height: 152,
          borderRadius: 12,
        }}
        readOnly={props.disabled}
        onBlur={handleBlur}
        onFocus={handleFocus}
        {...props}
      />
    </Div>
  );
});

export default TextAreaField;
