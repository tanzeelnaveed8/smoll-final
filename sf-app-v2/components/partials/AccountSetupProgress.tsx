import { fontHauoraBold, fontHauoraMedium } from "@/constant/constant";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Div, Icon, Image, Text } from "react-native-magnus";
import * as Progress from "react-native-progress";

interface Props {
  mb?: number;
  progress: number;
  completedStepCount: number;
}

const windowWidth = Dimensions.get("window").width;

const AccountSetupProgress: React.FC<Props> = (props) => {
  return (
    <Div style={styles.accountSetupTrackerContainer} mb={props.mb}>
      <Div mb={14} flexDir="row" justifyContent="space-between">
        <Div
          flexDir="row"
          style={{
            alignItems: "center",
          }}
        >
          <Text fontSize={"xl"} fontFamily={fontHauoraBold} mr={2}>
            Account setup
          </Text>
          <Icon
            name="info"
            fontFamily="Feather"
            fontSize={"4xl"}
            color="#E02A2A"
            style={{ padding: 2, paddingTop: 5 }}
          />
        </Div>
        <Div flexDir="row" style={{ gap: 4, alignItems: "center" }}>
          <Image w={24} h={24} mx={"auto"} source={require("../../assets/images/flag-icon.png")} />
          <Text fontFamily={fontHauoraMedium} fontSize={"xl"} color="#222222">
            {props.completedStepCount}/3
          </Text>
        </Div>
      </Div>

      <Progress.Bar
        progress={props.progress}
        height={8}
        width={windowWidth - 40}
        borderColor="transparent"
        color="#222"
        style={{ backgroundColor: "#EFEFEF", width: "100%" }}
      />
    </Div>
  );
};

export default AccountSetupProgress;

const styles = StyleSheet.create({
  accountSetupTrackerContainer: {
    paddingVertical: 22,
    paddingHorizontal: 12,
    backgroundColor: "#DFE9EF",
    borderRadius: 12,
    paddingTop: 30,
    // marginBottom: 42,
  },
});
