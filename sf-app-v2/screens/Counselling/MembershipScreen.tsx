import ButtonPrimary from "@/components/partials/ButtonPrimary";
import ModalCard from "@/components/partials/ModalCard";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { IconMessages, IconVideo } from "@tabler/icons-react-native";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { Button, Div, Icon, Image, Modal, ScrollDiv, Text } from "react-native-magnus";

const cardData = [
  {
    heading: "Chat with a qualified counsellor",
    text: "Ask anything to a counsellor with a single click.",
    icon: <IconMessages width={32} height={32} color={"#679FF0"} />,
  },
  {
    heading: "Video Consultant  with Counsellor",
    text: "Schedule a personalised video session with a professional counsellor.",
    icon: <IconVideo width={32} height={32} color={"#679FF0"} />,
  },
];

const MembershipScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  return (
    <Modal isVisible>
      <ScrollDiv>
        <Div flex={1} pb={28}>
          <Button
            bg="transparent"
            px={0}
            style={{
              alignItems: "center",
            }}
            position="absolute"
            zIndex={10}
            left={20}
            top={6}
          >
            <Icon fontSize={28} color="#222222" name={"close"} />
          </Button>

          <Image
            mb={24}
            mx={"auto"}
            source={require("../../assets/images/membership-screen.png")}
            style={styles.image}
          />

          <Div px={22}>
            <Text fontSize={"6xl"} textAlign="center" maxW={317} mx={"auto"} mb={4}>
              Upgrade to use human counselling
            </Text>
            <Text fontSize={"lg"} textAlign="center" maxW={347} mx={"auto"} mb={32}>
              Therapy can help you manage emotional struggles that are hindering your daily
              functioning.
            </Text>

            <FlatList
              data={cardData}
              renderItem={({ item, index }) => (
                <Div
                  flexDir="row"
                  alignItems="center"
                  style={{ gap: 24 }}
                  mb={index === 0 ? 24 : 0}
                >
                  {item.icon}
                  <Div>
                    <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} mb={4}>
                      {item.heading}
                    </Text>
                    <Text
                      fontSize={"lg"}
                      color="darkGreyText"
                      fontFamily={fontHauoraMedium}
                      maxW={294}
                    >
                      {item.text}
                    </Text>
                  </Div>
                </Div>
              )}
              keyExtractor={(item) => item.heading}
            />

            <Text fontFamily={fontHauoraMedium} fontSize={"md"} textAlign="center" mt={24} mb={56}>
              *Separate charges apply for booking a counsellor and for each individual session.
            </Text>

            <ButtonPrimary navigation={navigation} link="HumanCounsellingMessage">
              Try it now
            </ButtonPrimary>
          </Div>
        </Div>
      </ScrollDiv>
    </Modal>
  );
};

export default MembershipScreen;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    minHeight: 480,
    // marginBottom: 40,
    marginTop: -50,
  },
});
