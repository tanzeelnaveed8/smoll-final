import React, { useEffect, useState } from "react";
import { Div, Modal, Text } from "react-native-magnus";
import { fontHauora, fontHauoraSemiBold, colorPrimary } from "@/constant/constant";
import InputField from "@/components/partials/InputField";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { useUserStore } from "@/store/modules/user";
import { useToast } from "react-native-toast-notifications";
import { ActivityIndicator, Keyboard } from "react-native";
import { Button } from "react-native-magnus";

interface OtpVerificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail: string;
}

const OtpVerificationPopup: React.FC<OtpVerificationPopupProps> = ({
  isVisible,
  onClose,
  onSuccess,
  userEmail,
}) => {
  const { verifyEmail, sendVerificationEmail } = useUserStore();
  const toast = useToast();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendOtpWaiting, setResendOtpWaiting] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendOtpWaiting > 0) {
      timer = setInterval(() => {
        setResendOtpWaiting((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendOtpWaiting]);

  const handleResend = async () => {
    try {
      setResendOtpLoading(true);
      await sendVerificationEmail();

      setResendOtpWaiting(30);

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
      handleVerify(otp);
    }
  };

  const handleVerify = async (_otp?: string) => {
    try {
      setLoading(true);

      await verifyEmail(_otp ?? otp);

      toast.show("Email verified successfully!", { type: "success" });
      onSuccess();
    } catch (error) {
      toast.show("Invalid verification code. Please try again.", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      h="70%"
      roundedTop={24}
      bg="white"
      py={32}
      px={24}
      swipeDirection={["down"]}
      coverScreen={true}
      scrollTo={() => {}}
      scrollOffset={1}
      propagateSwipe={true}
      avoidKeyboard={true}
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <Div flex={1} justifyContent="space-between">
        <Div>
          <Text fontSize={"5xl"} fontFamily={fontHauoraSemiBold} mb={4} textAlign="center">
            Verify your email
          </Text>
          <Text color="#494949" mb={20} fontSize={"lg"} textAlign="center" fontFamily={fontHauora}>
            We have sent a 4 digit code to your email address {userEmail}
          </Text>

          <InputField
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="Verification Code"
            keyboardType="numeric"
            maxLength={4}
            disabled={loading}
            autoFocus={true}
          />

          {resendOtpWaiting === 0 && (
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

          {resendOtpWaiting > 0 && (
            <Text mt={8} color="#666" textAlign="center">
              Resend Code in {resendOtpWaiting} seconds
            </Text>
          )}
        </Div>

        <Div>
          <ButtonPrimary
            bgColor="primary"
            onPress={() => handleVerify()}
            loading={loading}
            disabled={otp.length < 4 || loading}
          >
            Confirm
          </ButtonPrimary>
        </Div>
      </Div>
    </Modal>
  );
};

export default OtpVerificationPopup;
