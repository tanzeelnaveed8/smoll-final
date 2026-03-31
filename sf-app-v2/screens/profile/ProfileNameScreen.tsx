import InputField from "@/components/partials/InputField";
import { fontCooper, fontHeading } from "@/constant/constant";
import React from "react";
import { Div, Text } from "react-native-magnus";

const ProfileNameScreen = () => {
  return (
    <Div>
      <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
        What should we call you?
      </Text>
      <InputField
        placeholder="First Name"
        marginBottom={16}
        floatingPlaceholder
        inputStyle={{ borderRadius: 12 }}
      />
      <InputField
        placeholder="Last Name (Optional)"
        floatingPlaceholder
        inputStyle={{ borderRadius: 12 }}
      />
    </Div>
  );
};

export default ProfileNameScreen;
