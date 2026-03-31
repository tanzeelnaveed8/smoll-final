import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import React, { useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { Button, Div, Text } from "react-native-magnus";
import * as Progress from "react-native-progress";
import { Dimensions } from "react-native";
import PetRefuseWaterScreen from "./PetRefuseWaterScreen";
import PetHidingScreen from "./PetHidingScreen";
import PetVomitingQuestionScreen from "./PetVomitingQuestionScreen";
import PetContinuousBleedingQuestionScreen from "./PetContinuousBleedingQuestionScreen";
import PetUnconsciousnessQuestionScreen from "./PetUnconsciousnessQuestionScreen";
import PetBreathingDifficultyQuestionScreen from "./PetBreathingDifficultyQuestionScreen";

const windowWidth = Dimensions.get("window").width;

const PetBookingScreen = () => {
  const [progress, setProgress] = useState(0.25);
  const [currentStep, setCurrentStep] = useState(0);

  const nextFormHandler = () => {
    setCurrentStep((prev) => prev + 1);
    setProgress((prev) => prev + 1 / 6);
  };

  return (
    <Div style={styles.container}>
      <Div>
        {/* progress bar */}
        <Progress.Bar
          progress={progress}
          height={8}
          width={windowWidth - 40}
          borderColor="transparent"
          style={{ marginBottom: 32, backgroundColor: "#EFEFEF" }}
        />

        {/* screens */}
        {currentStep === 0 && <PetRefuseWaterScreen />}
        {currentStep === 1 && <PetHidingScreen />}
        {currentStep === 2 && <PetVomitingQuestionScreen />}
        {currentStep === 3 && <PetContinuousBleedingQuestionScreen />}
        {currentStep === 4 && <PetUnconsciousnessQuestionScreen />}
        {currentStep === 5 && <PetBreathingDifficultyQuestionScreen />}
      </Div>

      <Div>
        <ButtonPrimary onTouchEnd={nextFormHandler}>Continue</ButtonPrimary>
      </Div>
    </Div>
  );
};

export default PetBookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
