import { Div, Text } from "react-native-magnus";
import { fontHauora } from "@/constant/constant";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import SettingBackButton from "@/components/settings/SettingBackButton";
import Container from "@/components/partials/Container";

const SettingPersonalInfoPhoneNoScreen = () => {
  return (
    <Container>
      <Div pt={20}>
        <Div mb={32}>
          <SettingBackButton text="Personal Info" />

          <Text
            fontSize={"5xl"}
            fontWeight="400"
            lineHeight={36}
            fontFamily={fontHauora}
            mb={24}
            textTransform="capitalize"
          >
            Edit Phone Number
          </Text>

          {/* Todo: Needs to update the type of input field */}
          <InputField placeholder="Phone Number" floatingPlaceholder />
          <Text fontSize="md" lineHeight={20} color="#2F6E20" mt={4}>
            Verified
          </Text>
        </Div>

        <ButtonPrimary bgColor="primary">Save</ButtonPrimary>

        <Text fontWeight="400" fontSize="md" lineHeight={20} color="#494949" mt={24}>
          *If you change your Phone Number, you need to verify it and make sure the email belongs to
          you.
        </Text>
      </Div>
    </Container>
  );
};

export default SettingPersonalInfoPhoneNoScreen;
