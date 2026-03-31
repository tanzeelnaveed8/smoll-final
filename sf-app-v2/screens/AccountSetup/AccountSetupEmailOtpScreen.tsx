import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { colorPrimary, fontHauora, fontHauoraSemiBold } from "@/constant/constant";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { getAxiosErrMsg } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Keyboard } from "react-native";
import { View } from "react-native-animatable";
import { Button, Div, Input, Text } from "react-native-magnus";
import { useToast } from "react-native-toast-notifications";
import { OtpInput } from "react-native-otp-entry";

interface Props {
  navigation: NavigationType;
  isUpdatingEmail?:string;
}

const AccountSetupEmailOtpScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  const isUpdatingEmail = (route.params as { updatingEmail: string })?.updatingEmail;
 
  const toast = useToast();
  const { user, verifyEmail, sendVerificationEmail } = useUserStore();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpWating, setResendOtpWating] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (resendOtpWating > 0) {
      timer = setInterval(() => {
        setResendOtpWating((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendOtpWating]);

  const handleResend = async () => {
    try {
      setResendOtpLoading(true);
      await sendVerificationEmail();

      setResendOtpWating(30);

      toast.show("The code has been successfully sent to your e-mail.", {
        type: "dark",
        placement: "top",
      });
    } finally {
      setResendOtpLoading(false);
    }
  };

  const handleOtpChange = (otp: string) => {
    setOtp(otp);

    if (otp.length === 4) {
      Keyboard.dismiss();
if(route?.params?.fromwherecall==="ExpertsListDetailScreen"){
VideocallhandleVerify(otp);
}else{
     handleVerify(otp);

}
   
    }
  };

  const handleVerify = async (_otp?: string) => {
    try {
      setLoading(true);

      await verifyEmail(_otp ?? otp);

      if (isUpdatingEmail) {
        props.navigation.navigate("SettingPersonalInfoScreen");
      } else {
        // Check subscription to determine navigation
        const subscription = await AsyncStorage.getItem("subscription");
        
        if (subscription === "smollVet") {
          props.navigation.navigate("WelcomeScreen", {
            showSetupModal: "true",
          });
        } else {
          props.navigation.navigate("HomeScreen", {
            showSetupModal: "true",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

 const VideocallhandleVerify = async (_otp?: string) => {
    try {
      setLoading(true);

      await verifyEmail(_otp ?? otp);

    
        // props.navigation.navigate("SettingPersonalInfoScreen");
       props?.navigation.navigate("ExpertsListScreen");
      
    } finally {
      setLoading(false);
    }
  };

   












  return (
    <Layout
      showBack
      onBackPress={() => {
        props.navigation.goBack();
      }}
    >
      <View style={{ justifyContent: "space-between", flex: 1 }}>
        <Div>
          <Text fontSize={"6xl"} fontFamily={fontHauora} mb={4}>
            Verify your email{" "}
          </Text>
          <Text color="#494949" mb={20} fontSize={"xl"}>
            We have send a 4 digit code to your email address {user?.email}
          </Text>


        

                     <OtpInput
  numberOfDigits={4}
  focusColor="#000"
  blurOnFilled={true}
  disabled={false}
  type="numeric"
  secureTextEntry={false}
  focusStickBlinkingDuration={500}
 
  onTextChange={handleOtpChange}
  onFilled={(text) => console.log(`OTP is ${text}`)}
  textInputProps={{
    accessibilityLabel: "One-Time Password",
  }}
  textProps={{
    accessibilityRole: "text",
    accessibilityLabel: "OTP digit",
    allowFontScaling: false,
  }}
  theme={{
    containerStyle:{justifyContent:"flex-start",gap:12,marginBottom:8},
    pinCodeContainerStyle:{height:55,width:55,borderColor:"#000",backgroundColor:"#fff"},
   
  }}
 
/>

          {resendOtpWating === 0 && (
            <Button
              bg="transparent"
              mt={8}
              p={0}
              color="primary"
              fontFamily={fontHauoraSemiBold}
              onPress={handleResend}
              disabled={loading || resendOtpLoading}
              position="relative"
            >
              <Text
                fontFamily={fontHauoraSemiBold}
                fontSize={"lg"}
                color={resendOtpLoading ? "#ddd" : "primary"}
              >
                Resend Code
              </Text>
              {resendOtpLoading && (
                <Div position="absolute" top={4}>
                  <ActivityIndicator size={16} color={colorPrimary} />
                </Div>
              )}
            </Button>
          )}

          {resendOtpWating > 0 && (
            <Text mt={8} color="#666">
              Resend Code in {resendOtpWating} seconds
            </Text>
          )}
        </Div>

        <ButtonPrimary
          bgColor="primary"
          onPress={() => handleVerify()}
          loading={loading}
          disabled={otp.length < 4 || loading}
        >
          Confirm
        </ButtonPrimary>
      </View>
    </Layout>
  );
};

export default AccountSetupEmailOtpScreen;
