import HumanCounsellingMessageCard from "@/components/partials/HumanCounsellingMessageCard";
import ModalCard from "@/components/partials/ModalCard";
import { fontHauoraSemiBold } from "@/constant/constant";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Div, Text } from "react-native-magnus";
import ChatScreen from "../ChatScreen";
import Layout from "@/components/app/Layout";
import { NavigationType } from "@/store/types";

const btns = ["Human Counselling", "Ask a Vet"];

const HumanCounsellingMessage: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Human Counselling");

  return (
    <>
      <Layout
        showBack
        onBackPress={() => {
          navigation.goBack();
        }}
      >
        <Div flex={1}>
          {/* <Div flexDir="row" style={styles.tabContainer}>
            {btns.map((item) => (
              <Button
                color="#222222"
                fontFamily={fontHauoraSemiBold}
                fontSize={"lg"}
                p={0}
                m={0}
                onPress={() => {
                  setActiveTab(item);
                }}
                key={item}
                bg="transparent"
                style={{
                  ...styles.btn,
                  ...(activeTab === item ? styles.activeBtn : {}),
                }}
              >
                {item}
              </Button>
            ))}
          </Div> */}

          <Div>
            <Text fontSize={"6xl"} textAlign="center" mb={8}>
              Welcome to Human Counselling
            </Text>
            <Text textAlign="center" maxW={347} mx={"auto"}>
              Our counselors are here to help you navigate challenges, achieve your goals, and
              enhance your well-being.
            </Text>
          </Div>

          <Div mt={50}>
            <HumanCounsellingMessageCard
              onPress={() => {
                navigation.navigate("ChatScreen", { userId: "sywfkkl6cl" });
              }}
            />
          </Div>
        </Div>
      </Layout>
    </>
  );
};

export default HumanCounsellingMessage;

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: "#EFEFEF",
    justifyContent: "space-around",
    marginBottom: 50,
  },
  btn: {
    padding: 8,
    // fontSize: 16,
    borderWidth: 1,
    borderRadius: 34,
    borderColor: "transparent",
  },
  activeBtn: {
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    borderColor: "#679FF0",
  },
});
