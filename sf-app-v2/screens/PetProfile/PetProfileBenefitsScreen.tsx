import Layout from "@/components/app/Layout";
import ImageUpload from "@/components/partials/ImageUpload";
import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { Div, Image, Text } from "react-native-magnus";
import { useRoute } from "@react-navigation/native";
import { usePetStore } from "@/store/modules/pet";
import PlanCTA from "../Subscription/PlanCTA";
import BackButton from "@/components/partials/BackButton";
import BenefitsList from "@/components/app/subscription/BenefitsList";
import { Benefit } from "@/store/types/pet";
import { useToast } from "react-native-toast-notifications";
import { useUserStore } from "@/store/modules/user";
import EmailVerificationPopup from "@/components/app/EmailVerificationPopup";
import OtpVerificationPopup from "@/components/app/OtpVerificationPopup";

type RouteType = { petId: string };

const PetProfileBenefitsScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const toast = useToast();
  const route = useRoute();
  const id = (route.params as RouteType)?.petId;
  const { petsDetailMap, fetchPetDetails } = usePetStore();
  const [profileImg, setProfileImg] = useState("");
  const [loading, setLoading] = useState(true);
  const petDetailsData = petsDetailMap.get(id);
  const { fetchBenefits } = usePetStore();
  const { user } = useUserStore();
  const [plan, setPlan] = useState<{ benefits: Benefit[]; price: string } | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedPlan = await fetchBenefits(id);
        setPlan(fetchedPlan);
      } catch (err) {
        navigation.goBack();
        toast.show("Plan not found", { type: "danger" });
      } finally {
        setLoading(false);
      }

      const data = petsDetailMap.get(id);
      try {
        setLoading(true);

        if (!data) {
          await fetchPetDetails(id);
          //IF PET IS SMOLLCARE MEMBER
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, petsDetailMap, id && petsDetailMap.get(id)]);

  useEffect(() => {
    if (!petDetailsData) return;

    for (let i = 0; i < petDetailsData.photos.length; i++) {
      const image = petDetailsData.photos[i];
      if (image && image.url) {
        setProfileImg(image.url);
        break;
      }
    }
  }, [petDetailsData]);

  const renderHeader = () => (
    <>
      <Div flexDir="row" alignItems="center" mt={12}>
        <BackButton
          onPress={() => {
            navigation.goBack();
          }}
          showCloseIcon={false}
        />
        <Div flexDir="row" alignItems="center" ml={12}>
          <Div alignItems="center">
            <Div mx={"auto"}>
              <ImageUpload
                h={54}
                w={54}
                docType="image/"
                rounded={100}
                uri={profileImg}
                hideUnselectBtn
                openImageOnTab
                disableDownload
              />
            </Div>
          </Div>
          <Div ml={24}>
            <Text
              lineHeight={24}
              fontSize={"4xl"}
              fontFamily={fontHauoraSemiBold}
              ellipsizeMode="tail"
              numberOfLines={1}
              maxW={200}
            >
              {petDetailsData?.name}
            </Text>
          </Div>
        </Div>
      </Div>

      <Div flexDir="row" alignSelf="center" mt={38} mb={38}>
        <Div flexDir="row" alignItems="center">
          <Image source={require("@/assets/images/congratulation-tick.png")} w={46} h={46} />
          <Div h={42} ml={12}>
            <Image source={require("@/assets/icons/smollcare-logo.png")} w={122} h={22} />
            <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} numberOfLines={2} maxW={300}>
              {petDetailsData?.name} will receive the below
            </Text>
          </Div>
        </Div>
      </Div>
    </>
  );

  const renderFooter = () => {
    const handleButtonPress = () => {
      if (!user?.isEmailVerified) {
        setShowEmailVerification(true);
      } else {
        navigation.navigate("PetProfileSmollcarePaymentScreen", {
          pet: petDetailsData,
          planPrice: plan?.price,
        });
      }
    };

    return <PlanCTA petName={petDetailsData?.name} onButtonPress={handleButtonPress} />;
  };

  const handleEmailSent = async (email: string) => {
    setShowEmailVerification(false);
    setUserEmail(email);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setShowOtpVerification(true);
  };

  const handleOtpVerificationSuccess = () => {
    setShowOtpVerification(false);
    // Navigate to payment screen after OTP verification
    navigation.navigate("PetProfileSmollcarePaymentScreen", {
      pet: petDetailsData,
      planPrice: plan?.price,
    });
  };

  return (
    <Layout disableHeader style={{ flex: 1 }}>
      {!loading && plan && (
        <FlatList
          data={[{ key: "benefits" }]}
          renderItem={() => <BenefitsList planFeatures={plan?.benefits as Benefit[]} />}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
      {loading && (
        <Div flex={1} justifyContent="center">
          <ActivityIndicator size="large" color={colorPrimary} />
        </Div>
      )}

      <EmailVerificationPopup
        isVisible={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        onEmailSent={handleEmailSent}
      />

      <OtpVerificationPopup
        isVisible={showOtpVerification}
        onClose={() => setShowOtpVerification(false)}
        onSuccess={handleOtpVerificationSuccess}
        userEmail={userEmail}
      />
    </Layout>
  );
};

export default PetProfileBenefitsScreen;
