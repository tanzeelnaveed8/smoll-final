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
import { NavigationType } from "@/store/types";
import { IconMinus, IconPlus, IconTrash, IconArrowLeft } from "@tabler/icons-react-native";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Div, Text } from "react-native-magnus";

function itemLineTotal(item: CartItem): number {
  const base = item.unitPrice * item.quantity;
  const addonsTotal =
    item.addons?.reduce((sum, a) => sum + a.price * item.quantity, 0) ?? 0;
  return base + addonsTotal;
}

interface Props {
  navigation: NavigationType;
}

const YourCartScreen: React.FC<Props> = ({ navigation }) => {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const schedule = useCartStore((s) => s.schedule);

  const total = getTotal();

  // Check cart content types
  const hasOnlyProducts = items.length > 0 && items.every(item => item.type === "product");
  const hasServices = items.some(item => item.type === "service");

  return (
    <Layout disableHeader>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Div bg="#FFFFFF" rounded={24} p={20} mb={16} shadow="sm">
          <BackButton onPress={() => navigation.goBack()} />
          <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color="#1A1A1A" mt={16}>
            Your Cart
          </Text>
          <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#9CA3AF" mt={4}>
            {items.length === 0
              ? "0 items"
              : `${items.length} ${items.length === 1 ? "item" : "items"}`}
          </Text>
          {schedule && hasServices ? (
            <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#6B7280" mt={6}>
              {schedule.labelTop} {schedule.labelBottom} at {schedule.time}
            </Text>
          ) : null}
          {/* Add More button based on cart content */}
          {hasServices ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: colorPrimary,
              }}
              onPress={() => navigation.navigate("HomeServicesScreen")}
            >
              <IconArrowLeft size={16} color={colorPrimary} strokeWidth={2} />
              <Text fontSize={"sm"} fontFamily={fontHauoraBold} color={colorPrimary} ml={6}>
                Add More Services
              </Text>
            </TouchableOpacity>
          ) : hasOnlyProducts ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={{
                marginTop: 14,
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: colorPrimary,
              }}
              onPress={() => navigation.navigate("HomeServicesScreen")}
            >
              <IconArrowLeft size={16} color={colorPrimary} strokeWidth={2} />
              <Text fontSize={"sm"} fontFamily={fontHauoraBold} color={colorPrimary} ml={6}>
                Add More Products
              </Text>
            </TouchableOpacity>
          ) : null}
        </Div>

        {items.length === 0 ? (
          <Div py={24} alignItems="center">
            <Text fontSize="md" fontFamily={fontHauora} color="#9CA3AF">
              Your cart is empty
            </Text>
          </Div>
        ) : (
          items.map((item) => (
            <Div
              key={`${item.type}-${item.id}-${item.packageId ?? ""}`}
              bg="#FFFFFF"
              rounded={24}
              p={20}
              mb={12}
              shadow="sm"
              borderWidth={1}
              borderColor="#F3F4F6"
            >
              <Div flexDir="row" justifyContent="space-between" alignItems="flex-start" mb={16}>
                <Div flex={1}>
                  <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#1A1A1A">
                    {item.title}
                  </Text>
                  {item.packageLabel ? (
                    <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#6B7280" mt={2}>
                      {item.packageLabel}
                    </Text>
                  ) : null}
                </Div>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => removeItem(item.id, item.type, item.packageId)}
                >
                  <IconTrash size={18} color="#D1D5DB" />
                </TouchableOpacity>
              </Div>

              <Div flexDir="row" justifyContent="space-between" alignItems="center">
                <Div
                  flexDir="row"
                  alignItems="center"
                  bg="#F9F9F7"
                  rounded={16}
                  px={6}
                  py={4}
                  style={{ gap: 4 }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.id, item.type, Math.max(1, item.quantity - 1), item.packageId)
                    }
                    disabled={item.quantity <= 1}
                    style={styles.qtyButton}
                  >
                    <IconMinus size={16} color={item.quantity <= 1 ? "#D1D5DB" : "#4B5563"} strokeWidth={2.2} />
                  </TouchableOpacity>
                  <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#1A1A1A" mx={10}>
                    {item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      updateQuantity(item.id, item.type, item.quantity + 1, item.packageId)
                    }
                    style={styles.qtyButton}
                  >
                    <IconPlus size={16} color="#111827" strokeWidth={2.2} />
                  </TouchableOpacity>
                </Div>

                <Text fontSize={"lg"} fontFamily={fontHauoraBold} color={colorPrimary}>
                  AED {itemLineTotal(item).toFixed(2)}
                </Text>
              </Div>
            </Div>
          ))
        )}

        <Div h={140} />
      </ScrollView>

      {items.length > 0 && (
        <Div
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          bg="#FFFFFF"
          px={20}
          pt={12}
          pb={24}
          borderTopWidth={1}
          borderTopColor="#E5E7EB"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.05,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <Div flexDir="row" alignItems="center" justifyContent="space-between" mb={16}>
            <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#9CA3AF">
              Total
            </Text>
            <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color={colorPrimary}>
              AED {total.toFixed(2)}
            </Text>
          </Div>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => {
              // Products go directly to checkout, services go to timing selection
              console.log("Cart items:", items);
              console.log("Has only products:", hasOnlyProducts);
              console.log("Has services:", hasServices);
              if (hasOnlyProducts) {
                console.log("Navigating to CheckoutScreen (products only)");
                navigation.navigate("CheckoutScreen");
              } else {
                console.log("Navigating to SelectDateTimeScreen (has services)");
                navigation.navigate("SelectDateTimeScreen");
              }
            }}
            disabled={items.length === 0}
          >
            <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#FFFFFF">
              {hasOnlyProducts ? "Proceed to Checkout" : "Select Date & Time"}
            </Text>
          </TouchableOpacity>
        </Div>
      )}
    </Layout>
  );
};

export default YourCartScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 180 },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: {
    height: 56,
    borderRadius: 20,
    backgroundColor: colorPrimary,
    justifyContent: "center",
    alignItems: "center",
  },
});
