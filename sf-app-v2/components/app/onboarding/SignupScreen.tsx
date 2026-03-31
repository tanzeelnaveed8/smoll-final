import ButtonPrimary from "@/components/partials/ButtonPrimary";
import InputField from "@/components/partials/InputField";
import SelectInput from "@/components/partials/SelectInput";
import { fontHauora, fontHauoraBold } from "@/constant/constant";
import { useAuthStore } from "@/store/modules/auth";
import { NavigationType } from "@/store/types";
import { getAxiosErrMsg } from "@/utils/helpers";
import { AxiosError } from "axios";
import parsePhoneNumber from "libphonenumber-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconArrowRight, IconPhone, IconAt,IconEye ,IconEyeOff,} from "@tabler/icons-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView } from "react-native"; // add this import
import Modal from "react-native-modal";
import {
  Keyboard,
  Linking,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Text as Texts,
} from "react-native";
import { Button, Div, Image, Input, Tag, Text } from "react-native-magnus";
import { GestureResponderEvent } from "react-native-modal";
import Toast from "react-native-toast-notifications";
import ToastContainer from "react-native-toast-notifications/lib/typescript/toast-container";
import Layout from "../Layout";
import OnboardingOtpModal from "./OnboardingOtpModal";
import CountryPickerInput from "@/components/CountryPickerInput";
import { Svg, SvgXml } from "react-native-svg";
import EmailVerificationPopup from "../EmailVerificationPopup";
import CodeIcon from "../../../components/icons/CodeIcon";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface Props {
  navigation: NavigationType;
  isVisible: boolean;
  onBack: () => void;
  onSuccess: (isNewUser?: boolean) => void;
}

const SignupScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const toastRef = useRef<ToastContainer>(null);
  const { login,codelogin } = useAuthStore();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isSelectInputOpen, setIsSelectInputOpen] = useState(false);
  const [ispassHide, setIspassHide] = useState(true);
  const [showEmailVerification, setShowEmailVerification] = useState(true);
  const [active, setActive] = useState<"phone" | "email"| "i_have_code">("phone");

  const [country, setCountry] = useState({
    label: "",  
    value: "",
  });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const CODE_REGEX = /^[0-9A-Z]{6}$/; 
 

   
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

  const handleGetOtp = async () => {
    // navigation.navigate("HomeScreen")
  
   
    try {
      setIsLoading(true);
      Keyboard.dismiss();
    

if(email){
   await login({
        email:email,
        
      });
      
      setShowOtpModal(true);

}else{
  if(phone){
       await login({
        phone:country.value+phone,
      });

      setShowOtpModal(true);

  }
  if(code){
   

  if (!CODE_REGEX.test(code)) {
        toastRef.current?.show("Code must be contain only uppercase letters and numbers", {
          type: "danger",
        });
        return; // Stop further execution
      }
 
        console.log("code is here -->",code)
  
   await codelogin({
        code:code,
      });

      
   
 
        navigation.navigate("codeVerification", { fromSignup: true, code: code,  });   
  }
}
 
    } catch (err) {
      console.log("this is erorr->>>>>>>>>>>>>>>>>>",err)
    } finally {
      setIsLoading(false);
    }
  };
 
const isDisabled = !(phone?.length >8 || email||code?.length);



  return (
    <Layout style={{ 
      backgroundColor: "#FAF8F5",
      paddingHorizontal:30}}>
    <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : undefined}>

      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}  style={{backgroundColor:"grey"}}> 
   
        <Div justifyContent="space-between" pb={2} pt={20}  h="100%">
        
        <>
          <Div>
    <Div alignItems="flex-start"
    mt={100}
    mb={10}>
          
            <Div flexDir="row" alignItems="center" style={{}}>
              <Image w={140} h={38} source={require("../../../assets/logo.png")}/>
            </Div>
          </Div>
         
        
            <Text fontWeight="600" fontSize={24} fontFamily={fontHauora} lineHeight={36} mb={15}>
              Login or Signup
            </Text>
            <Div
              row
              rounded="lg"
              bg="#ECEBEA"
              p={4}
          
              w={"100%"}
              mb={20}>
             
              <Button
                onPress={() => {setActive("phone"),setEmail(""),setCode("")}}
                
                bg={active === "phone" ? "white" : "transparent"}
               
                px={15}
                py={8}
                
                  flex={1}   
                shadow={active === "phone" ? "sm" : undefined}>
                <Div row alignItems="center" style={{ gap: 5 }}>
                  <IconPhone
                 
                    size={16}
                    strokeWidth={2.7}
                    color={active === "phone" ? "#2563eb" : "#858B91"}
                    style={{ alignSelf: "center" }}/>
                  <Texts
                         

                    style={{
                      fontWeight: "bold",
                      color: active === "phone" ? "#2563eb" : "#858B91",
                      
                    }}>
                    Phone
                  </Texts>
                </Div>
              </Button>

             
              <Button
                onPress={() => {setActive("email"),
                  setPhone(""),setCode("")
                  setCountry({ label: "", value: "" }) }}
                bg={active === "email" ? "white" : "transparent"}
                
                px={15}
                py={8}
                shadow={active === "email" ? "sm" : undefined}
                  flex={1}      >
                <Div row alignItems="center" style={{ gap: 5 }}>
                  <IconAt
                   
                    size={15}
                    
                    strokeWidth={2.7}
                    color={active === "email" ? "#2563eb" : "#858B91"}
                    style={{ alignSelf: "center" }}/>
                  <Texts
                    style={{
                      fontWeight: "bold",
                      color: active === "email" ? "#2563eb" : "#858B91",
                      
                    }}> 
                    Email
                  </Texts>
                </Div>
               </Button>
                 <Button
                onPress={() => {setActive("i_have_code"),
                  setPhone("")
                  setEmail("")
                  setCountry({ label: "", value: "" })   
                }}
              
                bg={active === "i_have_code" ? "white" : "transparent"}
            
                py={8}
                shadow={active === "i_have_code" ? "sm" : undefined}>
                <Div row alignItems="center" style={{ gap: 3 }}>
              
                        
                         <CodeIcon active={active === "i_have_code"} height={13} width={13} size={13}/>
                  <Texts
                    style={{
                      fontWeight: "bold",
                      color: active === "i_have_code" ? "#2563eb" : "#858B91",
                      fontSize:13
                    }}>I have Code
                  </Texts>
                </Div>
              </Button>

            </Div>

            <View style={{ gap: 10 }}>
          { active === "phone" ?
             (<>
                  <View>
               
                <CountryPickerInput
  codes={codes}
  country={country}
  setCountry={setCountry}/>
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
                    onFocusChange={((focus)=>setIsInputFocused(focus))}
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
                    fontWeight: "900",}}
               fontFamily={fontHauoraBold}
                  value={phone}
                  focus={isFocused}
                  maxLength={17}
                  textContentType={Platform.OS === "ios" ? "telephoneNumber" : undefined}
                  prefix={
                    <IconPhone
                 
                      size={18}
                      strokeWidth={2.7}
                      color={isFocused ? "#C8CACD" : "#858B91"}
                      style={{ alignSelf: "center" }}/>
                  }  />
              </View>
              </>)
             : active === "email" ?
             (<>
                  <View>
                <Text style={{ fontSize: 14, fontWeight: "900", marginBottom: 6, color: "#222" }}>
                  Email
                </Text>
                <InputField
                onFocusChange={((focus)=>setIsInputFocused(focus))}
                  onChangeText={(value) => {
                 
                    setEmail(value); 
                     setCode("") 
                   
                    setPhone("");
                

                  }}
                
                  placeholder={"Enter your email"}
                  placeholderTextColor={"#858B91"}
                  borderColor="#ddd"
               
                  inputStyle={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    backgroundColor: "transparent",
                    height: 48,
                    paddingHorizontal: 12,
                    fontWeight: "900",
                  }}
                 
                  secureTextEntry={false}
                  prefix={
                  
                    <Image
                
                    style={{tintColor:"#858B91"}}
                      w={18}
                      h={18}
                      source={require("../../../assets/icons/emailicon.png")}/>}/>
              </View>
              </>)
              :
               (<>
                  <View>
                <Text style={{ fontSize: 14, fontWeight: "900", marginBottom: 6, color: "#222" }}>
                 Code
                </Text>
                <InputField
autoCapitalize="characters" 
                  onChangeText={(value) => {
              
                  
                    setCode(value) 
                    setEmail("");
                    setPhone("");
             

                  }}
                    onFocusChange={((focus)=>setIsInputFocused(focus))}
                  
                  placeholder={"Enter your code"}
                  placeholderTextColor={"#858B91"}
                  borderColor="#ddd"
                  keyboardType="ascii-capable"
                  inputStyle={{
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    backgroundColor: "transparent",
                    height: 48,
                    paddingHorizontal: 12,
                    fontWeight: "900",
                  }}
              
                  maxLength={6}
                  secureTextEntry={false}
                  prefix={
                  
                 
                     <CodeIcon  height={16} width={16}/>       }/>
              </View>
              
              </>)
            }

            </View>

            <Div style={{ gap: 20, marginTop: 20 }} flexDir="row" alignItems="flex-start">
    <Pressable
  onPress={handleGetOtp}
  style={{
    backgroundColor: "#5692E9",
    height: 40,
    width: 210,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    opacity: isDisabled ? 0.7 : 1,
  }}
disabled={!(
    (active === "phone" && phone?.length > 8) ||
    (active === "email" && email) 
    ||
     (active === "i_have_code" && code?.length)
  )}
>
  {isLoading ? (
    <ActivityIndicator size="small" color="#fff" />
  ) : (
    <Text
      fontFamily={fontHauoraBold}
      fontSize={18}   // equivalent to "xl"
      color="#fff"
    >
      {active === "i_have_code" ? "Validate Code" : "Get OTP"}
    </Text>
  )}
</Pressable>

        <Pressable  style={{marginTop:5}}  onPress={handleGetOtp} disabled={!(
    (active === "phone" && phone?.length > 8) ||
    (active === "email" && email) 
    ||
     (active === "i_have_code" && code?.length)
  )}  >
              <IconArrowRight
                width={32}
                height={32}
                strokeWidth={2.7}
                opacity={isDisabled?0.7:1}
                color={ "#5692E9"}
                style={{ alignSelf: "center" }}
     />
     </Pressable>

            </Div>
          </Div>
          </>
          {
          !isInputFocused&&
           <Div style={{alignSelf:"flex-start",
        alignItems:"flex-end"}}>
            <Text
              fontSize={"md"}
              fontFamily={fontHauora}
              color="#7B7B7B"
              // textAlign="center"
              maxW={306}
              mx={"auto"}
            >
              By signing up, I agree to Smoll{" "}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://smoll.me/terms-and-conditions")}
              >
                <Text lineHeight={24}>Terms & Conditions and Privacy Policy</Text>
              </TouchableOpacity>
            </Text>
          </Div>
          }

                    </Div>
             

      </TouchableWithoutFeedback>
      </KeyboardAvoidingView>   

      <OnboardingOtpModal
        isVisible={showOtpModal}
        onSuccess={async (isNewUser?: boolean) => {
          setShowOtpModal(false);
          
          // Check subscription to determine navigation
          const subscription = await AsyncStorage.getItem("subscription");
          
          if (subscription === "smollVet") {
            navigation.navigate("WelcomeScreen", {
              isNewUser: String(isNewUser),
            });
          } else {
            navigation.navigate("HomeScreen", {
              isNewUser: String(isNewUser),
            });
          }

        }}
        onBack={() => setShowOtpModal(false)}
        navigation={navigation}
        phone={country.value + phone}
        label={email?email:`${country.value + " " + phone}`}
        email={email}/>

      <Toast ref={toastRef} placement="top" textStyle={{ textTransform: "capitalize" }}/>
    </Layout>
  );
};

export default SignupScreen;
const Country: React.FC<{
  label: string;
  flag: string;
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}> = ({ label, flag, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Div
        borderBottomWidth={0.75}
        borderColor="#DEDEDE"
        py={16}
        flexDir="row"
        alignItems="center"
        px={16}>
       
        <Image src={flag} h={18} w={26} mr={16} style={{ objectFit: "contain" }}/>
        <Text fontSize="lg">{label}</Text>
      </Div>
    </TouchableOpacity>
  );
};