import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import DatePickerComponent from "@/components/partials/DatePickerComponent";
import InputField from "@/components/partials/InputField";
import React, { useState } from "react";
import { Div, Text } from "react-native-magnus";

const AddMedicalHistoryInfo: React.FC<{
  open: boolean;
  onClose: () => void;
  heading: string;
  placeholder?: string;
  formType?: string;
}> = ({ open, onClose, heading, placeholder, formType }) => {
  const [form, setForm] = useState("");

  const handleConfirm = () => {};

  return (
    <>
      <Div pt={20} flex={1}>
        <Text fontSize={"4xl"} mb={20}>
          {heading || "No Heading Provided"}
        </Text>
        {formType !== "date" && (
          <InputField
            placeholder={placeholder || ""}
            marginBottom={16}
            floatingPlaceholder
            inputStyle={{ borderRadius: 12 }}
            value={form}
            onChangeText={(e) => {
              setForm(e);
            }}
            multiline={formType === "description"}
            numberOfLines={6}
          />
        )}

        {formType === "date" && (
          <DatePickerComponent value={form} onChange={(dob) => setForm(dob)} />
        )}
      </Div>

      <ButtonPrimary onPress={handleConfirm}>Confirm</ButtonPrimary>
    </>
  );
};

export default AddMedicalHistoryInfo;
