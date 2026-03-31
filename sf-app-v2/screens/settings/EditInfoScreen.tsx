import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { fontCooper, fontHeading } from "@/constant/constant";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { PetDetail } from "@/store/types/pet";
import { UpdateUserPayloadDto } from "@/store/types/user";
import { getAxiosErrMsg } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import { Div, ScrollDiv, Text } from "react-native-magnus";
import { useToast } from "react-native-toast-notifications";

type DataType = {
  heading: string;
  placeholder: string;
  fieldKey: keyof UpdateUserPayloadDto;
  value: string;
  petId?: string;
};

const EditInfoScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { updateUser, user } = useUserStore();
  const { updatePet } = usePetStore();
  const { heading, placeholder, fieldKey, value, petId } = useRoute().params as DataType;
  const [form, setForm] = useState(value);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleConfirm = async () => {
    if (!fieldKey) {
      toast.show("Field Key is not provided in the params", {
        type: "danger",
      });
      return;
    }
    try {
      setLoading(true);

      if (petId) {
        const key = fieldKey as keyof PetDetail;
        const petObj = {} as Partial<PetDetail>; // Changed the type to Partial<PetDetail>
        petObj[key] = +form ? +form : (form as any); // Type assertion to any to avoid type error

        const data = petObj as PetDetail;
        await updatePet(petId, data);
      } else {
        const obj: Partial<Record<typeof fieldKey, string>> = {};
        obj[fieldKey] = form;
        await updateUser(obj);
      }

      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = (fieldKey: string, value: string) => {
    if (fieldKey === "weight") {
      const weightNum = Number(value.trim());
      return !isNaN(weightNum) && weightNum > 0;
    }
    if (typeof value === "string") {
      const isValidChars = /^(?=.{2,20}$)[A-Za-z]+( [A-Za-z]+)*$/.test(value);
      if (!isValidChars) return false;
    }

    return true;
  };

  return (
    <Layout
      showBack
      title="Edit Information"
      style={{ justifyContent: "flex-start" }}
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <ScrollDiv keyboardShouldPersistTaps="handled">
        <Div pt={20} flex={1}>
          <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
            {heading || "No Heading Provided"}
          </Text>
          <InputField
            placeholder={placeholder || ""}
            marginBottom={16}
            floatingPlaceholder
            inputStyle={{ borderRadius: 12 }}
            value={form}
            onChangeText={(name) => {
              setForm(name);
            }}
            returnKeyType="done"
            disabled={loading}
          />
        </Div>
      </ScrollDiv>

      <ButtonPrimary
        loading={loading}
        onPress={handleConfirm}
        disabled={!isFormValid(fieldKey, form)}
        // bgColor="primary"
      >
        Confirm
      </ButtonPrimary>
    </Layout>
  );
};

export default EditInfoScreen;
