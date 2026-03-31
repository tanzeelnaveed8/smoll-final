import { Div, Text } from "react-native-magnus";
import { fontHauora } from "@/constant/constant";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import SettingBackButton from "@/components/settings/SettingBackButton";
import Container from "@/components/partials/Container";

const SettingPersonalInfoLastNameScreen = () => {
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
            Edit Last name
          </Text>

          <InputField placeholder="Last name" floatingPlaceholder />
        </Div>

        <ButtonPrimary bgColor="primary">Save</ButtonPrimary>
      </Div>
    </Container>
  );
};

export default SettingPersonalInfoLastNameScreen;
