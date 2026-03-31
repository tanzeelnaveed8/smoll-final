



import BackButton from "@/components/partials/BackButton";
import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { colorPrimary, fontHauora } from "@/constant/constant";
import { useAuthStore } from "@/store/modules/auth";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { getAxiosErrMsg, getUserTimezoneOffset } from "@/utils/helpers";
import { AxiosError } from "axios";

import InputField from "@/components/partials/InputField";
import React, { useRef, useState, useEffect } from "react";
import { Button, Div, Image, Text } from "react-native-magnus";
import Toast from "react-native-toast-notifications";
import ToastContainer from "react-native-toast-notifications/lib/typescript/toast-container";
import OnboardingUserModal from "./OnboardingUserModal";
import { ActivityIndicator, Keyboard, Linking, TextInput, TouchableWithoutFeedback } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OtpInput } from "react-native-otp-entry";

interface Props {
  navigation: NavigationType;
  isVisible: boolean;
 
  onBack: () => void;
  onSuccess: (isNewUser?: boolean) => void;

 
  
}

const PhoneOTPmodal: React.FC<Props> = (props) => {
 
  const { verifyOtp, login ,verifyNumberOtp} = useAuthStore();
  const { findUser, updateUser } = useUserStore();

  const toastRef = useRef<ToastContainer>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);

  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpWating, setResendOtpWating] = useState(0);
  const [otp, setOtp] = useState("");
   const inputsRef = useRef<TextInput[]>([]);

  const handleConfirm = async (_otp?: string) => {

    try {
      Keyboard.dismiss();
 
      setIsLoading(true);
      
        // console.log("here phone")
         console.log("otp confirm 66666666666666666666->",_otp)
        await verifyNumberOtp( {otp: _otp ?? otp });
        console.log("come here or not===============------------>")
    
      const user = await findUser();
      

      if (!user.timeZone) {
        await updateUser({ timeZone: getUserTimezoneOffset() });
      }

  
        props.onSuccess();
      
    } catch (err) {
      
      const msg = getAxiosErrMsg(err as AxiosError);

      toastRef.current?.show(msg, {
        type: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: string) => {
    setOtp(e);
 
    if (e.length === 4) {
     

      handleConfirm(e);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

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

      await login(
      { phone: props.phone }
      
      );

      setResendOtpWating(30);

      toastRef.current?.show("The code has been successfully sent to your number.", {
        type: "dark",
      });
    } finally {
      setResendOtpLoading(false);
    }
  };
  const back=()=>{
    props.onBack()
    setOtp("")
  }

  return (
    <>
      <BottomSheet isVisible={props.isVisible} h="95%" showCloseIcon={false} barMb={28}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <Div h="100%">
            <BackButton onPress={back} mb={20} />
               <Div mb={20}>
              <Image
                w={142}
                h={85}
                source={require("../../../assets/images/verification_paper.png")}
                style={{objectFit:"contain"}}
              />
            </Div>
            <Text fontSize={"5xl"} fontFamily={fontHauora} mb={4}>
              Enter your verification code
            </Text>

            <Text fontSize={"xl"} mb={24} color="#494949">
            
              We have sent you a 4 digit code to the {props.email ? "email" : "phone number"}{" "}
              <Text fontSize={"xl"} color="#222222">
                {props.label}
              </Text>
            </Text>
            <OtpInput
  numberOfDigits={4}
  focusColor="#000"
  blurOnFilled={true}
  disabled={false}
  type="numeric"
  secureTextEntry={false}
  focusStickBlinkingDuration={500}
  onFocus={() => console.log("Focused")}
  onBlur={() => console.log("Blurred")}
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
                px={0}
                py={0}
                mb={32}
                disabled={isLoading || resendOtpLoading}
                fontSize={"md"}
                fontFamily={fontHauora}
                onPress={handleResend}
                position="relative"
              >
                <Text color={resendOtpLoading ? "#ddd" : "#0189F9"}>Resend Code</Text>
                {resendOtpLoading && (
                  <Div position="absolute" top={4}>
                    <ActivityIndicator size={16} color={colorPrimary} />
                  </Div>
                )}
              </Button>
            )}

            {resendOtpWating > 0 && (
              <Text mb={32} color="#666">
                Resend Code in {resendOtpWating} seconds
              </Text>
            )}

            <ButtonPrimary
              // bgColor="primary"
              onPress={() => handleConfirm()}
              loading={isLoading}
              disabled={isLoading || otp.length < 4}
            >
              Confirm
            </ButtonPrimary>

            <Div mt={24} style={{ flexDirection: "row", justifyContent: "center" }}>
              <Text fontSize={16} color="#6B6B6B" fontFamily={fontHauora}>
                Can't find the code?{" "}
              </Text>
              <Button
                bg="transparent"
                color="#222222"
                px={0}
                py={0}
                fontSize={16}
                fontFamily={fontHauora}
                onPress={() => Linking.openURL("https://smoll.me/help")}
              >
                Get help
              </Button>
            </Div>
          </Div>
        </TouchableWithoutFeedback>

        <OnboardingUserModal isVisible={showNameModal} onSuccess={props.onSuccess} />

        <Toast ref={toastRef} placement="top" textStyle={{ textTransform: "capitalize" }} />
      </BottomSheet>
    </>
  );
};

export default PhoneOTPmodal;