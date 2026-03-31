import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Button, Div, Text } from "react-native-magnus";
import * as Progress from "react-native-progress";
import { Dimensions } from "react-native";
import ProfileNameScreen from "./ProfileNameScreen";
import ProfileNumberScreen from "./ProfileNumberScreen";
import ProfileAddressScreen from "./ProfileAddressScreen";
import Layout from "@/components/app/Layout";
import VerifyNumberScreen from "../auth/VerifyNumberScreen";
import { NavigationType } from "@/store/types";
import { NavigationAction } from "@react-navigation/native";

const windowWidth = Dimensions.get("window").width;

const UserProfileScreen: React.FC<{
  navigation: NavigationType;
  route: { params: { tab: string } };
}> = ({ route, navigation }) => {
  const [progress, setProgress] = useState(0.25);
  const [currentStep, setCurrentStep] = useState(0);
  const { tab } = route.params || "";

  useEffect(() => {
    if (tab === "userAddress") {
      setCurrentStep(3);
      setProgress(1);
    }
  }, [tab]);

  // React.useEffect(
  //   () =>
  //     navigation.addListener(
  //       "beforeRemove",
  //       (e: { preventDefault: () => void }) => {
  //         e.preventDefault();
  //         if (currentStep === 0) {
  //           // If we don't have unsaved changes, then we don't need to do anything
  //           return;
  //         }
  //         console.log("currentStep", currentStep);
  //         if (currentStep === 3) {
  //           navigation.navigate("Confirmation");
  //         }

  //         setCurrentStep((prev) => prev - 1);
  //         setProgress((prev) => prev - 0.25);
  //       }
  //     ),
  //   [navigation, currentStep]
  // );

  const nextFormHandler = () => {
    setCurrentStep((prev) => prev + 1);
    setProgress((prev) => prev + 0.25);
  };

  return (
    <Layout style={styles.container}>
      <Div>
        {/* progress bar */}
        <Progress.Bar
          progress={progress}
          height={8}
          width={windowWidth - 40}
          borderColor="transparent"
          style={{ marginBottom: 32, backgroundColor: "#EFEFEF" }}
        />
        {/* form */}
        {/* {currentStep === 0 ? (
          <ProfileNameScreen />
        ) : currentStep === 1 ? (
          <ProfileNumberScreen />
        ) : currentStep === 2 ? (
          <VerifyEmailScreen />
        ) : currentStep === 3 ? (
          <ProfileAddressScreen />
        ) : } */}

        {currentStep === 0 && <ProfileNameScreen />}
        {currentStep === 1 && <ProfileNumberScreen />}
        {/* {currentStep === 2 && (
          <VerifyNumberScreen
            navigation={navigation}
            onConfirm={() => {
              navigation.navigate("UserProfileForm", { tab: "userAddress" });
            }}
          />
        )} */}
        {/* {currentStep === 3 && <ProfileAddressScreen />} */}
      </Div>

      <Div>
        {currentStep === 3 && (
          <Button
            bg="transparent"
            px={0}
            py={0}
            color="#7B7B7B"
            mx={"auto"}
            mb={32}
            fontSize={"xl"}
          >
            Skip
          </Button>
        )}
        <ButtonPrimary bgColor="primary" onTouchEnd={nextFormHandler}>
          Next
        </ButtonPrimary>
      </Div>
    </Layout>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 20,
  },
});
