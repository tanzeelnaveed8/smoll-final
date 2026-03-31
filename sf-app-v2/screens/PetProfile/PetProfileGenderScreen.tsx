import RadioButton from "@/components/partials/RadioButton";
import { fontHeading } from "@/constant/constant";
import { PetPayloadDto, PetGenderEnum } from "@/store/types/pet.d";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { Div, Text } from "react-native-magnus";

interface Props {
  pet: PetPayloadDto;
  setPet: (pet: PetPayloadDto) => void;
}

const data = [PetGenderEnum.MALE, PetGenderEnum.FEMALE];

const PetProfileGenderScreen: React.FC<Props> = (props) => {
  const [selectedOption, setSelectedOption] = useState(props.pet.gender || PetGenderEnum.MALE);

  return (
    <Div>
      <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
        Is {props.pet.name} a Male or a Female?
      </Text>

      {data.map((item, index) => (
        <RadioButton
          key={item}
          onTap={() => {
            setSelectedOption(item);
            props.setPet({ ...props.pet, gender: item });
          }}
          value={item}
          label={item}
          selectedValue={selectedOption}
          styles={{ marginBottom: index + 1 === data.length ? 0 : 16 }}
        />
      ))}
    </Div>
  );
};

export default PetProfileGenderScreen;
