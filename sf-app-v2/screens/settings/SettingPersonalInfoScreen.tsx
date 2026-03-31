import React, { useEffect, useState } from "react";
import { Div, ScrollDiv, Text } from "react-native-magnus";
import {
  fontHauora,
  fontHauoraMedium,
  fontHauoraSemiBold,
  colorErrorText,
} from "@/constant/constant";
import SettingBackButton from "@/components/settings/SettingBackButton";
import { IconUser, IconEditCircle } from "@tabler/icons-react-native";
import Container from "@/components/partials/Container";
import Layout from "@/components/app/Layout";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import ProfileOptionButton from "./ProfileOptionButton";
import ImageUpload from "@/components/partials/ImageUpload";
import { UploadedFile } from "@/store/types/file";
import { useToast } from "react-native-toast-notifications";
import ConfirmationModal from "@/components/partials/ConfirmationModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logout } from "@/utils/chat.v2";
import { useAuthStore } from "@/store/modules/auth";

const SettingPersonalInfoScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const toast = useToast();
  const { user, updateUser } = useUserStore();
  const { deactivateAccount } = useAuthStore();
  // const [ImageLoading, setImageLoading] = useState(false);
  const [showDeactivateAccountModal, setShowDeactivateAccountModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateImage = async (file: UploadedFile[]) => {
    if (!user) return;

    try {
      // setImageLoading(true);

      await updateUser({ profileImg: file[0] });
      // await updatePet(id, { photos: filesArr });

      toast.show("Profile Image updated successfully");
    } finally {
      // setImageLoading(false);
    }
  };


  const handleDeactivateAccount = async () => {
    try {
      setIsLoading(true);
      await deactivateAccount();

      await AsyncStorage.setItem("accessToken", "");
      AsyncStorage.removeItem("hideAccountSetupBtn");
      navigation.navigate("NewOnboardingScreen");

      logout();
    } finally {
      setIsLoading(false);
      setShowDeactivateAccountModal(false);
    }
  };
console.log("this is user info --------->",user)
  return (
    <Layout
      showBack
      title="Personal Info"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <ScrollDiv style={styles.container} showsVerticalScrollIndicator={false}>
        <Div flex={1}>
          <Div alignItems="flex-start" mb={24}>
            <Div position="relative">
              <ImageUpload
                plusIcon={false}
                h={98}
                w={98}
                rounded={100}
                hideUnselectBtn
                bg="#EFEFEF"
                userIcon
                uri={user?.profileImg?.url}
                onChange={handleUpdateImage}
                disableDownload
                mediaType="Images"
              />
              <Div
                w={32}
                h={32}
                rounded={100}
                bg="#BFBFBF"
                position="absolute"
                right={-8}
                bottom={10}
                alignItems="center"
                justifyContent="center"
                pointerEvents="none"
              >
                <IconEditCircle size={24} color="#222222" />
              </Div>
            </Div>
          </Div>

          <Text mb={4} fontSize={"xl"} fontFamily={fontHauoraSemiBold}>
            Basic Details
          </Text>
          <Div mb={32}>
            <ProfileOptionButton
              title="Name"
              value={user?.name}
              editable
              onEdit={() => {
                navigation.navigate("EditInfoScreen", {
                  heading: "What should we call you?",
                  placeholder: "Name",
                  fieldKey: "name",
                  value: `${user?.name || ""}`,
                });
              }}
            />
            <ProfileOptionButton
              title="Email address"
              value={user?.email}
              // varified={user?.isEmailVerified}
              varified={user?.email?true:false}
              editable
              onEdit={() => {
                navigation.navigate("AccountSetupEmailScreen", {
                  updateEmail: "true",
                });
              }}
            />
            
            <ProfileOptionButton title="Phone number" value={user?.phone} varified={user?.phone?true:false} />
          </Div>

          <Div mb={4} flexDir="row" justifyContent="space-between" alignItems="center">
            <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold}>
              Address
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("AccountSetupAddressScreen", {
                  updating: "true",
                });
              }}
            >
              <Text fontSize={"lg"} lineHeight={24} color="primary">
                Edit
              </Text>
            </TouchableOpacity>
          </Div>

          <Div>
            <ProfileOptionButton title="Flat/Villa No" value={user?.villa ?? "-"} />
            <ProfileOptionButton title="Street address" value={user?.address ?? "-"} />
            <ProfileOptionButton title="City" value={user?.city ?? "-"} />
            <ProfileOptionButton title="Country" value={user?.country ?? "-"} />
            <ProfileOptionButton title="Postal code" value={user?.postalCode ?? "-"} />
          </Div>
          <TouchableOpacity
            onPress={() => setShowDeactivateAccountModal(true)}
            style={{ marginTop: 20 }}
          >
            <Text
              fontSize={"xl"}
              fontFamily={fontHauoraMedium}
              lineHeight={24}
              color={colorErrorText}
            >
              Deactivate Account
            </Text>
            <Div py={12}></Div>
            <Div py={12}></Div>
            <Div py={12}></Div>
          </TouchableOpacity>
        </Div>
      </ScrollDiv>
      <ConfirmationModal
        heading="Deactivate Account?"
        text="Deactivating your account will restrict access to your profile, messages, and other data."
        isLoading={isLoading}
        showModal={showDeactivateAccountModal}
        onClose={() => setShowDeactivateAccountModal(false)}
        onConfirm={handleDeactivateAccount}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmBgColor={colorErrorText}
        cancelBgColor="#222"
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});

export default SettingPersonalInfoScreen;
