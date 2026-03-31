


import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import { fontCooper, fontHauora, fontHeading ,fontHauoraBold} from "@/constant/constant";
import { useAuthStore } from "@/store/modules/auth";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconCircleCheck ,IconPhone} from "@tabler/icons-react-native";

import { Platform, Pressable } from "react-native";
import React, { useMemo, useState } from "react";
import { View } from "react-native-animatable";
import { Div, ScrollDiv, Text } from "react-native-magnus";
// import OnboardingOtpModal from "../onboarding/OnboardingOtpModal";
import { handleNextAction } from "@stripe/stripe-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CountryPickerInput from "@/components/CountryPickerInput";
import parsePhoneNumber from "libphonenumber-js";
import OnboardingOtpModal from "@/components/app/onboarding/OnboardingOtpModal";
import PhoneOTPmodal from "@/components/app/onboarding/phoneOTPmodal";
import api from "@/utils/api";
interface Props {
  navigation: NavigationType;
  code:string
}

const PhoneVerificationScreen: React.FC<Props> = (props) => {
  const route = useRoute();
    //  console.log("route.params--->",route.params)

  const isUpdatingEmail = (route.params as { updateEmail: string })?.updateEmail;

  
 const { sendVerificationPhone} = useUserStore();
  const {verifyNumberOtp  } = useAuthStore();
  const [showOtpModal, setShowOtpModal] = useState(false);
    const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [country, setCountry] = useState<{ label: string; value: string; flag: string }>({
    flag: "",
    label: "",
    value: ""
  });
  const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [codes, setCodes] = useState<{ label: string; value: string; flag: string }[]>([
    // {
    //   flag: "https://flagcdn.com/w320/in.png",
    //   label: "(+91) India",
    //   value: "+91",
    // },
    {
      flag: "https://flagcdn.com/w320/ae.png",
      label: "(+971) United Arab Emirates",
      value: "+971",
    },
    //     {
    //   flag: "https://flagcdn.com/w320/in.png",
    //   label: "(+91) United States ",
    //   value: "+19",
    // },
  ]);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const forbiddenCharsRegex =
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}~`!#$%^&*()+=[\]{}|\\:;"'<>,?/]/gu;

    return emailRegex.test(email) && !forbiddenCharsRegex.test(email);
  }, [email]);

  const handleNext = async () => {
     
    // if (!isValidEmail) return;
  
     
    try {
      setLoading(true);
               const fullPhoneNumber = `${country?.value}${phone}`;
  console.log("Full phone number:", fullPhoneNumber); 
          
         await api.patch("/members/me",{phone: fullPhoneNumber });

         console.log("now call the email verification api--->")
        await sendVerificationPhone();
        // await verifyNumberOtp({otp:} );
   
        console.log("after email api response success---> open the otp modal-->")
      setShowOtpModal(true)

    }  
    catch(e){console.log("-----------------------------",e)}
    finally {
      setLoading(false);
    }
  };
   const handlePhoneChange = (value: string) => {
    
    const phoneNumber = parsePhoneNumber(value);

    // Remove any non-digit characters
    let cleanedValue = value.replace(/\D/g, "");

    // Remove country code if present and valid
    if (country.value && country.value.length > 1) {
      const codeWithoutPlus = country.value.slice(1); // Remove the '+' from the country code
      const codeRegex = new RegExp(`^${codeWithoutPlus}`);
      cleanedValue = cleanedValue.replace(codeRegex, "");
    }
    
    // Limit to 10 digits

    if (phoneNumber && phoneNumber.isValid()) {
      const formattedPhone = phoneNumber.formatNational();
      cleanedValue = formattedPhone;
    }
    setPhone(cleanedValue.replace(/\s/g, ""));
  }; 
  // console.log("00000000",country)

  return (
    <Layout
      showBack
      onBackPress={() => {
       props.navigation.goBack()
       
      }}
    >
      <ScrollDiv flex={1} keyboardShouldPersistTaps="handled">
        <Div>
          <Text fontSize={"6xl"} fontFamily={fontHeading} mb={4}>
          Add Phone Number
          </Text>
          <Text color="#494949" mb={20} fontSize={"xl"}>
            Enter the Number that you would like to use with smoll
          </Text>
       
                 <View style={{  marginBottom: 20 }}>
               
                <CountryPickerInput
  codes={codes}
  country={country}
  setCountry={setCountry}

/>
                
              </View>
                    <View>
                <Text style={{ fontSize: 14, fontWeight: "900", marginBottom: 6, color: "#222" }}>
                  Phone Number
                </Text>
                <InputField
                disabled={country?.value?false:true}
                  onChangeText={handlePhoneChange}
                  placeholder={
                    country?.value ? `Enter your phone number` : "Enter your phone number"
                  }
                    // onFocusChange={((focus)=>setIsInputFocused(focus))}
                  placeholderTextColor={"#858B91"}
                  borderColor="#ddd"
                  keyboardType="phone-pad"
                  inputStyle={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    backgroundColor: "transparent",
                    height: 48,
                    paddingHorizontal: 12,
                    fontWeight: "900",
                  
                
                  }}
               fontFamily={fontHauoraBold}
                  value={phone}
                  focus={isFocused}
                  maxLength={17}
                  textContentType={Platform.OS === "ios" ? "telephoneNumber" : undefined}
                  prefix={
                    <IconPhone
                      // width={}
                      // height={32}
                      size={18}
                      strokeWidth={2.7}
                      // color={ "#858B91"}
                      color={isFocused ? "#C8CACD" : "#858B91"}
                      style={{ alignSelf: "center" }}
                    />
                  }
                />
              </View>

       

        </Div>
      </ScrollDiv>
      <ButtonPrimary
        bgColor="primary"
       onPress={handleNext}
        disabled={phone?.length > 8 ? false : true}
        loading={loading}
      >
      Verify Phone Number
      </ButtonPrimary>
        <PhoneOTPmodal
        isVisible={showOtpModal}
        onSuccess={async (isNewUser?: boolean) => {
          setShowOtpModal(false);
             props.navigation.navigate("ExpertsListScreen");
    //       const subscription = await AsyncStorage.getItem("subscription");
    //  console.log("what is this -->",subscription)
          // if (subscription === "smollVet") {
          //   props.navigation.navigate("ExpertsListScreen", {
          //     isNewUser: String(isNewUser),
          //   });
          // } else {
          //   props.navigation.navigate("HomeScreen", {
          //     isNewUser: String(isNewUser),
          //   });
          // }
        }}
        onBack={() => setShowOtpModal(false)}
        navigation={props.navigation}
    
      />



 

    </Layout>
  );
};

export default PhoneVerificationScreen;

 {/* ✅ Onboarding OTP Modal */}
    //   <OnboardingOtpModal
    //     isVisible={showOtpModal}
    //     onSuccess={async (isNewUser?: boolean) => {
    //       setShowOtpModal(false);
    //       const subscription = await AsyncStorage.getItem("subscription");
    //  console.log("what is this -->",subscription)
    //       if (subscription === "smollVet") {
    //         props.navigation.navigate("WelcomeScreen", {
    //           isNewUser: String(isNewUser),
    //         });
    //       } else {
    //         props.navigation.navigate("HomeScreen", {
    //           isNewUser: String(isNewUser),
    //         });
    //       }
    //     }}
    //     onBack={() => setShowOtpModal(false)}
    //     navigation={props.navigation}
    //     phone={""} // No phone, since email verification flow
    //     label={email}
    //     email={email}
    //     code={route?.params?.code}
    //   />