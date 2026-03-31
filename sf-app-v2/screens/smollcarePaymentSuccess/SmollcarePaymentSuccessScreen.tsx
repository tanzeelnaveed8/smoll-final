import ButtonPrimary from "@/components/partials/ButtonPrimary";
import {
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeading,
} from "@/constant/constant";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import React from "react";
import { Div, Image, Text } from "react-native-magnus";

type RouteType = { petId: string; petName: string };

export default function SmollcarePaymentSuccessScreen({
  navigation,
}: {
  navigation: NavigationType;
}) {
  const route = useRoute();
  const id = (route.params as RouteType)?.petId;
  const name = (route.params as RouteType)?.petName;

  const { petsDetailMap } = usePetStore();
console.log("come in the payment sucee screen =-----------")
 const { findUser } = useUserStore();
const navigates=async()=>{
  console.log("come here in navigate function")
await findUser();
console.log("come here navigate function after api call")
  navigation.navigate("PetProfileDetailsScreen", {
              petId: id,
              activeBenefitTab: true,
              backNavigation: "HomeScreen",
            })



}
  return (
    <Div bg="#FAF8F5" flex={1} alignItems="center" justifyContent="center" px={22}>
      <Div alignItems="center">
        <Image w={202} h={170} source={require("@/assets/images/pop-image.png")} />

        <Div mt={16} alignItems="center">
          <Text
            textAlign="center"
            fontFamily={fontHeading}
            color="#679FF0"
            fontSize="7xl"
            lineHeight={42}
          >
            {name}’s journey to a better care starts today!
          </Text>

          <Text
            textAlign="center"
            fontSize="xl"
            mt={10}
            color="#121212"
            maxW={320}
            fontFamily={fontHauoraSemiBold}
          >
            {name} plan is now active. You can start using it immediately.
          </Text>
        </Div>

        <ButtonPrimary
          alignSelf="center"
          w={200}
          py={12}
          mt={26}
          bg="#6e99f0"
          fontFamily={fontHauoraSemiBold}
          onPress={
          navigates

          }
        >
          Visit Plan
        </ButtonPrimary>
        <Text
          mt={12}
          textAlign="center"
          fontSize="lg"
          fontFamily={fontHauoraMedium}
          color="#535353"
          maxW={280}
        >
          A confirmation email and payment receipt were sent to your email
        </Text>
      </Div>
    </Div>
  );
}
