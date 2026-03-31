import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { type ProductId, type ProductSummary, type ProductBundleOption } from "@/mocks/homeServices";
import { fetchProductByIdFromApi } from "@/utils/homeServicesApi";
import { useCartStore } from "@/store/modules/cart";
import { NavigationType } from "@/store/types";
import {
  IconClock,
  IconInfoCircle,
  IconShieldCheck,
  IconShoppingCart,
  IconTruck,
} from "@tabler/icons-react-native";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { Div, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
}

const ProductDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();
  const productId = (route.params as { productId?: ProductId | string })?.productId;
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(!!productId);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProductByIdFromApi(String(productId)).then((p) => {
      if (!cancelled) {
        setProduct(p);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const [selectedBundleId, setSelectedBundleId] = useState<string>("");
  const [count, setCount] = useState(1);
  const [specialNotes, setSpecialNotes] = useState("");

  const addOrUpdateItem = useCartStore((s) => s.addOrUpdateItem);
  const canAdd = useCartStore((s) => s.canAdd);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartItemsCount = useCartStore((state) => state.items.length);

  // Use bundle options from API, or fallback to default if not available
  const bundleOptions: ProductBundleOption[] = useMemo(() => {
    if (product?.bundleOptions && product.bundleOptions.length > 0) {
      return product.bundleOptions;
    }
    // Return empty array to show "Not Available" message
    return [];
  }, [product?.bundleOptions]);

  // Set default selected bundle when product/bundles load
  useEffect(() => {
    if (bundleOptions.length > 0 && !selectedBundleId) {
      setSelectedBundleId(bundleOptions[0].id);
    }
  }, [bundleOptions, selectedBundleId]);

  const selectedBundle = useMemo(
    () => bundleOptions.find((b) => b.id === selectedBundleId),
    [bundleOptions, selectedBundleId]
  );

  const unitPrice = product?.basePrice ?? 0;
  const multiplier = selectedBundle?.multiplier ?? 1;
  const totalPrice = unitPrice * multiplier * count;

  const handleAddToCart = () => {
    if (!product) return;

    // Only block if bundles exist but none selected (sanity check)
    if (bundleOptions.length > 0 && !selectedBundleId) {
      return;
    }

    const doAdd = () => {
      addOrUpdateItem({
        id: product.id,
        type: "product",
        title: product.title,
        subtitle: product.description,
        unitPrice: unitPrice * (selectedBundle?.multiplier ?? 1),
        quantity: count,
        packageId: selectedBundle?.id,
        packageLabel: selectedBundle?.label,
        notes: specialNotes.trim() || undefined,
        imageUrl: product.imageUrl || undefined,
      });
      navigation.navigate("YourCartScreen");
    };

    if (!canAdd("product")) {
      Alert.alert(
        "Clear Cart?",
        "Your cart contains services. You can only checkout with one category at a time (Services or Products). Would you like to clear your cart and add this product?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear & Add",
            onPress: () => {
              clearCart();
              doAdd();
            },
          },
        ]
      );
    } else {
      doAdd();
    }
  };

  const increment = () => setCount((n) => Math.min(10, n + 1));
  const decrement = () => setCount((n) => Math.max(1, n - 1));

  if (loading) {
    return (
      <Layout disableHeader>
        <Div flex={1} bg="#FAF8F5" justifyContent="center" alignItems="center">
          <ActivityIndicator size="small" color={colorPrimary} />
        </Div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout disableHeader>
        <Div p={20}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text fontSize="lg" fontFamily={fontHauora} color="#6B7280" mt={12}>
            Product not found.
          </Text>
        </Div>
      </Layout>
    );
  }

  return (
    <Layout disableHeader>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Div pt={8} pb={4} flexDir="row" justifyContent="space-between" alignItems="center">
          <BackButton onPress={() => navigation.goBack()} />
          {cartItemsCount > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("YourCartScreen")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
                marginRight: 4
              }}
            >
              <Div position="relative">
                <IconShoppingCart size={24} color="#555555" strokeWidth={1.4} />
                <Div
                  position="absolute"
                  top={-3}
                  right={-4}
                  w={10}
                  h={10}
                  bg="#EF4444"
                  rounded={100}
                  borderWidth={2}
                  borderColor="white"
                />
              </Div>
            </TouchableOpacity>
          )}
        </Div>

        <Div mb={20} mt={4}>
          <Div
            w="100%"
            h={220}
            rounded={24}
            bg="#F9FAFB"
            overflow="hidden"
            borderWidth={1}
            borderColor="#F3F4F6"
          >
            <Image
              source={
                product.imageUrl
                  ? { uri: product.imageUrl }
                  : require("@/assets/images/no-image.png")
              }
              style={{ width: "100%", height: "100%", borderRadius: 24 }}
              resizeMode="cover"
            />
          </Div>
        </Div>

        <Div mb={20}>
          <Div flexDir="row" alignItems="center" justifyContent="space-between" mb={8}>
            <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color="#111827" flex={1} mr={12}>
              {product.title}
            </Text>
            <Div bg={colorPrimary} px={14} py={8} rounded={999}>
              <Text fontSize={"md"} fontFamily={fontHauoraBold} color="white">
                {product.priceLabel}
              </Text>
            </Div>
          </Div>

          <Div flexDir="row" alignItems="center" style={{ gap: 8 }} mb={12}>
            {/* Render tags from API */}
            {product?.tags && product.tags.length > 0 ? (
              product.tags.map((tag, idx) => (
                <Div key={idx} flexDir="row" alignItems="center" bg={tag.color ? `${tag.color}20` : "#ECFDF5"} px={10} py={6} rounded={999}>
                  <Text fontSize={11} fontFamily={fontHauoraSemiBold} color={tag.color || "#16A34A"} ml={tag.icon ? 4 : 0}>
                    {tag.icon ? `${tag.icon} ` : ""}{tag.text}
                  </Text>
                </Div>
              ))
            ) : product.tag ? (
              // Fallback to legacy tag field
              <Div flexDir="row" alignItems="center" bg="#ECFDF5" px={10} py={6} rounded={999}>
                <IconShieldCheck size={14} color="#22C55E" />
                <Text fontSize={11} fontFamily={fontHauoraSemiBold} color="#16A34A" ml={4}>
                  {product.tag}
                </Text>
              </Div>
            ) : null}
          </Div>

          <Text fontSize={"sm"} fontFamily={fontHauora} color="#6B7280" lineHeight={22}>
            {product.description}
          </Text>
        </Div>

        {bundleOptions.length > 0 && (
          <Div mb={24}>
            <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827" mb={12}>
              Bundle & Save
            </Text>
            <Div flexDir="row" flexWrap="wrap" style={{ gap: 12 }}>
              {bundleOptions.map((bundle) => {
                const isActive = bundle.id === selectedBundleId;
                return (
                  <TouchableOpacity
                    key={bundle.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedBundleId(bundle.id)}
                    style={[styles.quantityOption, isActive && styles.quantityOptionActive]}
                  >
                    <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color={isActive ? colorPrimary : "#4B5563"}>
                      {bundle.label}
                    </Text>
                    {bundle.badge ? (
                      <Text fontSize={11} fontFamily={fontHauoraMedium} color="#6B7280">
                        {bundle.badge}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </Div>
          </Div>
        )}

        <Div mb={24}>
          <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827" mb={12}>
            Number of items
          </Text>
          <Div
            flexDir="row"
            alignItems="center"
            justifyContent="space-between"
            bg="#FFFFFF"
            rounded={20}
            borderWidth={1}
            borderColor="#E5E7EB"
            px={16}
            py={14}
          >
            <TouchableOpacity onPress={decrement} disabled={count <= 1} style={styles.circleBtn}>
              <Text fontSize={"lg"} color={count <= 1 ? "#D1D5DB" : "#4B5563"}>-</Text>
            </TouchableOpacity>
            <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#111827">
              {count}
            </Text>
            <TouchableOpacity onPress={increment} style={styles.circleBtn}>
              <Text fontSize={"lg"} color="#111827">+</Text>
            </TouchableOpacity>
          </Div>
        </Div>

        <Div mb={24} style={{ gap: 12 }}>
          {/* Render delivery offers from API */}
          {product?.deliveryOffers && product.deliveryOffers.length > 0 ? (
            product.deliveryOffers.map((offer, idx) => (
              <Div key={idx} flexDir="row" alignItems="center" bg="#FFFFFF" rounded={20} borderWidth={1} borderColor="#E5E7EB" px={16} py={14} style={{ gap: 12 }}>
                <Text fontSize={20}>{offer.icon || "🚚"}</Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#4B5563" flex={1}>
                  {offer.text}
                </Text>
              </Div>
            ))
          ) : (
            // Fallback to default offers
            <>
              <Div flexDir="row" alignItems="center" bg="#FFFFFF" rounded={20} borderWidth={1} borderColor="#E5E7EB" px={16} py={14} style={{ gap: 12 }}>
                <IconTruck size={20} color={colorPrimary} />
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#4B5563" flex={1}>
                  Free delivery on orders over AED 100
                </Text>
              </Div>
              <Div flexDir="row" alignItems="center" bg="#FFFFFF" rounded={20} borderWidth={1} borderColor="#E5E7EB" px={16} py={14} style={{ gap: 12 }}>
                <IconClock size={20} color={colorPrimary} />
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#4B5563" flex={1}>
                  Vet-approved & sourced from trusted suppliers
                </Text>
              </Div>
            </>
          )}
        </Div>

        <Div mb={24}>
          <Div flexDir="row" alignItems="center" mb={12}>
            <IconInfoCircle size={20} color={colorPrimary} />
            <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827" ml={8}>
              Special Instructions
            </Text>
          </Div>
          <TextInput
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Any specific delivery instructions?"
            placeholderTextColor="#9CA3AF"
            style={styles.textArea}
            value={specialNotes}
            onChangeText={setSpecialNotes}
          />
          <Text fontSize={10} fontFamily={fontHauora} color="#9CA3AF" mt={4}>
            {specialNotes.length}/500
          </Text>
        </Div>
      </ScrollView>

      <Div
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        bg="#FFFFFF"
        borderTopWidth={1}
        borderTopColor="#E5E7EB"
        px={20}
        pt={14}
        pb={28}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <Div flexDir="row" alignItems="center" justifyContent="space-between">
          <Div>
            <Text fontSize={11} fontFamily={fontHauoraMedium} color="#6B7280" mb={2}>
              Total price
            </Text>
            <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color={colorPrimary}>
              AED {totalPrice.toFixed(2)}
            </Text>
          </Div>
          <TouchableOpacity activeOpacity={0.85} style={styles.primaryButton} onPress={handleAddToCart}>
            <IconShoppingCart size={18} color="#FFFFFF" />
            <Text fontSize={"md"} fontFamily={fontHauoraSemiBold} color="#FFFFFF" ml={8}>
              Add to Cart
            </Text>
          </TouchableOpacity>
        </Div>
      </Div>
    </Layout>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 180 },
  quantityOption: {
    flexGrow: 1,
    minWidth: "28%",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityOptionActive: {
    borderColor: colorPrimary,
    backgroundColor: "#EEF2FF",
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
    fontFamily: fontHauora,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
  },
});
