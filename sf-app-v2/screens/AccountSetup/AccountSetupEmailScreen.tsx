import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { fontCooper, fontHauora, fontHeading } from "@/constant/constant";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconCircleCheck } from "@tabler/icons-react-native";

import React, { useMemo, useState } from "react";
import { View } from "react-native-animatable";
import { Div, ScrollDiv, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
  fromwherecall?:string
}

const AccountSetupEmailScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  // console.log("this isb props -->",route?.params)
  const isUpdatingEmail = (route.params as { updateEmail: string })?.updateEmail;

  const { updateUser, sendVerificationEmail } = useUserStore();

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

    try {
      setLoading(true);

      await updateUser({ email });
      await sendVerificationEmail();
 
      props.navigation.navigate("AccountSetupEmailOtpScreen", {
        updatingEmail: isUpdatingEmail,
        fromwherecall:route?.params?.fromwherecall
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      showBack
      onBackPress={() => {
      

        if (route?.params?.fromwherecall==="ExpertsListDetailScreen") {
       
        props.navigation.goBack();
        }
        else{
        if (isUpdatingEmail) {
          props.navigation.navigate("SettingPersonalInfoScreen");
        } else {
          props.navigation.navigate("Home", {
            showSetupModal: "true",
          });
        }
             }

      }}
    >
      <ScrollDiv flex={1} keyboardShouldPersistTaps="handled">
        <Div>
          <Text fontSize={"6xl"} fontFamily={fontHeading} mb={4}>
          {route?.params?.fromwherecall?"Verify your email":"What’s your email?"}
            
          </Text>
          <Text color="#494949" mb={20} fontSize={"xl"}>
            Enter the email address that you would like to use with smoll
          </Text>

          <InputField
            value={email}
            placeholder="Email address"
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
        Next
      </ButtonPrimary>
    </Layout>
  );
};

export default AccountSetupEmailScreen;
