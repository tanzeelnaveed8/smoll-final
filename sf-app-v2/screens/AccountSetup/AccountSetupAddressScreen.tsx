import CountryDropdown from "@/components/app/CountryDropdown";
import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import SelectCountryDropdown from "@/components/partials/SelectCountryDropdown";
import SelectInput from "@/components/partials/SelectInput";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { getAxiosErrMsg, isValidText } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import { AxiosError } from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Div, ScrollDiv, Text } from "react-native-magnus";
import { useToast } from "react-native-toast-notifications";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { fontCooper, fontHeading } from "@/constant/constant";

interface Props {
  navigation: NavigationType;
}

const windowHeight = Dimensions.get("window").height;

const AccountSetupAddressScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  const isUpdating = (route.params as { updating: string })?.updating;

  const toast = useToast();
  const { updateUser, user } = useUserStore();

  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    villa: "",
    street: "",
    city: "",
    // state: "",
    country: "",
    postalCode: "",
  });
  console.log("address==", address);

  const isNumeric = (value: string | undefined) => {
    return !!value && /^\d+$/.test(value);
  };

  const disableConfirm =
    !isValidText(address.street) ||
    !isValidText(address.city) ||
    !isValidText(address.country) ||
    !isValidText(address.villa) ||
    (!!address.postalCode && !isNumeric(address.postalCode));

  const handleConfirm = async () => {
    try {
      setLoading(true);
        console.log("click after fill info -->",address)
      await updateUser({
        address: address.street,
        city: address.city,
        country: address.country,
        timeZone: "Asia/Kolkata", // TODO: Need to update this.
        villa: address.villa,
        postalCode: address.postalCode,
      });

      if (isUpdating) {
        props.navigation.navigate("SettingPersonalInfoScreen");
      } else {
        props.navigation.navigate("HomeScreen", {
          showSetupModal: "true",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUpdating && user) {
      const userCopy = { ...user } as {
        villa: string;
        address: string;
        city: string;
        country: string;
        postalCode: string;
      };

      setAddress({
        villa: userCopy?.villa ?? "",
        street: userCopy?.address ?? "",
        city: userCopy?.city ?? "",
        country: userCopy?.country ?? "",
        postalCode: userCopy?.postalCode ?? "",
      });
    }
  }, [user]);

  const villaRef = useRef<any>(null);
  const streetRef = useRef<any>(null);
  const cityRef = useRef<any>(null);
  const postalCodeRef = useRef<any>(null);
  const scrollViewRef = useRef<any>(null);

  const scrollToInput = (inputRef: React.RefObject<any>) => {
    inputRef.current?.measureLayout(scrollViewRef.current, (_x: number, y: number) => {
      scrollViewRef.current?.scrollTo({ y: y, animated: true });
    });
  };
   
  return (
    <Layout
      showBack
      onBackPress={() => {
        if (isUpdating) {
          props.navigation.navigate("SettingPersonalInfoScreen");
        } else {
          props.navigation.navigate("Home", {
            showSetupModal: "true",
          });
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // adjust as needed
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollDiv
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            flex={1}
            keyboardShouldPersistTaps="handled"
          >
            <Div flex={1}>
              <Div flex={1}>
                <Text fontSize={"6xl"} mb={4} fontFamily={fontHeading}>
                  What's your address?
                </Text>
                <Text fontSize={"xl"} mb={20}>
                  We need your address to suggest the nearest vet clinic for in-clinic visits
                </Text>

                <Div style={{ gap: 16 }} mb={40}>
                  <InputField
                    ref={villaRef}
                    placeholder="Flat/Villa No"
                    value={address.villa}
                    onChangeText={(text) => setAddress((s) => ({ ...s, villa: text }))}
                    inputStyle={{
                      borderRadius: 12,
                    }}
                    maxLength={40}
                    returnKeyType="next"
                    disabled={loading}
                    onSubmitEditing={() => {
                      streetRef.current?.focus();
                    }}
                    onFocus={() => scrollToInput(villaRef)}
                  />
                  <InputField
                    ref={streetRef}
                    placeholder="Street address"
                    value={address.street}
                    onChangeText={(text) => setAddress((s) => ({ ...s, street: text }))}
                    inputStyle={{
                      borderRadius: 12,
                    }}
                    maxLength={40}
                    returnKeyType="next"
                    disabled={loading}
                    onSubmitEditing={() => cityRef.current?.focus()}
                    onFocus={() => scrollToInput(streetRef)}
                  />

                  <InputField
                    ref={cityRef}
                    placeholder="City"
                    value={address.city}
                    onChangeText={(text) => setAddress((s) => ({ ...s, city: text }))}
                    inputStyle={{
                      borderRadius: 12,
                    }}
                    maxLength={40}
                    returnKeyType="next"
                    disabled={loading}
                    onSubmitEditing={() => postalCodeRef.current?.focus()}
                    onFocus={() => scrollToInput(cityRef)}
                  />

               

                  <SelectCountryDropdown
                    value={address.country}
                    showCountryFlag={true}
                    hideCountryCode
                    onChange={(e: string) => {
                      console.log("testing==", e);
                      setAddress((s) => ({ ...s, country: e }));
                    }}
                  />

                  <InputField
                    ref={postalCodeRef}
                    placeholder="Postal code"
                    value={address.postalCode}
                    onChangeText={(text) => setAddress((s) => ({ ...s, postalCode: text }))}
                    inputStyle={{
                      borderRadius: 12,
                    }}
                    maxLength={10}
                    keyboardType="numeric"
                    returnKeyType="done"
                    disabled={loading}
                    onFocus={() => scrollToInput(postalCodeRef)}
                  />
                </Div>
              </Div>
              {/* </KeyboardAvoidingView> */}
            </Div>
          </ScrollDiv>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ButtonPrimary
        bgColor="primary"
        onPress={handleConfirm}
        disabled={disableConfirm || loading}
        loading={loading}
      >
        Confirm
      </ButtonPrimary>
    </Layout>
  );
};

export default AccountSetupAddressScreen;
