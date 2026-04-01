import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
} from "@/constant/constant";
import { useCartStore } from "@/store/modules/cart";
import type { CartItem } from "@/store/types/cart";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { CommonActions } from "@react-navigation/native";
import {
  IconClock,
  IconCreditCard,
  IconMapPin,
  IconShieldCheck,
  IconTruck,
} from "@tabler/icons-react-native";
import { initPaymentSheet, presentPaymentSheet, StripeProvider } from "@stripe/stripe-react-native";
import { SetupParams } from "@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { showMessage } from "react-native-flash-message";
import { Div, Text } from "react-native-magnus";
import Config from "react-native-config";
import api from "@/utils/api";

function itemLineTotal(item: CartItem): number {
  const base = item.unitPrice * item.quantity;
  const addonsTotal =
    item.addons?.reduce((sum, a) => sum + a.price * item.quantity, 0) ?? 0;
  return base + addonsTotal;
}

const TRAVEL_FEE = 0;

interface Props {
  navigation: NavigationType;
}

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const setSchedule = useCartStore((s) => s.setSchedule);
  const schedule = useCartStore((s) => s.schedule);
  const { user, createPaymentIntent } = useUserStore();

  const [btnLoading, setBtnLoading] = useState(false);

  const subtotal = getTotal();
  const total = subtotal + TRAVEL_FEE;

  // Check if cart has services
  const hasServices = items.some(item => item.type === "service");

  useEffect(() => {
    if (items.length === 0) {
      navigation.goBack();
    }
  }, [items.length, navigation]);

  const handlePay = async () => {
    setBtnLoading(true);
    try {
      // Validate required fields
      if (!user?.address || !user?.city || !user?.country) {
        showMessage({
          message: "Please add your complete address in profile before booking.",
          type: "warning",
        });
        setBtnLoading(false);
        return;
      }

      // Only require schedule for services, not for products
      const hasServices = items.some(item => item.type === "service");
      if (hasServices && !schedule) {
        showMessage({
          message: "Please select appointment date and time.",
          type: "warning",
        });
        setBtnLoading(false);
        return;
      }

      let stripeCustomerId = user?.stripeCustomerId;

      // Auto-create Stripe customer if user doesn't have one yet
      if (!stripeCustomerId) {
        try {
          const res = await api.post("/member/stripe/create-customer");
          stripeCustomerId = res.data?.customerId;
          console.log("Created Stripe customer:", stripeCustomerId);
        } catch (createError: any) {
          console.error("Failed to create Stripe customer:", createError);
          showMessage({
            message: "Failed to setup payment. Please try again.",
            type: "danger",
          });
          setBtnLoading(false);
          return;
        }
      }

      if (!stripeCustomerId) {
        showMessage({
          message: "Payment setup failed: no Stripe customer ID. Please update your profile.",
          type: "danger",
        });
        setBtnLoading(false);
        return;
      }

      const amountInCents = Math.round(total * 100);
      console.log("Creating payment intent for amount:", amountInCents, "AED");

      const { ephemeralKey, paymentIntentClientSecret } =
        await createPaymentIntent(stripeCustomerId, amountInCents, "aed");

      if (!paymentIntentClientSecret || !ephemeralKey) {
        console.error("Missing payment credentials:", { ephemeralKey: !!ephemeralKey, clientSecret: !!paymentIntentClientSecret });
        showMessage({ message: "Failed to initialize payment. Please try again.", type: "danger" });
        setBtnLoading(false);
        return;
      }

      console.log("Initializing payment sheet...");
      const { error: initError } = await initPaymentSheet({
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntentClientSecret,
        merchantDisplayName: "Smoll",
        customerId: stripeCustomerId,
        applePay: {
          merchantCountryCode: "AE",
        },
        defaultBillingDetails: {
          name: user?.name ?? undefined,
        },
        appearance: {
          shapes: { borderRadius: 12, borderWidth: 0.5 },
          primaryButton: {
            colors: { background: "#000000", text: "#ffffff" },
            shapes: { borderRadius: 20 },
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

      if (initError) {
        console.error("Payment sheet init error:", initError);
        showMessage({ message: `Payment init error: ${initError.message}`, type: "danger" });
        setBtnLoading(false);
        return;
      }

      console.log("Presenting payment sheet...");
      const { error: payError } = await presentPaymentSheet();

      if (payError) {
        console.error("Payment sheet error:", payError);
        if (payError.code !== "Canceled") {
          showMessage({ message: "Could not process payment, please try again.", type: "danger" });
        }
        setBtnLoading(false);
        return;
      }

      console.log("Payment successful!");
      
      // Create order record for products/services
      try {
        const orderData = {
          items: items.map(item => ({
            id: item.id,
            type: item.type,
            title: item.title,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            packageId: item.packageId,
            packageLabel: item.packageLabel,
            addons: item.addons,
            imageUrl: item.imageUrl,
          })),
          total,
          paymentIntentId: paymentIntentClientSecret.split('_').pop(), // Extract payment intent ID
          schedule: hasServices ? schedule : null,
        };
        
        await api.post('/orders/members', orderData);
        console.log("Order created successfully");
      } catch (orderError: any) {
        console.error("Failed to create order:", orderError);
        // Don't fail the checkout if order creation fails - just log it
      }
      
      clearCart();
      setSchedule(null);
      showMessage({ message: "Payment successful! Your order is confirmed.", type: "success" });
      
      // Navigate to RecentOrdersScreen and clear intermediate screens from stack
      navigation.dispatch(
        CommonActions.reset({
          ...navigation.getState(),
          routes: [
            ...navigation.getState().routes.slice(0, -1), // Remove CheckoutScreen
            { name: "RecentOrdersScreen" },
          ],
        })
      );
    } catch (e: any) {
      console.error("Payment error:", e);
      const errorMessage = e?.response?.data?.message || e?.message || "Payment failed. Please try again.";
      showMessage({ message: errorMessage, type: "danger" });
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <StripeProvider
      publishableKey={Config.STRIPE_PUBLISHABLE_KEY ?? "pk_test_placeholder"}
      merchantIdentifier="merchant.me.smoll.smollapp"
    >
      <Layout disableHeader>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Div pt={8} pb={4}>
            <Div mb={6}>
              <BackButton onPress={() => navigation.goBack()} />
            </Div>
            <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color="#111827" mb={4}>
              Checkout
            </Text>
            <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#6B7280">
              Review your order details
            </Text>
          </Div>

          <Div bg="#FFFFFF" rounded={24} p={20} mb={16} shadow="sm" borderWidth={1} borderColor="#F3F4F6">
            <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827" mb={16}>
              Order Summary
            </Text>
            <Div style={{ gap: 12 }}>
              {items.map((item) => (
                <Div
                  key={`${item.type}-${item.id}-${item.packageId ?? ""}`}
                  flexDir="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#4B5563" flex={1} numberOfLines={1}>
                    {item.quantity}× {item.title}
                    {item.packageLabel ? ` (${item.packageLabel})` : ""}
                  </Text>
                  <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                    AED {itemLineTotal(item).toFixed(2)}
                  </Text>
                </Div>
              ))}
              {TRAVEL_FEE > 0 && (
                <Div flexDir="row" justifyContent="space-between" alignItems="center">
                  <Div flexDir="row" alignItems="center" style={{ gap: 6 }}>
                    <IconTruck size={16} color="#9CA3AF" />
                    <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#4B5563">
                      Travel fee
                    </Text>
                  </Div>
                  <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                    AED {TRAVEL_FEE.toFixed(2)}
                  </Text>
                </Div>
              )}
              <Div
                mt={8}
                pt={12}
                borderTopWidth={1}
                borderTopColor="#F3F4F6"
                flexDir="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#9CA3AF">
                  Subtotal
                </Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                  AED {subtotal.toFixed(2)}
                </Text>
              </Div>
              <Div flexDir="row" justifyContent="space-between" alignItems="center">
                <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827">
                  Total
                </Text>
                <Text fontSize={"xl"} fontFamily={fontHauoraBold} color={colorPrimary}>
                  AED {total.toFixed(2)}
                </Text>
              </Div>
            </Div>
          </Div>

          <Div bg="#FFFFFF" rounded={24} p={20} shadow="sm" borderWidth={1} borderColor="#F3F4F6">
            <Div flexDir="row" alignItems="flex-start" mb={16} style={{ gap: 12 }}>
              <Div w={40} h={40} rounded={999} bg="#FEF3C7" justifyContent="center" alignItems="center">
                <IconMapPin size={18} color="#F97316" />
              </Div>
              <Div flex={1}>
                <Text fontSize={10} fontFamily={fontHauoraBold} color="#D1D5DB" style={{ textTransform: "uppercase", letterSpacing: 1 }} mb={2}>
                  Location
                </Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                  {user?.address ?? "No address set"}
                </Text>
                <Text fontSize={11} fontFamily={fontHauora} color="#9CA3AF" mt={4}>
                  {user?.city && user?.country
                    ? `${user.city}, ${user.country}`
                    : "Add address in profile to book"}
                </Text>
              </Div>
            </Div>

            <Div flexDir="row" alignItems="flex-start" mb={16} style={{ gap: 12 }}>
              <Div w={40} h={40} rounded={999} bg="#DBEAFE" justifyContent="center" alignItems="center">
                <IconClock size={18} color="#3B82F6" />
              </Div>
              <Div flex={1}>
                <Text fontSize={10} fontFamily={fontHauoraBold} color="#D1D5DB" style={{ textTransform: "uppercase", letterSpacing: 1 }} mb={2}>
                  Appointment
                </Text>
                {hasServices ? (
                  <>
                    <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                      {schedule
                        ? `${schedule.labelTop} ${schedule.labelBottom} at ${schedule.time}`
                        : "No date selected"}
                    </Text>
                    {!schedule && (
                      <TouchableOpacity onPress={() => navigation.navigate("SelectDateTimeScreen")} style={{ mt: 8 }}>
                        <Text fontSize={"sm"} fontFamily={fontHauoraBold} color={colorPrimary}>
                          Select Date & Time →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#9CA3AF">
                    Not required for products
                  </Text>
                )}
              </Div>
            </Div>

            <Div flexDir="row" alignItems="flex-start" style={{ gap: 12 }}>
              <Div w={40} h={40} rounded={999} bg="#DBEAFE" justifyContent="center" alignItems="center">
                <IconCreditCard size={18} color="#3B82F6" />
              </Div>
              <Div flex={1}>
                <Text fontSize={10} fontFamily={fontHauoraBold} color="#D1D5DB" style={{ textTransform: "uppercase", letterSpacing: 1 }} mb={2}>
                  Payment Method
                </Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">
                  Stripe Payment Sheet
                </Text>
                <Text fontSize={11} fontFamily={fontHauora} color="#9CA3AF" mt={4}>
                  Card, Apple Pay, Google Pay
                </Text>
              </Div>
            </Div>
          </Div>

          <Div mt={24} mb={120} flexDir="row" alignItems="center" justifyContent="center" style={{ gap: 6 }}>
            <IconShieldCheck size={16} color="#9CA3AF" />
            <Text fontSize={11} fontFamily={fontHauoraMedium} color="#9CA3AF">
              Secure SSL payment powered by Stripe
            </Text>
          </Div>
        </ScrollView>

        <Div
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          bg="#FFFFFF"
          px={20}
          pt={12}
          pb={24}
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.06,
            shadowRadius: 18,
            elevation: 10,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.payButton, (btnLoading || (hasServices && !schedule)) && { opacity: 0.6 }]}
            disabled={items.length === 0 || btnLoading || (hasServices && !schedule)}
            onPress={handlePay}
          >
            {btnLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#FFFFFF">
                {hasServices && !schedule ? "Select Time First" : `Pay AED ${total.toFixed(2)}`}
              </Text>
            )}
          </TouchableOpacity>
        </Div>
      </Layout>
    </StripeProvider>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  payButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: colorPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
});
