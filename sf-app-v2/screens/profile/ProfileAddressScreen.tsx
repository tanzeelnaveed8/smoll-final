import CountryDropdown from "@/components/app/CountryDropdown";
import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import ModalCard from "@/components/partials/ModalCard";
import SelectInput from "@/components/partials/SelectInput";
import { NavigationType } from "@/store/types";
import React from "react";
import { Button, Div, Modal, Text } from "react-native-magnus";

const ProfileAddressScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  return (
    <Layout>
      <BackButton
        onPress={() =>
          navigation.navigate("AccountSetup", {
            showModal: "true",
          })
        }
      />
      <Div flex={1} justifyContent="space-between">
        <Div>
          <Text fontSize={"6xl"} mb={4}>
            What’s your address?
          </Text>
          <Text fontSize={"xl"} mb={20}>
            We need your address to suggest the nearest vet clinic for in-clinic visits
          </Text>

          <Div style={{ gap: 16 }}>
            <InputField
              placeholder="Flat/Villa No"
              inputStyle={{
                borderRadius: 12,
              }}
            />
            <InputField
              placeholder="Street address"
              inputStyle={{
                borderRadius: 12,
              }}
            />

            <SelectInput />
            <CountryDropdown />

            <InputField
              placeholder="Postal code"
              inputStyle={{
                borderRadius: 12,
              }}
            />
          </Div>
        </Div>
        <ButtonPrimary bgColor="primary">Confirm</ButtonPrimary>
      </Div>
    </Layout>
  );
};

export default ProfileAddressScreen;
