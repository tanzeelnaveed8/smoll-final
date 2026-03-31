import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { type ServiceId, type ServiceSummary } from "@/mocks/homeServices";
import { fetchServiceDetailFromApi } from "@/utils/homeServicesApi";
import { useCartStore } from "@/store/modules/cart";
import { NavigationType } from "@/store/types";
import {
  IconBug,
  IconCheck,
  IconClock,
  IconCirclePlus,
  IconCut,
  IconDental,
  IconHeartRateMonitor,
  IconInfoCircle,
  IconPaw,
  IconPill,
  IconShieldCheck,
  IconStethoscope,
  IconUsers,
  IconVaccine,
  IconShoppingCart,
  IconShoppingBag,
} from "@tabler/icons-react-native";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Div, Text } from "react-native-magnus";

const getServiceIcon = (title: string, color: string, size = 28) => {
  const t = title.toLowerCase();
  if (t.includes("groom") || t.includes("trim"))
    return <IconCut size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("vaccin"))
    return <IconVaccine size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("checkup") || t.includes("health"))
    return <IconHeartRateMonitor size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("dental") || t.includes("teeth"))
    return <IconDental size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("deworm"))
    return <IconPill size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("flea") || t.includes("tick"))
    return <IconBug size={size} color={color} strokeWidth={1.8} />;
  if (t.includes("paw") || t.includes("nail"))
    return <IconPaw size={size} color={color} strokeWidth={1.8} />;
  return <IconStethoscope size={size} color={color} strokeWidth={1.8} />;
};

interface Props {
  navigation: NavigationType;
}

const ServiceDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute();
  const serviceId = (route.params as { serviceId?: ServiceId | string })?.serviceId;
  const [service, setService] = useState<ServiceSummary | null>(null);
  const [loading, setLoading] = useState(!!serviceId);
  const [packages, setPackages] = useState<Array<{ id: string; name: string; priceLabel: string; price: number; perks: string[]; highlighted?: boolean }>>([]);
  const [addons, setAddons] = useState<Array<{ id: string; name: string; priceLabel: string; price: number }>>([]);
  useEffect(() => {
    if (!serviceId) {
      setService(null);
      setPackages([]);
      setAddons([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchServiceDetailFromApi(String(serviceId))
      .then(({ service: s, packages: p, addons: a }) => {
        if (cancelled) return;
        setService(s ?? null);
        setPackages(p ?? []);
        setAddons(a ?? []);
        if (p && p.length > 0) {
          setSelectedPackageId((prev) =>
            p.some((pk) => pk.id === prev) ? prev : p[0].id
          );
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setService(null);
          setPackages([]);
          setAddons([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const [numPets, setNumPets] = useState(1);
  const defaultPkgId = packages[0]?.id ?? "basic";
  const [selectedPackageId, setSelectedPackageId] = useState<string>(defaultPkgId);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [specialNotes, setSpecialNotes] = useState("");

  const addOrUpdateItem = useCartStore((s) => s.addOrUpdateItem);
  const canAdd = useCartStore((s) => s.canAdd);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartItemsCount = useCartStore((state) => state.items.length);

  const safeService: ServiceSummary = service ?? {
    id: (serviceId as ServiceId) ?? "grooming",
    title: "",
    description: "",
    durationLabel: "",
    priceLabel: "",
    startingPrice: 0,
    iconBg: "#F3F4F6",
    iconColor: colorPrimary,
  };

  const selectedPkg = useMemo(
    () => packages.find((p) => p.id === selectedPackageId),
    [packages, selectedPackageId]
  );

  const estimatedTotal = useMemo(() => {
    const pkgPrice = selectedPkg?.price ?? 0;
    const addonTotal = addons
      .filter((a) => selectedAddons.has(a.id))
      .reduce((sum, a) => sum + a.price, 0);
    return (pkgPrice + addonTotal) * numPets;
  }, [selectedPkg, addons, selectedAddons, numPets]);

  const handleAddToCart = () => {
    if (!service) return;

    // If packages exist but none selected, handle it (sanity check)
    if (packages.length > 0 && !selectedPackageId) {
      return;
    }

    const doAdd = () => {
      const cartAddons = addons
        .filter((a) => selectedAddons.has(a.id))
        .map((a) => ({ id: a.id, name: a.name, price: a.price }));
      addOrUpdateItem({
        id: service.id,
        type: "service",
        title: service.title,
        subtitle: service.durationLabel,
        unitPrice: selectedPkg?.price ?? service.startingPrice,
        quantity: numPets,
        packageId: selectedPkg?.id,
        packageLabel: selectedPkg?.name,
        addons: cartAddons,
        notes: specialNotes.trim() || undefined,
        imageUrl: service.imageUrl || undefined,
      });
      navigation.navigate("YourCartScreen");
    };

    if (!canAdd("service")) {
      Alert.alert(
        "Clear Cart?",
        "Your cart contains items from a different category. You can only checkout with one category at a time (Services or Products). Would you like to clear your cart and add this service?",
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

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const incrementPets = () => setNumPets((n) => Math.min(5, n + 1));
  const decrementPets = () => setNumPets((n) => Math.max(1, n - 1));

  if (loading) {
    return (
      <Layout disableHeader>
        <Div flex={1} bg="#FAF8F5" justifyContent="center" alignItems="center">
          <ActivityIndicator size="small" color={colorPrimary} />
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

        <Div bg="#EFF6FF" rounded={24} p={20} mb={24} mt={8}>
          <Div flexDir="row" alignItems="center" mb={14}>
            <Div w={52} h={52} rounded={14} bg="white" justifyContent="center" alignItems="center" mr={14} style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
              {getServiceIcon(safeService.title, colorPrimary)}
            </Div>
            <Div flex={1}>
              <Text fontSize={"xl"} fontFamily={fontHauoraBold} color="#111827">
                {safeService.title || "Service"}
              </Text>
              <Text fontSize={"md"} fontFamily={fontHauoraBold} color={colorPrimary} mt={2}>
                {safeService.priceLabel}
              </Text>
            </Div>
          </Div>

          {safeService.description ? (
            <Text fontSize={"sm"} fontFamily={fontHauora} color="#4B5563" lineHeight={22} mb={14}>
              {safeService.description}
            </Text>
          ) : null}

          <Div flexDir="row" flexWrap="wrap" style={{ gap: 8 }}>
            <Div flexDir="row" alignItems="center" bg="white" px={10} py={6} rounded={999}>
              <IconClock size={13} color="#6B7280" />
              <Text fontSize={11} fontFamily={fontHauoraSemiBold} color="#4B5563" ml={5}>
                {safeService.durationLabel || "30-60 min"}
              </Text>
            </Div>
            <Div flexDir="row" alignItems="center" bg="white" px={10} py={6} rounded={999}>
              <IconShieldCheck size={13} color={colorPrimary} />
              <Text fontSize={11} fontFamily={fontHauoraSemiBold} color="#4B5563" ml={5}>
                Licensed Vet
              </Text>
            </Div>
          </Div>
        </Div>

        <Div bg="#FFFFFF" rounded={20} borderWidth={1} borderColor="#E5E7EB" px={16} py={14} flexDir="row" alignItems="center" justifyContent="space-between" mb={24}>
          <Div flexDir="row" alignItems="center" style={{ gap: 8 }}>
            <IconUsers size={20} color={colorPrimary} />
            <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827">
              Number of pets
            </Text>
          </Div>
          <Div flexDir="row" alignItems="center" style={{ gap: 16 }}>
            <TouchableOpacity onPress={decrementPets} disabled={numPets <= 1} style={styles.circleBtn}>
              <Text fontSize={"lg"} color={numPets <= 1 ? "#D1D5DB" : "#4B5563"}>-</Text>
            </TouchableOpacity>
            <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#111827">
              {numPets}
            </Text>
            <TouchableOpacity onPress={incrementPets} style={styles.circleBtn}>
              <Text fontSize={"lg"} color="#111827">+</Text>
            </TouchableOpacity>
          </Div>
        </Div>

        {packages.length > 0 && (
          <Div mb={24}>
            <Div flexDir="row" alignItems="center" mb={12}>
              <IconShieldCheck size={20} color={colorPrimary} />
              <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827" ml={8}>
                Select Package
              </Text>
            </Div>
            <Div style={{ gap: 12 }}>
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    activeOpacity={0.85}
                    onPress={() => setSelectedPackageId(pkg.id)}
                    style={[styles.packageCard, isSelected && styles.packageCardSelected]}
                  >
                    {isSelected && (
                      <Div position="absolute" top={0} right={0} bg={colorPrimary} px={10} py={4} roundedBottomLeft={12} roundedTopRight={12}>
                        <Text fontSize={10} fontFamily={fontHauoraBold} color="#fff" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Selected</Text>
                      </Div>
                    )}

                    <Div flexDir="row" alignItems="flex-start" justifyContent="space-between" mb={8}>
                      <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#111827">
                        {pkg.name}
                      </Text>
                      <Text fontSize={"lg"} fontFamily={fontHauoraBold} color={isSelected ? colorPrimary : "#111827"}>
                        {pkg.priceLabel}
                      </Text>
                    </Div>

                    <Div style={{ gap: 6 }}>
                      {pkg.perks.map((perk, perkIdx) => (
                        <Div key={`${pkg.id}-perk-${perkIdx}`} flexDir="row" alignItems="center" style={{ gap: 6 }}>
                          <IconCheck size={16} color={isSelected ? colorPrimary : "#9CA3AF"} strokeWidth={2} />
                          <Text fontSize={"sm"} fontFamily={fontHauora} color="#6B7280">
                            {perk}
                          </Text>
                        </Div>
                      ))}
                    </Div>
                  </TouchableOpacity>
                );
              })}
            </Div>
          </Div>
        )}

        {addons.length > 0 && (
          <Div mb={24}>
            <Div flexDir="row" alignItems="center" mb={12}>
              <IconCirclePlus size={20} color={colorPrimary} />
              <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#111827" ml={8}>
                Add-ons & Extras
              </Text>
            </Div>
            <Div style={{ gap: 10 }}>
              {addons.map((addon) => {
                const isSelected = selectedAddons.has(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    activeOpacity={0.8}
                    style={styles.addonRow}
                    onPress={() => toggleAddon(addon.id)}
                  >
                    <Div flex={1}>
                      <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827" mb={4}>
                        {addon.name}
                      </Text>
                      <Text fontSize={11} fontFamily={fontHauoraMedium} color={colorPrimary}>
                        {addon.priceLabel}
                      </Text>
                    </Div>
                    <Div
                      w={24}
                      h={24}
                      rounded={999}
                      borderWidth={2}
                      borderColor={isSelected ? colorPrimary : "#E5E7EB"}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {isSelected && (
                        <Div w={12} h={12} rounded={999} bg={colorPrimary} />
                      )}
                    </Div>
                  </TouchableOpacity>
                );
              })}
            </Div>
          </Div>
        )}

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
            placeholder="Any specific instructions for this service?"
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
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 8 }}
      >
        <Div flexDir="row" alignItems="center" justifyContent="space-between">
          <Div>
            <Text fontSize={11} fontFamily={fontHauoraMedium} color="#6B7280" mb={2}>
              Estimated total
            </Text>
            <Text fontSize={"xl"} fontFamily={fontHauoraBold} color={colorPrimary}>
              AED {estimatedTotal.toFixed(0)}
            </Text>
          </Div>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={handleAddToCart}
            disabled={!selectedPkg}
          >
            <IconShoppingBag size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text fontSize={"md"} fontFamily={fontHauoraSemiBold} color="#FFFFFF">
              Add to Cart
            </Text>
          </TouchableOpacity>
        </Div>
      </Div>
    </Layout>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 160 },
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
  packageCard: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  packageCardSelected: {
    borderColor: colorPrimary,
    backgroundColor: "#EFF6FF",
  },
  addonRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
