import InputField from "@/components/partials/InputField";
import React from "react";
import { Div, Text } from "react-native-magnus";

const ProfileNumberScreen = () => {
  return (
    <Div>
      <Text fontSize={"4xl"} mb={20}>
        Please enter your phone number below
      </Text>
      <InputField
        placeholder="(+971) United Arab Emirates"
        inputStyle={{
          borderRadius: 12,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      />
      <InputField
        placeholder="Phone number"
        inputStyle={{
          borderRadius: 12,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      />
    </Div>
  );
};

export default ProfileNumberScreen;
