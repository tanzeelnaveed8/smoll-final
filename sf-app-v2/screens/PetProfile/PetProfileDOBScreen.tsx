import DatePickerComponent from "@/components/partials/DatePickerComponent";
import { fontHeading } from "@/constant/constant";
import { PetPayloadDto } from "@/store/types/pet";
import dayjs from "dayjs";
import React from "react";
import { Div, Text } from "react-native-magnus";

interface Props {
  pet: PetPayloadDto;
  setPet: (pet: PetPayloadDto) => void;
}

const PetProfileDOBScreen: React.FC<Props> = (props) => {
  const getAgeFromDOB = (dob: string): number => {
    const today = dayjs();
    const birthDate = dayjs(dob, "ddd MMM DD YYYY");
    let age = today.year() - birthDate.year();
    const monthDifference = today.month() - birthDate.month();

    if (monthDifference < 0 || (monthDifference === 0 && today.date() < birthDate.date())) {
      age--;
    }
    return age;
  };

  // dayjs(props.pet.dob).toDate();

  return (
    <Div>
      <Text fontSize={"4xl"} mb={20} fontFamily={fontHeading}>
        Great name! When was {props.pet.name.trim()} born?
      </Text>
      <DatePickerComponent
        value={props.pet.dob}
        onChange={(dob) => {
          const date = dob.toDateString();
          props.setPet({ ...props.pet, dob, age: getAgeFromDOB(date) });
        }}
        maxDate={new Date()}
      />
    </Div>
  );
};

export default PetProfileDOBScreen;
