import InputField from "@/components/partials/InputField";
import { fontHeading } from "@/constant/constant";
import { PetPayloadDto } from "@/store/types/pet";
import React from "react";
import { Div, Text } from "react-native-magnus";

interface Props {
  pet: PetPayloadDto;
  setPet: (pet: PetPayloadDto) => void;
}

const PetProfileNameScreen: React.FC<Props> = (props) => {
  return (
    <Div>
      <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
        What is your pet's name?
      </Text>
      <InputField
        placeholder="Name"
        marginBottom={16}
        maxLength={20}
        floatingPlaceholder
        inputStyle={{ borderRadius: 12 }}
        value={props.pet.name}
        returnKeyType="done"
        onChangeText={(name) => props.setPet({ ...props.pet, name })}
      />
    </Div>
  );
};

export default PetProfileNameScreen;
