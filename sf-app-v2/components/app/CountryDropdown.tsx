import {
  colorDisableBg,
  colorDisableBorder,
  colorDisableText,
  colorTextPrimary,
} from "@/constant/constant";
import React, { useState } from "react";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { View } from "react-native-animatable";

import { CountryPicker } from "react-native-country-codes-picker";
import { Text } from "react-native-magnus";

interface Props {
  style?: StyleProp<ViewStyle>;
  onChange: (value: { code: string; codeLabel: string; label: string }) => void;
  value?: { code: string; codeLabel: string; label: string };
  onSelect?: () => void;
  isDisabled?: boolean;
}

const CountryDropdown: React.FC<Props> = ({ style, onChange, value, onSelect, isDisabled }) => {
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState("");
  const externalStyles: {} = style ? style : {};

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShow(true)}
        disabled={isDisabled}
        style={{
          borderColor: isDisabled ? colorDisableBorder : "#494949",
          borderWidth: 1,
          paddingHorizontal: 12,
          paddingVertical: 16,
          borderRadius: 12,
          backgroundColor: isDisabled ? colorDisableBg : "transparent",
          ...externalStyles,
        }}
      >
        <Text
          style={{
            color: isDisabled ? colorDisableText : colorTextPrimary,
            fontSize: 18,
          }}
          disabled={isDisabled}
        >
          {countryCode ? countryCode : "Select your Country"}
        </Text>
      </TouchableOpacity>
      {/* // For showing picker just put show state to show prop */}
      <CountryPicker
        lang="en"
        show={show}
        // when picker button press you will get the country object with dial code
        pickerButtonOnPress={(item) => {
          onChange({
            code: item.dial_code,
            codeLabel: `${item.flag} (${item.dial_code})`,
            label: `${item.flag} (${item.dial_code}) ${item.name.en}`,
          });
          setCountryCode(`${item.flag} (${item.dial_code}) ${item.name.en}`);
          setShow(false);

          if (onSelect) {
            onSelect();
          }
        }}
        showOnly={["ae"]}
        onBackdropPress={() => setShow(false)}
        style={{}}
      />
    </View>
  );
};

export default CountryDropdown;
