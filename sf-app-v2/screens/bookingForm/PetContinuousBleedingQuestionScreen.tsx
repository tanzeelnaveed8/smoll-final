import InputField from "@/components/partials/InputField";
import RadioButton from "@/components/partials/RadioButton";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Div, Text } from "react-native-magnus";

const data = ["Yes", "No"];

const PetContinuousBleedingQuestionScreen = () => {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <Div>
      <Text fontSize={"4xl"} mb={20}>
        Does your pet experience any type of continuous bleeding?
      </Text>

      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <RadioButton
            onTap={() => {
              setSelectedOption(item);
            }}
            value={item}
            label={item}
            selectedValue={selectedOption}
            styles={{ marginBottom: index + 1 === data.length ? 0 : 16 }}
          />
        )}
        keyExtractor={(item) => item}
      />
    </Div>
  );
};

export default PetContinuousBleedingQuestionScreen;
