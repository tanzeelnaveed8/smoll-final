import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontHauoraMedium } from "@/constant/constant";
import { useExpertStore } from "@/store/modules/expert";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconAlertCircle, IconUser } from "@tabler/icons-react-native";
import React from "react";
import { Div, Image, Text } from "react-native-magnus";

const UnavailableScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { expertDetailMap } = useExpertStore();
  const route = useRoute();
  const expertId = (route.params as Record<string, string>)?.expertId;

  console.log("esxp", expertId);

  const expert = expertDetailMap.get(expertId);

  return (
    <Layout title="Temporarily Unavailable">
      <Div flex={1} mt={80}>
        <Div flexDir="row" alignItems="center" mb={24} justifyContent="center">
          <IconAlertCircle
            width={28}
            height={28}
            color={"#E02A2A"}
            style={{ alignSelf: "center" }}
          />
          <Text ml={4} fontSize={"4xl"}>
            Temporarily Unavailable
          </Text>
        </Div>

        <Div alignItems="center" mb={12}>
          {expert?.profileImg ? (
            <Image w={84} h={84} rounded={84} source={{ uri: expert?.profileImg.url }} mb={12} />
          ) : (
            <IconUser size={84} />
          )}
          <Text fontSize={"xl"} fontFamily={fontHauoraMedium}>
            {expert?.name}
          </Text>
          <Text fontSize={"md"} fontFamily={fontHauoraMedium} color="darkGreyText">
            {expert?.designation}
          </Text>
        </Div>

        <Text
          fontSize={"lg"}
          color="darkGreyText"
          fontFamily={fontHauoraMedium}
          textAlign="center"
          maxW={350}
          mx={"auto"}
        >
          Your expert is temporarily unavailable. Please submit another request, and your pet will
          be contacted as soon as possible.
        </Text>
      </Div>

      <ButtonPrimary onPress={() => navigation.navigate("ExpertsListScreen")}>
        Request Another
      </ButtonPrimary>
    </Layout>
  );
};

export default UnavailableScreen;
