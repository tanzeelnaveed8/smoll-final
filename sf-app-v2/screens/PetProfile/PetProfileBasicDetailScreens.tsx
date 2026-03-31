import InputField from "@/components/partials/InputField";
import TextAreaField from "@/components/partials/TextAreaField";
import { fontHeading } from "@/constant/constant";
import { PetPayloadDto } from "@/store/types/pet";
import React, { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { Div, Text } from "react-native-magnus";

interface Props {
  pet: PetPayloadDto;
  setPet: (pet: PetPayloadDto) => void;
}

const PetProfileBasicDetailScreens: React.FC<Props> = (props) => {
  const [weight, setWeight] = useState(props.pet.weight ? props.pet.weight?.toString() : "");
  const [chipNumber, setChipNumber] = useState(
    props.pet.chipNumber ? props.pet.chipNumber.toString() : ""
  );
  const [age, setAge] = useState(props.pet.age > 0 ? props.pet.age.toString() : "");

  return (
    <Div>
      <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
        Almost done! We need basic pet details.
      </Text>

      {/* <InputField
        value={age}
        onChangeText={(text) => {
          setAge(text);
          props.setPet({ ...props.pet, age: parseInt(text) });
        }}
        placeholder="Age (Years)"
        marginBottom={20}
        inputStyle={{ borderRadius: 12 }}
        keyboardType="number-pad"
      /> */}

      <InputField
        value={weight}
        onChangeText={(text) => {
          setWeight(text);
          props.setPet({ ...props.pet, weight: parseInt(text) });
        }}
        placeholder="Weight (Kg) (Optional)"
        marginBottom={20}
        inputStyle={{ borderRadius: 12 }}
        keyboardType="numeric"
      />

      <InputField
        value={chipNumber}
        onChangeText={(text) => {
          setChipNumber(text);
          props.setPet({ ...props.pet, chipNumber: text });
        }}
        placeholder="Chip Number (Optional)"
        marginBottom={20}
        inputStyle={{ borderRadius: 12 }}
        keyboardType="numeric"
      />

      <TextAreaField
        value={props.pet.preExistingConditions}
        onChangeText={(text) => {
          // setChipNumber(text);
          props.setPet({ ...props.pet, preExistingConditions: text });
        }}
        placeholder="Any pre-existing conditions (Optional)"
        mb={30}
      />
    </Div>
  );
};

export default PetProfileBasicDetailScreens;
