import Layout from "@/components/app/Layout";
import IconSmollcareMember from "@/components/icons/IconSmollcareMember";
import BackButton from "@/components/partials/BackButton";
import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import FlashCustomContent from "@/components/partials/FlashCustomContent";
import ImageUpload from "@/components/partials/ImageUpload";
import { fontHauoraBold, fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { PetDetail } from "@/store/types/pet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { initPaymentSheet, presentPaymentSheet, StripeProvider } from "@stripe/stripe-react-native";
import { SetupParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { showMessage } from "react-native-flash-message";
import {
  Div,
  Image,
  Input,
  ScrollDiv,
  Text,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
} from "react-native-magnus";
import ToastContainer from "react-native-toast-notifications";
import Toast from "react-native-toast-notifications";

type RouteType = { pet: PetDetail; planPrice: String };

export default function PetProfileSmollcarePaymentScreen({
  navigation,
}: {
  navigation: NavigationType;
}) {
  const { user } = useUserStore();
  const { fetchPetDetails } = usePetStore();
  const [couponCode, setCouponCode] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponModalInput, setCouponModalInput] = useState("");
  const [couponModalError, setCouponModalError] = useState("");
  const [couponModalLoading, setCouponModalLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const toastRef = useRef<ToastContainer>(null);
  const route = useRoute();
  const petDetailsData = (route.params as RouteType)?.pet;
  const planPrice = (route.params as RouteType)?.planPrice;
  const [envs, setEnvs] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [profileImg, setProfileImg] = useState("");

  const { buySubscription, validateCoupon: validateCouponAPI } = usePetStore();
  const [btnLoader, setBtnLoader] = useState(false);
  const isMounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, [])
  );

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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const initStripe = async (): Promise<
    | boolean
    | {
        redirect: true;
      }
  > => {
    setLoading(true);

    setEnvs(JSON.parse((await AsyncStorage.getItem("envs")) as string));

    await new Promise((resolve) => setTimeout(resolve, 500));
 console.log("come in the call buysubscription--->")
    try {
      const { ephemeralKey, paymentIntentClientSecret } = await buySubscription(
        petDetailsData.id as string,
        couponCode || undefined
      );

      // If coupon was already validated in modal and gives 100% off, skip payment
      if (discountPercentage === 100) {
        return {
          redirect: true,
        };
      }

      // Only continue if still mounted
      if (!isMounted.current) {
        return false;
      }

      const { error } = await initPaymentSheet({
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntentClientSecret,
        merchantDisplayName: "Smoll",
        customerId: user!.stripeCustomerId,
        applePay: {
          merchantCountryCode: "AE",
        },
        defaultBillingDetails: {
          name: user?.name,
        },
        appearance: {
          shapes: {
            borderRadius: 12,
            borderWidth: 0.5,
          },
          primaryButton: {
            colors: {
              background: "#000000",
              text: "#ffffff",
            },
            shapes: {
              borderRadius: 20,
            },
          },
          colors: {
            primary: "#000000",
            background: "#ffffff",
            componentBackground: "#f3f8fa",
            componentBorder: "#f3f8fa",
            componentDivider: "#000000",
            primaryText: "#000000",
            secondaryText: "#000000",
            componentText: "#000000",
            placeholderText: "#73757b",
          },
        },
      } as SetupParams);

      if (error) {
        showMessage({
          message: `Stripe error: ${error.message}`,
          type: "danger",
        });

        throw error;
      }

      return true;
    } catch (error: any) {
      throw error;
    }
  };

  const calculateDiscountedPrice = () => {
    if (!discountPercentage) return planPrice;
    const originalPrice = Number(planPrice);
    const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;
    return discountedPrice.toFixed(2);
  };

  const validateCoupon = async (code: string) => {
    try {
      setCouponModalLoading(true);
      setCouponModalError("");

      const data = await validateCouponAPI(code);

      if (data.valid) {
        // Apply the coupon
        setCouponCode(code);
        setDiscountPercentage(data.discountPercentage || null);
        setShowCouponModal(false);
        setCouponModalInput("");

        showMessage({
          message: "Discount Applied! 🎉",
          description: `${data.discountPercentage}% off your subscription`,
          type: "success",
          duration: 3000,
          icon: "success",
        });
      } else {
        toastRef.current?.show(data.reason || "Invalid coupon code", {
          type: "danger",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.reason) {
        toastRef.current?.show(error.response.data.reason || "Invalid coupon code", {
          type: "danger",
        });
      } else {
        toastRef.current?.show("Failed to validate coupon. Please try again.", {
          type: "danger",
        });
      }
    } finally {
      setCouponModalLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    try {
      setBtnLoader(true);

      const showPaymentSheet = await initStripe();

      if (typeof showPaymentSheet === "object" && showPaymentSheet.redirect) {
        navigation.navigate("paymentSuccess", {
          petId: petDetailsData.id as string,
          petName: petDetailsData?.name,
        });

        return;
      }

      if (showPaymentSheet) {
        const { error } = await presentPaymentSheet();

        if (error) {
          setBtnLoader(false);
          showMessage({
            message: "Could not process payment, please try again",
            type: "danger",
          });

          return;
        }

        //On Success
        await fetchPetDetails(petDetailsData.id as string);

        await new Promise((resolve: any) => {
          setTimeout(() => {
            resolve();
          }, 2000);
        });

        navigation.navigate("paymentSuccess", {
          petId: petDetailsData.id as string,
          petName: petDetailsData?.name,
        });
      }
    } finally {
      setBtnLoader(false);
      setLoading(false);
    }
  };

  const bottomSheetHeight = useMemo(() => {
    let baseHeight = 55;

    // Adjust base height based on screen size
    if (WINDOW_HEIGHT < 700) {
      // Smaller phones (iPhone SE, etc.)
      baseHeight = 65;
    } else if (WINDOW_HEIGHT > 800) {
      // Larger phones (iPhone Pro Max, etc.)
      baseHeight = 45;
    }

    if (isKeyboardVisible) return `${baseHeight + 44}%`;

    return `${baseHeight}%`;
  }, [isKeyboardVisible, couponModalError]);

  return (
    <StripeProvider
      publishableKey={envs?.STRIPE_PUBLISHABLE_KEY ?? ""}
      merchantIdentifier="merchant.me.smoll.smollapp" // required for Apple Pay
    >
      <Layout disableHeader style={{ flex: 1 }}>
        <ScrollDiv showsVerticalScrollIndicator={false}>
          <Div alignItems="flex-end">
            <BackButton
              onPress={() => {
                navigation.goBack();
              }}
              showCloseIcon={true}
            />
            <Div mt={42} px={18} w={"100%"}>
              <Div justifyContent="space-between" h={220} rounded={14} bg="#6e99f0" py={20} px={30}>
                <Div flexDir="row" alignItems="center">
                  <ImageUpload
                    h={66}
                    w={66}
                    docType="image/"
                    rounded={100}
                    uri={profileImg}
                    hideUnselectBtn
                    openImageOnTab
                    disableDownload
                  />
                  <Text
                    ml={14}
                    mb={6}
                    color="#fff"
                    fontSize={"4xl"}
                    fontFamily={fontHauoraBold}
                    numberOfLines={2}
                    w={170}
                  >
                    {petDetailsData?.name}
                  </Text>
                </Div>
                <IconSmollcareMember />
              </Div>
              <Div mt={32} px={30}>
                <Div borderBottomWidth={1} borderColor="#dbdad7" pb={18}>
                  <Text fontSize="xl" fontFamily={fontHauoraMedium}>
                    {petDetailsData.name}'s Annual Wellness Plan
                  </Text>
                  <Div
                    flexDir="row"
                    alignItems="flex-start"
                    style={{
                      gap: 24,
                    }}
                    mt={16}
                  >
                    <Div>
                      <Text fontSize={"4xl"} fontFamily={fontHauoraBold}>
                        12
                      </Text>
                      <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                        Months
                      </Text>
                    </Div>

                    <Text fontSize={"4xl"} fontFamily={fontHauoraBold}>
                      x
                    </Text>

                    <Div>
                      <Div flexDir="row" alignItems="flex-end">
                        <Text fontSize={"4xl"} fontFamily={fontHauoraBold}>
                          AED {(+planPrice / 12).toFixed(2)}
                        </Text>
                      </Div>

                      <Text fontSize={"md"} fontFamily={fontHauoraMedium}>
                        Per month (Vat Included)
                      </Text>
                    </Div>
                  </Div>
                </Div>
                <Div mt={12}>
                  <Text fontSize={"xl"} fontFamily={fontHauoraMedium}>
                    Due today
                  </Text>
                  {discountPercentage ? (
                    <Div>
                      <Div flexDir="row" alignItems="baseline" style={{ gap: 12 }}>
                        <Text
                          fontFamily={fontHauoraMedium}
                          color="#6e99f0"
                          fontSize={"3xl"}
                          style={{ textDecorationLine: "line-through", opacity: 0.5 }}
                        >
                          AED {planPrice}
                        </Text>
                        <Text fontFamily={fontHauoraSemiBold} color="#4CAF50" fontSize={"lg"}>
                          {discountPercentage}% OFF
                        </Text>
                      </Div>
                      <Text fontFamily={fontHauoraMedium} color="#6e99f0" fontSize={"6xl"} mt={4}>
                        AED {calculateDiscountedPrice()}
                      </Text>
                    </Div>
                  ) : (
                    <Text fontFamily={fontHauoraMedium} color="#6e99f0" fontSize={"6xl"}>
                      AED {planPrice}
                    </Text>
                  )}
                </Div>
              </Div>
              <Div mt={30} alignItems="center">
                <ButtonPrimary
                  onPress={openPaymentSheet}
                  disabled={btnLoader || loading}
                  loading={btnLoader || loading}
                  bg="#2b44ff"
                  fontFamily={fontHauoraSemiBold}
                >
                  Enroll in smoll® Care now!
                </ButtonPrimary>
                <Text
                  color="#494949"
                  textAlign="center"
                  mt={10}
                  fontSize={"md"}
                  fontFamily={fontHauoraMedium}
                >
                  Cancel anytime
                </Text>
                <Div flexDir="row">
                  <Text fontSize={"sm"}>Have a coupon code?</Text>
                  <TouchableOpacity onPress={() => setShowCouponModal(true)}>
                    <Text fontSize={"sm"}> Apply now</Text>
                  </TouchableOpacity>
                </Div>
              </Div>
            </Div>
          </Div>

          <Div my={24} alignItems="center">
            <Div flexDir="row" alignItems="flex-end" mt={4} justifyContent="center">
              <Text
                fontSize={"sm"}
                textAlign="center"
                color="#B2B2B2"
                fontFamily={fontHauoraSemiBold}
              >
                Payment securely processed by
              </Text>
              <Image ml={4} source={require("@/assets/icons/stripe-logo.png")} w={38} h={16} />
            </Div>

            <Image
              source={require("@/assets/images/payment-service.png")}
              h={80}
              w={"72%"}
              style={{ objectFit: "contain" }}
            />
            <Text
              mt={-8}
              fontSize={"md"}
              textAlign="center"
              color="#5A5A5A"
              fontFamily={fontHauoraMedium}
              maxW={340}
            >
              By starting your membership, you agree to smoll Terms of Service and Privacy Policy.
            </Text>
          </Div>
        </ScrollDiv>

        {/* Coupon Modal */}
        <BottomSheet
          isVisible={showCouponModal}
          onCloseIconClick={() => {
            setShowCouponModal(false);
            setCouponModalInput("");
            setCouponModalError("");
          }}
          onDismiss={() => {
            setShowCouponModal(false);
            setCouponModalInput("");
            setCouponModalError("");
          }}
          title="Apply Coupon Code"
          showCloseIcon
          height={bottomSheetHeight}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollDiv
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              <Toast ref={toastRef} placement="top" textStyle={{ textTransform: "capitalize" }} />

              <Div style={{ gap: 8 }}>
                {/* Header Section */}
                <Div alignItems="center" mt={14} mb={20}>
                  <Text
                    fontSize={"lg"}
                    fontFamily={fontHauoraMedium}
                    textAlign="center"
                    color="#666666"
                    lineHeight={22}
                  >
                    Enter your coupon code below to get{"\n"}an instant discount on your
                    subscription
                  </Text>
                </Div>

                {/* Input Section */}
                <Div>
                  <Text fontSize={"md"} fontFamily={fontHauoraSemiBold} color="#333333" mb={8}>
                    Coupon Code
                  </Text>
                  <Input
                    placeholder="Enter your coupon code"
                    value={couponModalInput}
                    rounded={8}
                    onChangeText={(text) => {
                      setCouponModalInput(text);
                      setCouponModalError("");
                    }}
                    borderColor={couponModalError ? "#ff0000" : "#e0e0e0"}
                    autoCapitalize="characters"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    autoFocus={false}
                  />
                </Div>

                {/* Button Section */}
                <Div mt={10}>
                  <ButtonPrimary
                    onPress={() => validateCoupon(couponModalInput)}
                    disabled={!couponModalInput.trim() || couponModalLoading}
                    loading={couponModalLoading}
                    bg={!couponModalInput.trim() || couponModalLoading ? "#CCCCCC" : "#2b44ff"}
                  >
                    Apply Coupon
                  </ButtonPrimary>
                </Div>
              </Div>
            </ScrollDiv>
          </TouchableWithoutFeedback>
        </BottomSheet>
      </Layout>
    </StripeProvider>
  );
}
