import InputField from "@/components/partials/InputField";
import SelectInput from "@/components/partials/SelectInput";
import { colorGray49 } from "@/constant/constant";
import React from "react";
import { StyleSheet } from "react-native";
import { Button, Div, Icon, Text } from "react-native-magnus";
import { createBorderWidthStyles } from "react-native-magnus/lib/typescript/src/theme/theme.service";

const InClinicDetailsScreen = () => {
  return (
    <Div flex={1}>
      {/* header */}
      <Div flexDir="row" justifyContent="space-between" alignItems="center" py={2} mb={20}>
        <Button bg="transparent" px={0}>
          <Icon fontSize={"4xl"} color="#222222" name="arrow-back-outline" fontFamily="Ionicons" />
        </Button>
        <Text fontSize={"xl"}>Details</Text>
        <Button bg="transparent" px={0}>
          <Icon fontSize={"4xl"} color="#222222" name="questioncircleo" fontFamily="AntDesign" />
        </Button>
      </Div>

      {/* name & phone */}
      <Div mb={32}>
        <SelectInput
          label="Pet"
          options={["Lucy", "Decy", "Kaalu"]}
          borderWidth={0}
          borderColor="#E0E0E0"
          paddingX={0}
          borderRadius={0}
        />
        <InputField
          placeholder="Phone no"
          floatingPlaceholder
          borderColor="#E0E0E0"
          paddingX={0}
          inputStyle={{
            borderRadius: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderBottomColor: "#E0E0E0",
          }}
        />
      </Div>

      {/* address */}
      <Div mb={32}>
        <Text fontSize={"xl"} mb={12}>
          Address
        </Text>

        <Button bg="transparent" px={0} py={0} mb={12} style={styles.addressContainer}>
          <Text fontSize={"xl"} color={colorGray49}>
            Villa 12, Street 24, Jumeirah 3, Dubai, United Arab Emirates
          </Text>

          <Icon
            fontSize={"2xl"}
            color="#494949"
            name="arrow-forward-ios"
            fontFamily="MaterialIcons"
          />
        </Button>

        <Text fontSize={"md"}>
          We need your address so that we can assign the nearest clinic to you.
        </Text>
      </Div>
    </Div>
  );
};

export default InClinicDetailsScreen;

const styles = StyleSheet.create({
  addressContainer: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
