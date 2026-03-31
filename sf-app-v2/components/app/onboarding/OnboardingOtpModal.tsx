//  import BackButton from "@/components/partials/BackButton";
// import BottomSheet from "@/components/partials/BottomSheet";
// import ButtonPrimary from "@/components/partials/ButtonPrimary";
// import { colorPrimary, fontHauora } from "@/constant/constant";
// import { useAuthStore } from "@/store/modules/auth";
// import { useUserStore } from "@/store/modules/user";
// import { NavigationType } from "@/store/types";
// import { getAxiosErrMsg, getUserTimezoneOffset } from "@/utils/helpers";
// import { AxiosError } from "axios";

// import React, { useRef, useState, useEffect } from "react";
// import { Button, Div, Image, Text } from "react-native-magnus";
// import Toast from "react-native-toast-notifications";
// import ToastContainer from "react-native-toast-notifications/lib/typescript/toast-container";
// import OnboardingUserModal from "./OnboardingUserModal";
// import { ActivityIndicator, Keyboard, Linking, TextInput, TouchableWithoutFeedback } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// interface Props {
//   navigation: NavigationType;
//   isVisible: boolean;
//   phone: string;
//   label: string;
//   onBack: () => void;
//   onSuccess: (isNewUser?: boolean) => void;
//   email: string;
//   code?: string;
// }

// const OnboardingOtpModal: React.FC<Props> = (props) => {
//   const { verifyOtp, login } = useAuthStore();
//   const { findUser, updateUser } = useUserStore();

//   const toastRef = useRef<ToastContainer>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [showNameModal, setShowNameModal] = useState(false);
//   const [resendOtpLoading, setResendOtpLoading] = useState(false);
//   const [resendOtpWating, setResendOtpWating] = useState(0);

//   const [otp, setOtp] = useState(["", "", "", ""]);
//   const inputsRef = useRef<TextInput[]>([]);

//   // Combine OTP array to string
//   const otpValue = otp.join("");

//   const handleConfirm = async (_otp?: string) => {
//     try {
//       Keyboard.dismiss();
//       setIsLoading(true);

//       const otpToSend = _otp ?? otpValue;

//       if (props?.email) {
//         if (props?.code) {
//           await verifyOtp({ email: props.email, otp: otpToSend, orgCode: props?.code });
//           const subscription = await AsyncStorage.getItem("subscription");
//           if (subscription === "smollVet") {
//             props.navigation.navigate("WelcomeScreen");
//           } else {
//             props.navigation.navigate("HomeScreen");
//           }
//         } else {
//           await verifyOtp({ email: props.email, otp: otpToSend });
//         }
//       } else {
//         await verifyOtp({ phone: props.phone, email: "", otp: otpToSend });
//       }

//       const user = await findUser();
//       if (!user.timeZone) {
//         await updateUser({ timeZone: getUserTimezoneOffset() });
//       }

//       props.onSuccess();
//     } catch (err) {
//       const msg = getAxiosErrMsg(err as AxiosError);
//       toastRef.current?.show(msg, { type: "danger" });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle each OTP input change
//   const handleOtpChange = (text: string, index: number) => {
//     if (/^\d*$/.test(text)) {
//       const newOtp = [...otp];
//       if (text.length === 1) {
//         newOtp[index] = text;
//         setOtp(newOtp);
//         if (index < 3) {
//           inputsRef.current[index + 1].focus();
//         }
//       } else if (text.length > 1) {
//         // Handle paste
//         const digits = text.split("").slice(0, 4);
//         digits.forEach((d, i) => (newOtp[i] = d));
//         setOtp(newOtp);
//         inputsRef.current[digits.length - 1].focus();
//         if (digits.length === 4) {
//           handleConfirm(digits.join(""));
//         }
//       } else {
//         // empty input (backspace)
//         newOtp[index] = "";
//         setOtp(newOtp);
//       }

//       if (newOtp.join("").length === 4) {
//         handleConfirm(newOtp.join(""));
//       }
//     }
//   };

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (resendOtpWating > 0) {
//       timer = setInterval(() => {
//         setResendOtpWating((prev) => prev - 1);
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [resendOtpWating]);

//   const handleResend = async () => {
//     try {
//       setResendOtpLoading(true);
//       await login(props?.email ? { email: props.email } : { phone: props.phone });
//       setResendOtpWating(30);
//       toastRef.current?.show("The code has been successfully sent to your number.", { type: "dark" });
//     } finally {
//       setResendOtpLoading(false);
//     }
//   };

//   const back = () => {
//     props.onBack();
//     setOtp(["", "", "", ""]);
//   };

//   return (
//     <>
//       <BottomSheet isVisible={props.isVisible} h="95%" showCloseIcon={false} barMb={28}>
//         <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//           <Div h="100%">
//             <BackButton onPress={back} mb={20} />
//             <Div mb={20}>
//               <Image
//                 w={142}
//                 h={85}
//                 source={require("../../../assets/images/verification_paper.png")}
//                 style={{ objectFit: "contain" }}
//               />
//             </Div>
//             <Text fontSize={"5xl"} fontFamily={fontHauora} mb={4}>
//               Enter your verification code
//             </Text>

//             <Text fontSize={"xl"} mb={24} color="#494949">
//               We have sent you a 4 digit code to the {props.email ? "email" : "phone number"}{" "}
//               <Text fontSize={"xl"} color="#222222">
//                 {props.label}
//               </Text>
//             </Text>

//             {/* OTP Input Fields */}
//             <Div flexDir="row" justifyContent="flex-start"   mb={8} gap={12}>
//               {otp.map((digit, i) => (
//                 <TextInput
//                   key={i}
//                   ref={(ref) => (inputsRef.current[i] = ref!)}
//                   value={digit}
//                   onChangeText={(text) => { if (i === 0 || otp[i - 1] !== "") handleOtpChange(text, i)}}
//                   maxLength={1}
//                   keyboardType="number-pad"
//                   style={{
//                     borderWidth: 1,
//                     borderColor: "#ccc",
//                     width: 50,
//                     height: 50,
//                     textAlign: "center",
//                     fontSize: 24,
//                     borderRadius: 8,
//                     // marginRight: 12,
//                     //  backgroundColor: i === 0 || otp[i - 1] ? "#fff" : "#eee", // enable only if previous is filled
//                   }}
//                   autoFocus={i === 0}
//                 //  editable={i === 0 || otp[i - 1] !== ""} // disable if previous is empty
//                   secureTextEntry
//                 />
//               ))}
//             </Div>

//             {resendOtpWating === 0 ? (
//               <Button
//                 bg="transparent"
//                 px={0}
//                 py={0}
//                 mb={32}
//                 disabled={isLoading || resendOtpLoading}
//                 fontSize={"md"}
//                 fontFamily={fontHauora}
//                 onPress={handleResend}
//                 position="relative"
//               >
//                 <Text color={resendOtpLoading ? "#ddd" : "#0189F9"}>Resend Code</Text>
//                 {resendOtpLoading && (
//                   <Div position="absolute" top={4}>
//                     <ActivityIndicator size={16} color={colorPrimary} />
//                   </Div>
//                 )}
//               </Button>
//             ) : (
//               <Text mb={32} color="#666">
//                 Resend Code in {resendOtpWating} seconds
//               </Text>
//             )}

//             <ButtonPrimary onPress={() => handleConfirm()} loading={isLoading} disabled={isLoading || otpValue.length < 4}>
//               Confirm
//             </ButtonPrimary>

//             <Div mt={24} style={{ flexDirection: "row", justifyContent: "center" }}>
//               <Text fontSize={16} color="#6B6B6B" fontFamily={fontHauora}>
//                 Can't find the code?{" "}
//               </Text>
//               <Button
//                 bg="transparent"
//                 color="#222222"
//                 px={0}
//                 py={0}
//                 fontSize={16}
//                 fontFamily={fontHauora}
//                 onPress={() => Linking.openURL("https://smoll.me/help")}
//               >
//                 Get help
//               </Button>
//             </Div>
//           </Div>
//         </TouchableWithoutFeedback>

//         <OnboardingUserModal isVisible={showNameModal} onSuccess={props.onSuccess} />
//         <Toast ref={toastRef} placement="top" textStyle={{ textTransform: "capitalize" }} />
//       </BottomSheet>
//     </>
//   );
// };

// export default OnboardingOtpModal; 

//-----------------------------------CUSTOME----------------------------


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
  phone: string;
  label: string;
  onBack: () => void;
  onSuccess: (isNewUser?: boolean) => void;
  email:string
  code?:string
  
}

const OnboardingOtpModal: React.FC<Props> = (props) => {

  const { verifyOtp, login } = useAuthStore();
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
      if(props?.email){
     
      
     if(props?.code){
    
  
  await verifyOtp( { email: props.email, otp: _otp ?? otp,orgCode:props?.code });

       const subscription = await AsyncStorage.getItem("subscription");
  
          if (subscription === "smollVet") {
            props.navigation.navigate("WelcomeScreen");
          } else {
            props.navigation.navigate("HomeScreen");
          }
    
   
    
     }else{
   
     
        await verifyOtp( { email: props.email, otp: _otp ?? otp });
     }
         

           
           
      }else{
       
        await verifyOtp( { phone: props.phone,otp: _otp ?? otp });
        
      }

      const user = await findUser();
      

      if (!user.timeZone) {
        await updateUser({ timeZone: getUserTimezoneOffset() });
      }
// console.log("come here or not ")
//       if (!user?.name) {
//   console.log("come in the name ")
//         setShowNameModal(true);
//       } else {
  
        props.onSuccess();
      // }
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
    console.log("11111111111111111111111111111")
    try {
      setResendOtpLoading(true);

      await login(
        props?.email?
        { email: props.email }: { phone: props.phone }
      
      );

      setResendOtpWating(30);
               console.log("abho email or number-------------->",props?.email,props?.phone)
              
      toastRef.current?.show(`The code has been successfully sent to your ${props?.email?"email":"Number"}.`, {
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

export default OnboardingOtpModal;








// -----------------------------------------------------------------




// import BackButton from "@/components/partials/BackButton";
// import BottomSheet from "@/components/partials/BottomSheet";
// import ButtonPrimary from "@/components/partials/ButtonPrimary";
// import { colorPrimary, fontHauora } from "@/constant/constant";
// import { useAuthStore } from "@/store/modules/auth";
// import { useUserStore } from "@/store/modules/user";
// import { NavigationType } from "@/store/types";
// import { getAxiosErrMsg, getUserTimezoneOffset } from "@/utils/helpers";
// import { AxiosError } from "axios";

// import InputField from "@/components/partials/InputField";
// import React, { useRef, useState, useEffect } from "react";
// import { Button, Div, Text } from "react-native-magnus";
// import Toast from "react-native-toast-notifications";
// import ToastContainer from "react-native-toast-notifications/lib/typescript/toast-container";
// import OnboardingUserModal from "./OnboardingUserModal";
// import { ActivityIndicator, Keyboard, Linking, TouchableWithoutFeedback } from "react-native";

// interface Props {
//   navigation: NavigationType;
//   isVisible: boolean;
//   phone: string;
//   label: string;
//   onBack: () => void;
//   onSuccess: (isNewUser?: boolean) => void;
// }

// const OnboardingOtpModal: React.FC<Props> = (props) => {
//   const { verifyOtp, login } = useAuthStore();
//   const { findUser, updateUser } = useUserStore();

//   const toastRef = useRef<ToastContainer>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [showNameModal, setShowNameModal] = useState(false);

//   const [resendOtpLoading, setResendOtpLoading] = useState(false);
//   const [resendOtpWating, setResendOtpWating] = useState(0);
//   const [otp, setOtp] = useState("");

//   const handleConfirm = async (_otp?: string) => {
//     try {
//       Keyboard.dismiss();

//       setIsLoading(true);

//       await verifyOtp({ phone: props.phone, otp: _otp ?? otp });
//       const user = await findUser();

//       if (!user.timeZone) {
//         await updateUser({ timeZone: getUserTimezoneOffset() });
//       }

//       if (!user?.name) {
//         setShowNameModal(true);
//       } else {
//         props.onSuccess();
//       }
//     } catch (err) {
//       const msg = getAxiosErrMsg(err as AxiosError);

//       toastRef.current?.show(msg, {
//         type: "danger",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOtpChange = (e: string) => {
//     setOtp(e);

//     if (e.length === 4) {
//       handleConfirm(e);
//     }
//   };

//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (resendOtpWating > 0) {
//       timer = setInterval(() => {
//         setResendOtpWating((prev) => prev - 1);
//       }, 1000);
//     }

//     return () => clearInterval(timer);
//   }, [resendOtpWating]);

//   const handleResend = async () => {
//     try {
//       setResendOtpLoading(true);
//       await login({ phone: props.phone });

//       setResendOtpWating(30);

//       toastRef.current?.show("The code has been successfully sent to your number.", {
//         type: "dark",
//       });
//     } finally {
//       setResendOtpLoading(false);
//     }
//   };

//   return (
//     <>
//       <BottomSheet isVisible={props.isVisible} h="95%" showCloseIcon={false} barMb={28}>
//         <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
//           <Div h="100%">
//             <BackButton onPress={props.onBack} mb={20} />
//             <Text fontSize={"5xl"} fontFamily={fontHauora} mb={4}>
//               Enter your verification code
//             </Text>

//             <Text fontSize={"xl"} mb={24} color="#494949">
//               We have sent you a 4 digit code to the phone number{" "}
//               <Text fontSize={"xl"} color="#222222">
//                 {props.label}
//               </Text>
//             </Text>

//             <InputField
//               placeholder="Verification Code"
//               value={otp}
//               mb={8}
//               onChangeText={handleOtpChange}
//               maxLength={4}
//               inputMode="numeric"
//               keyboardType="number-pad"
//               autoFocus={true}
//             />

//             {resendOtpWating === 0 && (
//               <Button
//                 bg="transparent"
//                 px={0}
//                 py={0}
//                 mb={32}
//                 disabled={isLoading || resendOtpLoading}
//                 fontSize={"md"}
//                 fontFamily={fontHauora}
//                 onPress={handleResend}
//                 position="relative"
//               >
//                 <Text color={resendOtpLoading ? "#ddd" : "#0189F9"}>Resend Code</Text>
//                 {resendOtpLoading && (
//                   <Div position="absolute" top={4}>
//                     <ActivityIndicator size={16} color={colorPrimary} />
//                   </Div>
//                 )}
//               </Button>
//             )}

//             {resendOtpWating > 0 && (
//               <Text mb={32} color="#666">
//                 Resend Code in {resendOtpWating} seconds
//               </Text>
//             )}

//             <ButtonPrimary
//               // bgColor="primary"
//               onPress={() => handleConfirm()}
//               loading={isLoading}
//               disabled={isLoading || otp.length < 4}
//             >
//               Confirm
//             </ButtonPrimary>

//             <Div mt={24} style={{ flexDirection: "row", justifyContent: "center" }}>
//               <Text fontSize={16} color="#6B6B6B" fontFamily={fontHauora}>
//                 Can't find the code?{" "}
//               </Text>
//               <Button
//                 bg="transparent"
//                 color="#222222"
//                 px={0}
//                 py={0}
//                 fontSize={16}
//                 fontFamily={fontHauora}
//                 onPress={() => Linking.openURL("https://smoll.me/help")}
//               >
//                 Get help
//               </Button>
//             </Div>
//           </Div>
//         </TouchableWithoutFeedback>

//         <OnboardingUserModal isVisible={showNameModal} onSuccess={props.onSuccess} />

//         <Toast ref={toastRef} placement="top" textStyle={{ textTransform: "capitalize" }} />
//       </BottomSheet>
//     </>
//   );
// };

// export default OnboardingOtpModal;

