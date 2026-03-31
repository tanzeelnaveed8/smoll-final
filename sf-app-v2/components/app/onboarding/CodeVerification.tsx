

import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { fontCooper, fontHauora, fontHeading } from "@/constant/constant";
import { useAuthStore } from "@/store/modules/auth";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconCircleCheck } from "@tabler/icons-react-native";

import React, { useMemo, useState } from "react";
import { View } from "react-native-animatable";
import { Div, ScrollDiv, Text } from "react-native-magnus";
import OnboardingOtpModal from "../onboarding/OnboardingOtpModal";
import { handleNextAction } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface Props {
  navigation: NavigationType;
  code:string
}

const CodeVerification: React.FC<Props> = (props) => {
  const route = useRoute();
     console.log("route.params--->",route.params)

  const isUpdatingEmail = (route.params as { updateEmail: string })?.updateEmail;

  
  const { updateUser, sendVerificationEmail } = useUserStore();
  const { login,codelogin } = useAuthStore();
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const forbiddenCharsRegex =
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}~`!#$%^&*()+=[\]{}|\\:;"'<>,?/]/gu;

    return emailRegex.test(email) && !forbiddenCharsRegex.test(email);
  }, [email]);

  const handleNext = async () => {
 
    if (!isValidEmail) return;
    // console.log("this is come here with mail--->",email) 
    try {
      setLoading(true);
        //  console.log("now call the email verification api--->",email,route?.params?.code)
  await login({
        email:email, 
          orgCode:route?.params?.code
        // orgCode:"code--"

      });
        // console.log("after email api response success---> open the otp modal-->")
      setShowOtpModal(true)

    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      showBack
      onBackPress={() => {
       props.navigation.navigate("SignupScreen");
       
      }}
    >
      <ScrollDiv flex={1} keyboardShouldPersistTaps="handled">
        <Div>
          <Text fontSize={"6xl"} fontFamily={fontHeading} mb={4}>
           Add your email
          </Text>
          <Text color="#494949" mb={20} fontSize={"xl"}>
            Enter the email address that you would like to use with smoll
          </Text>

          <InputField
            value={email}
            placeholder="Enter Your Email"
            floatingPlaceholder
            suffix={isValidEmail ? <IconCircleCheck color="#2F6E20" /> : undefined}
            keyboardType="email-address"
            onChangeText={(text) => setEmail(text)}
            disabled={loading}
            returnKeyType="done"
            autoCapitalize="none"
          />
        </Div>
      </ScrollDiv>
      <ButtonPrimary
        bgColor="primary"
       onPress={handleNext}
        disabled={!isValidEmail || loading}
        loading={loading}
      >
      Verify email
      </ButtonPrimary>



  {/* ✅ Onboarding OTP Modal */}
      <OnboardingOtpModal
        isVisible={showOtpModal}
        onSuccess={async (isNewUser?: boolean) => {
          setShowOtpModal(false);
          console.log("come here after otp success--->")
          const subscription = await AsyncStorage.getItem("subscription");
     console.log("what is this -->",subscription)
          if (subscription === "smollVet") {
            props.navigation.navigate("WelcomeScreen", {
              isNewUser: String(isNewUser),
            });
          } else {
            props.navigation.navigate("HomeScreen", {
              isNewUser: String(isNewUser),
            });
          }
        }}
        onBack={() => setShowOtpModal(false)}
        navigation={props.navigation}
        phone={""} // No phone, since email verification flow
        label={email}
        email={email}
        code={route?.params?.code}
      />

    </Layout>
  );
};

export default CodeVerification;
