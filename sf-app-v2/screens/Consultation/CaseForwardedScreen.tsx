import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontHauoraMedium } from "@/constant/constant";
import React from "react";
import { Div, Image, Text } from "react-native-magnus";

const CaseForwardedScreen = () => {
  return (
    <Layout showCloseIcon backBtnText="" title="Case Forwarded">
      <Div pt={12} flex={1}>
        <Image
          w={280}
          h={210}
          rounded={84}
          source={require("../../assets/images/case-forwarded-img.png")}
          mx={"auto"}
          mb={12}
        />

        <Text fontSize={"6xl"} mb={12} maxW={320} mx={"auto"} textAlign="center">
          Your pet needs immediate physical attention,
        </Text>
        <Text fontSize={"lg"} fontFamily={fontHauoraMedium} mb={20} textAlign="center">
          Your doctor has forwarded your case to the physical clinic for an in-clinic visit and
          review. Our clinic will review the case and send pricing and availability for your pet's
          needs.
        </Text>

        <Text fontSize={"lg"} fontFamily={fontHauoraMedium} textAlign="center">
          You will receive a notification.
        </Text>
      </Div>

      <ButtonPrimary>Understood</ButtonPrimary>
    </Layout>
  );
};

export default CaseForwardedScreen;
