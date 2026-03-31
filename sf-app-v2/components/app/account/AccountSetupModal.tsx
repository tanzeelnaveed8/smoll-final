import AccountSetupProgress from "@/components/partials/AccountSetupProgress";
import BottomSheet from "@/components/partials/BottomSheet";
import {
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeading,
} from "@/constant/constant";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Button, Div, Icon, Image, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
  isVisible: boolean;
  onBack: () => void;
}

const stepsBtn: {
  name: string;
  value: "basic" | "email" | "pet";
  link: string;
}[] = [
  {
    name: "Basic Details",
    value: "basic",
    link: "ProfileAddressScreen",
  },
  {
    name: "Email Verification",
    value: "email",
    link: "VerifyEmail",
  },
  {
    name: "Pet Profile",
    value: "pet",
    // link: "PetProfileForm",
    link: "PetProfileScreen",
  },
];

const AccountSetupModal: React.FC<Props> = (props) => {
  const { user } = useUserStore();

  const [completedSteps, setCompletedSteps] = useState({
    basic: false,
    email: false,
    pet: false,
  });

  const completedStepCount = useMemo(
    () => Object.values(completedSteps).filter((step) => step).length,
    [completedSteps]
  );

  useEffect(() => {
    if (user?.address) {
      setCompletedSteps((s) => ({
        ...s,
        basic: true,
      }));
    }

    if (user?.email && user.isEmailVerified) {
      setCompletedSteps((s) => ({
        ...s,
        email: true,
      }));
    }

    if (user?.petCount) {
      setCompletedSteps((s) => ({
        ...s,
        pet: true,
      }));
    }
  }, [user]);

  const handleStepPress = (value: "basic" | "email" | "pet") => {
    // closing the modal
    props.onBack();

    if (value === "basic") {
      props.navigation.navigate("AccountSetupAddressScreen");
    } else if (value === "email") {
      props.navigation.navigate("AccountSetupEmailScreen");
    } else if (value === "pet") {
      props.navigation.navigate("PetProfileScreen", {
        from: "modal",
      });
    }
  };

  return (
    <BottomSheet showCloseIcon onCloseIconClick={props.onBack} isVisible={props.isVisible} h="92%">
      <Div>
        <Text fontSize={"6xl"} mb={12} fontFamily={fontHeading}>
          {user?.name}, let’s finish setting up your account
        </Text>

        <AccountSetupProgress
          mb={42}
          completedStepCount={completedStepCount}
          progress={completedStepCount / stepsBtn.length}
        />

        <FlatList
          data={stepsBtn}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={styles.stepBtn}
                disabled={completedSteps[item.value]}
                onPress={() => handleStepPress(item.value)}
              >
                <Button
                  pointerEvents="none"
                  disabled={completedSteps[item.value]}
                  p={0}
                  bg="transparent"
                  w={"100%"}
                >
                  <Div style={styles.btnTextContainer}>
                    <Text
                      fontSize={"xl"}
                      fontFamily={fontHauoraSemiBold}
                      style={{
                        ...(completedSteps[item.value] ? styles.completedStepStyle : {}),
                      }}
                    >
                      {item.name}
                    </Text>

                    {!completedSteps[item.value] && (
                      <Icon
                        name="chevron-right"
                        fontFamily="Feather"
                        color="#222222"
                        fontSize={"4xl"}
                      />
                    )}
                  </Div>

                  {completedSteps[item.value] ? (
                    <Icon
                      name="checkcircle"
                      fontFamily="AntDesign"
                      fontSize={"4xl"}
                      color="#368526"
                    />
                  ) : (
                    <Div style={styles.emptyCheckbox} />
                  )}
                </Button>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.name}
        />
      </Div>
    </BottomSheet>
  );
};

export default AccountSetupModal;

const styles = StyleSheet.create({
  accountSetupTrackerContainer: {
    paddingVertical: 22,
    paddingHorizontal: 12,
    backgroundColor: "#DFE9EF",
    marginBottom: 42,
    borderRadius: 12,
  },
  stepBtn: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: "#D0D7DC",
  },
  btnTextContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: "auto",
  },
  emptyCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 50,
    backgroundColor: "#F3F3F3",
  },
  completedStepStyle: {
    color: "#494949",
    textDecorationLine: "line-through",
  },
});
