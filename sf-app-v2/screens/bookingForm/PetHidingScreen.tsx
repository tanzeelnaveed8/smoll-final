import InputField from "@/components/partials/InputField";
import RadioButton from "@/components/partials/RadioButton";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Div, Text } from "react-native-magnus";

const data = ["Yes", "No"];

const PetHidingScreen = () => {
  const [selectedOption, setSelectedOption] = useState("");

  return (
    <Div>
      <Text fontSize={"4xl"} mb={20}>
        Is your pet hiding or avoiding contact?
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

export default PetHidingScreen;
