import React, { useMemo, useState } from "react";
import { Div, Modal, Text } from "react-native-magnus";
import { IconCircleCheck } from "@tabler/icons-react-native";
import { fontCooper, fontHauora, fontHeading } from "@/constant/constant";
import InputField from "@/components/partials/InputField";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { useUserStore } from "@/store/modules/user";
import { useToast } from "react-native-toast-notifications";

interface EmailVerificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onEmailSent: (email: string) => void;
}

const EmailVerificationPopup: React.FC<EmailVerificationPopupProps> = ({
  isVisible,
  onClose,
  onEmailSent,
}) => {
  const { updateUser, sendVerificationEmail } = useUserStore();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const forbiddenCharsRegex =
      /[\p{Emoji_Presentation}\p{Extended_Pictographic}~`!#$%^&*()+=[\]{}|\\:;"'<>,?/]/gu;

    return emailRegex.test(email) && !forbiddenCharsRegex.test(email);
  }, [email]);

  const handleSubmit = async () => {
    if (!isValidEmail) return;

    try {
      setLoading(true);

      await updateUser({ email });
      await sendVerificationEmail();

      toast.show("Verification email sent successfully!", { type: "success" });
      onEmailSent(email);
    } catch (error) {
      toast.show("Failed to send verification email. Please try again.", { type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      h="60%"
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
          <Text fontSize={"5xl"} fontFamily={fontHeading} mb={4} textAlign="center">
            Verify Your Email
          </Text>
          <Text color="#494949" mb={24} fontSize={"lg"} textAlign="center" fontFamily={fontHauora}>
            Please enter your email address to continue with the subscription process
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

        <Div>
          <ButtonPrimary
            bgColor="primary"
            onPress={handleSubmit}
            disabled={!isValidEmail || loading}
            loading={loading}
          >
            Send Verification Email
          </ButtonPrimary>
        </Div>
      </Div>
    </Modal>
  );
};

export default EmailVerificationPopup;
