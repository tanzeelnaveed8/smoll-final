import BackButton from "@/components/partials/BackButton";
import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { fontCooper, fontHeading } from "@/constant/constant";
import { useUserStore } from "@/store/modules/user";
import { isValidText } from "@/utils/helpers";
import React, { useRef, useState } from "react";
import { Div, Text } from "react-native-magnus";

interface Props {
  isVisible: boolean;
  onSuccess: (isNewUser: boolean) => void;
}

const OnboardingUserModal: React.FC<Props> = (props) => {
  const { updateUser } = useUserStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const lastNameRef = useRef<any>(null);

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await updateUser({
        name: `${firstName} ${lastName}`.trim(),
      });

      props.onSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet showCloseIcon={false}
    //  isVisible={props.isVisible}
     isVisible={false}
     h="95%" barMb={28}>
      <Div>
        <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
          What should we call you?
        </Text>

        <InputField
         secureTextEntry={false}
          placeholder="First Name"
          marginBottom={16}
          floatingPlaceholder
          inputStyle={{ borderRadius: 12 }}
          onChangeText={setFirstName}
          value={firstName}
          disabled={loading}
          maxLength={12}
          onSubmitEditing={() => {
            lastNameRef.current.focus();
          }}
        />

        <InputField
          ref={lastNameRef}
          placeholder="Last Name (Optional)"
          floatingPlaceholder
          inputStyle={{ borderRadius: 12 }}
          marginBottom={32}
          onChangeText={setLastName}
          value={lastName}
          disabled={loading}
          maxLength={12}
        />

        <ButtonPrimary
          onPress={handleConfirm}
          loading={loading}
          disabled={loading || !isValidText(firstName)}
        >
          Continue
        </ButtonPrimary>
      </Div>
    </BottomSheet>
  );
};

export default OnboardingUserModal;
