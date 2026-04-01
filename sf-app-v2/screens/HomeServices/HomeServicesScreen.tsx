import Layout from "@/components/app/Layout";
import BackButton from "@/components/partials/BackButton";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { useAIPicks } from "@/hooks/useAIPicks";
import { useHomeServices } from "@/hooks/useHomeServices";
import { NavigationType } from "@/store/types";
import {
  IconBug,
  IconCirclePlus,
  IconCut,
  IconDental,
  IconHeartRateMonitor,
  IconPaw,
  IconPill,
  IconShieldCheck,
  IconStethoscope,
  IconVaccine,
} from "@tabler/icons-react-native";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Div, Text } from "react-native-magnus";
import api from "@/utils/api";

const CARD_GAP = 16;

const getServiceIcon = (title: string, color: string) => {
  const t = title.toLowerCase();
  if (t.includes("groom") || t.includes("trim"))
    return <IconCut size={20} color={color} strokeWidth={2} />;
  if (t.includes("vaccin"))
    return <IconVaccine size={20} color={color} strokeWidth={2} />;
  if (t.includes("checkup") || t.includes("health"))
    return <IconHeartRateMonitor size={20} color={color} strokeWidth={2} />;
  if (t.includes("dental") || t.includes("teeth"))
    return <IconDental size={20} color={color} strokeWidth={2} />;
  if (t.includes("deworm"))
    return <IconPill size={20} color={color} strokeWidth={2} />;
  if (t.includes("flea") || t.includes("tick"))
    return <IconBug size={20} color={color} strokeWidth={2} />;
  if (t.includes("paw") || t.includes("nail"))
    return <IconPaw size={20} color={color} strokeWidth={2} />;
  return <IconStethoscope size={20} color={color} strokeWidth={2} />;
};

type TabType = "services" | "nutritions";
type NutritionsSubTab = "all" | "ai";

const HomeServicesScreen: React.FC<{ navigation: NavigationType }> = ({
  navigation,
}) => {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;
  const [activeTab, setActiveTab] = useState<TabType>("services");
  const [nutritionsSubTab, setNutritionsSubTab] =
    useState<NutritionsSubTab>("all");
  const { services, products, loading: homeServicesLoading } = useHomeServices();
  const { products: aiPicksProducts, loading: aiPicksLoading, error: aiPicksError } = useAIPicks();
  const [servicesAds, setServicesAds] = useState<any[]>([]);
  const [productsAds, setProductsAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(true);

  const loading = homeServicesLoading;

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setAdsLoading(true);
      console.log('=== START FETCHING ADS ===');

      console.log('Fetching services_top ads from /ad-spots/active?position=services_top');
      const servicesResponse = await api.get('/ad-spots/active?position=services_top');
      console.log('✅ Services top ads response:', JSON.stringify(servicesResponse.data, null, 2));

      console.log('Fetching services_middle ads from /ad-spots/active?position=services_middle');
      const servicesMiddleResponse = await api.get('/ad-spots/active?position=services_middle');
      console.log('✅ Services middle ads response:', JSON.stringify(servicesMiddleResponse.data, null, 2));

      const combinedServices = [
        ...(servicesResponse.data || []),
        ...(servicesMiddleResponse.data || [])
      ];
      setServicesAds(combinedServices);
      console.log('📦 Final services ads count:', combinedServices.length);
      console.log('📦 Final services ads:', JSON.stringify(combinedServices, null, 2));

      console.log('Fetching products_top ads from /ad-spots/active?position=products_top');
      const productsResponse = await api.get('/ad-spots/active?position=products_top');
      console.log('✅ Products top ads response:', JSON.stringify(productsResponse.data, null, 2));

      console.log('Fetching products_middle ads from /ad-spots/active?position=products_middle');
      const productsMiddleResponse = await api.get('/ad-spots/active?position=products_middle');
      console.log('✅ Products middle ads response:', JSON.stringify(productsMiddleResponse.data, null, 2));

      const combinedProducts = [
        ...(productsResponse.data || []),
        ...(productsMiddleResponse.data || [])
      ];
      setProductsAds(combinedProducts);
      console.log('📦 Final products ads count:', combinedProducts.length);
      console.log('📦 Final products ads:', JSON.stringify(combinedProducts, null, 2));

      console.log('=== END FETCHING ADS ===');
    } catch (error) {
      console.log("❌ Error fetching ads:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      setServicesAds([]);
      setProductsAds([]);
    } finally {
      setAdsLoading(false);
    }
  };

  const handleAdNavigation = (actionUrl: string) => {
    if (!actionUrl) return;
    
    // Map URL paths to screen names
    const screenMap: Record<string, string> = {
      '/smoll-home/services': 'HomeServicesScreen',
      '/smoll-home/products': 'HomeServicesScreen',
      '/smoll-home/nutritions': 'HomeServicesScreen',
    };
    
    const screenName = screenMap[actionUrl] || actionUrl.replace(/^\//, '').split('/').pop();
    
    if (screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <Layout disableHeader>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Div pt={8} pb={4} mb={2}>
          <Div mb={6}>
            <BackButton onPress={() => navigation.goBack()} />
          </Div>
          <Text fontSize={"2xl"} fontFamily={fontHauoraBold} color="#1A1A1A">
            Home Services
          </Text>
          <Text
            fontSize={"sm"}
            fontFamily={fontHauoraMedium}
            color="#6B7280"
            mt={4}
          >
            Professional vet care at your doorstep
          </Text>
        </Div>

        <Div
          flexDir="row"
          borderBottomWidth={1}
          borderColor="#f3f4f6"
          mb={0}
        >
          <TouchableOpacity
            style={[
              styles.topTab,
              activeTab === "services" && styles.topTabActive,
            ]}
            onPress={() => setActiveTab("services")}
          >
            <Div flexDir="row" alignItems="center" style={{ gap: 6 }}>
              <IconStethoscope
                size={18}
                color={activeTab === "services" ? colorPrimary : "#9CA3AF"}
                strokeWidth={1.8}
              />
              <Text
                fontSize={"sm"}
                fontFamily={fontHauoraSemiBold}
                color={activeTab === "services" ? colorPrimary : "#9CA3AF"}
              >
                Services
              </Text>
            </Div>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.topTab,
              activeTab === "nutritions" && styles.topTabActive,
            ]}
            onPress={() => setActiveTab("nutritions")}
          >
            <Div flexDir="row" alignItems="center" style={{ gap: 6 }}>
              <IconPill
                size={18}
                color={activeTab === "nutritions" ? colorPrimary : "#9CA3AF"}
                strokeWidth={1.8}
              />
              <Text
                fontSize={"sm"}
                fontFamily={fontHauoraSemiBold}
                color={activeTab === "nutritions" ? colorPrimary : "#9CA3AF"}
              >
                Food & Supplies
              </Text>
            </Div>
          </TouchableOpacity>
        </Div>

        {loading ? (
          <Div py={12} alignItems="center">
            <ActivityIndicator size="large" color={colorPrimary} />
          </Div>
        ) : activeTab === "services" ? (
          <>
            {/* Services with interleaved ads - 2 services then 1 ad */}
            {(() => {
              const elements = [];
              let serviceIndex = 0;
              let adIndex = 0;
              
              while (serviceIndex < services.length || adIndex < servicesAds.length) {
                // Render 2 services
                if (serviceIndex < services.length) {
                  elements.push(
                    <Div flexDir="row" flexWrap="wrap" style={{ justifyContent: "space-between" }} mt={serviceIndex === 0 ? 6 : 0} mb={CARD_GAP} key={`services-row-${serviceIndex}`}>
                      {services.slice(serviceIndex, serviceIndex + 2).map((s) => (
                        <TouchableOpacity
                          key={s.id}
                          style={styles.serviceCard}
                          activeOpacity={0.8}
                          onPress={() =>
                            navigation.navigate("ServiceDetailsScreen", { serviceId: s.id })
                          }
                        >
                          <Div
                            w={40}
                            h={40}
                            bg={s.iconBg}
                            rounded={12}
                            justifyContent="center"
                            alignItems="center"
                            mb={12}
                          >
                            {getServiceIcon(s.title, s.iconColor)}
                          </Div>
                          <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#222" mb={2}>
                            {s.title}
                          </Text>
                          <Text fontSize={"xs"} color="#9CA3AF" fontFamily={fontHauora} mb={2}>
                            {s.durationLabel}
                          </Text>
                          <Div style={{ marginTop: 'auto' }}>
                            <Text fontSize={"sm"} fontFamily={fontHauoraBold} color={colorPrimary}>
                              {s.priceLabel}
                            </Text>
                          </Div>
                        </TouchableOpacity>
                      ))}
                    </Div>
                  );
                  serviceIndex += 2;
                }
                
                // Render 1 ad after every 2 services
                if (adIndex < servicesAds.length && serviceIndex <= services.length) {
                  const ad = servicesAds[adIndex];
                  console.log('🎯 Rendering service ad:', ad);
                  console.log('🖼️ Image URL:', ad.imageUrl || ad.image || ad.fileUrl);
                  elements.push(
                    <Div
                      key={`service-ad-${ad.id || adIndex}`}
                      rounded={24}
                      mb={10}
                      px={20}
                      py={16}
                      bg="#000000"
                      style={{ overflow: 'hidden' }}
                    >
                      {(ad.imageUrl || ad.image || ad.fileUrl) && (
                        <Image source={{ uri: ad.imageUrl || ad.image || ad.fileUrl }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 24 }} resizeMode="cover" />
                      )}
                      <Div style={{ position: 'relative', zIndex: 1 }}>
                        <Text fontSize={"xs"} fontFamily={fontHauoraBold} color="#F9FAFB" style={{ textTransform: "uppercase", letterSpacing: 1.2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 }} mb={6}>Sponsored</Text>
                        <Text fontSize={"xl"} fontFamily={fontHauoraBold} color="#FFFFFF" mb={10} style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 }}>{ad.title}</Text>
                        <TouchableOpacity activeOpacity={0.85} onPress={() => ad.actionUrl && handleAdNavigation(ad.actionUrl)}>
                          <Div bg="#FFFFFF" px={18} py={10} rounded={16} alignSelf="flex-start">
                            <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">{ad.actionLabel || "Shop Now"}</Text>
                          </Div>
                        </TouchableOpacity>
                      </Div>
                    </Div>
                  );
                  adIndex++;
                }
              }
              
              return elements;
            })()}

            <Div flexDir="row" alignItems="center" bg="#EFF6FF" borderWidth={1} borderColor="#BFDBFE" rounded={12} p={16} style={{ gap: 12 }} mb={8}>
              <IconShieldCheck size={20} color={colorPrimary} />
              <Text fontSize={"xs"} fontFamily={fontHauora} color="#1E40AF" lineHeight={16} flex={1}>
                All services are performed by licensed veterinarians and certified pet care specialists.
              </Text>
            </Div>
          </>
        ) : activeTab === "nutritions" ? (
          <>
            <Div flexDir="row" style={{ gap: 12 }} mt={6} mb={6}>
              <TouchableOpacity
                style={[styles.subTab, nutritionsSubTab === "all" && styles.subTabActive]}
                onPress={() => setNutritionsSubTab("all")}
              >
                <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold} color={nutritionsSubTab === "all" ? "white" : "#6B7280"}>
                  All Products
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.subTab, nutritionsSubTab === "ai" && styles.subTabActive]}
                onPress={() => setNutritionsSubTab("ai")}
              >
                <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold} color={nutritionsSubTab === "ai" ? "white" : "#6B7280"}>
                  ✨ AI Picks
                </Text>
              </TouchableOpacity>
            </Div>

            {nutritionsSubTab === "all" ? (
              <>
                {/* Products with interleaved ads - 2 products then 1 ad */}
                {(() => {
                  const elements = [];
                  let productIndex = 0;
                  let adIndex = 0;
                  
                  while (productIndex < products.length || adIndex < productsAds.length) {
                    // Render 2 products
                    if (productIndex < products.length) {
                      elements.push(
                        <Div flexDir="row" flexWrap="wrap" style={{ marginHorizontal: -CARD_GAP / 2 }} mb={6} key={`products-row-${productIndex}`}>
                          {products.slice(productIndex, productIndex + 2).map((p) => (
                            <TouchableOpacity
                              key={p.id}
                              style={[styles.productCard, { width: CARD_WIDTH }]}
                              activeOpacity={0.8}
                              onPress={() =>
                                navigation.navigate("ProductDetailsScreen", { productId: p.id })
                              }
                            >
                              <Div mb={12}>
                                {p.imageUrl ? (
                                  <Image source={{ uri: p.imageUrl }} style={{ width: "100%", height: 120, borderRadius: 12 }} resizeMode="cover" />
                                ) : (
                                  <Image source={require("@/assets/images/no-image.png")} style={{ width: "100%", height: 120, borderRadius: 12 }} resizeMode="cover" />
                                )}
                              </Div>
                              <Text fontSize={"md"} fontFamily={fontHauoraBold} color="#222" mb={4}>{p.title}</Text>
                              <Text fontSize={"xs"} color="#9CA3AF" fontFamily={fontHauora} mb={8} style={{ flex: 1 }}>{p.description}</Text>
                              <Text fontSize={"md"} fontFamily={fontHauoraBold} color={colorPrimary}>{p.priceLabel}</Text>
                            </TouchableOpacity>
                          ))}
                        </Div>
                      );
                      productIndex += 2;
                    }
                    
                    // Render 1 ad after every 2 products
                    if (adIndex < productsAds.length && productIndex <= products.length) {
                      const ad = productsAds[adIndex];
                      console.log('🎯 Rendering product ad:', ad);
                      console.log('🖼️ Image URL:', ad.imageUrl || ad.image || ad.fileUrl);
                      elements.push(
                        <Div
                          key={`product-ad-${ad.id || adIndex}`}
                          rounded={24}
                          mb={10}
                          px={20}
                          py={16}
                          bg="#000000"
                          style={{ overflow: 'hidden' }}
                        >
                          {(ad.imageUrl || ad.image || ad.fileUrl) && (
                            <Image source={{ uri: ad.imageUrl || ad.image || ad.fileUrl }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, borderRadius: 24 }} resizeMode="cover" />
                          )}
                          <Div style={{ position: 'relative', zIndex: 1 }}>
                            <Text fontSize={"xs"} fontFamily={fontHauoraBold} color="#F9FAFB" style={{ textTransform: "uppercase", letterSpacing: 1.2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 }} mb={6}>Sponsored</Text>
                            <Text fontSize={"xl"} fontFamily={fontHauoraBold} color="#FFFFFF" mb={10} style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 4 }}>{ad.title}</Text>
                            <TouchableOpacity activeOpacity={0.85} onPress={() => ad.actionUrl && handleAdNavigation(ad.actionUrl)}>
                              <Div bg="#FFFFFF" px={18} py={10} rounded={16} alignSelf="flex-start">
                                <Text fontSize={"sm"} fontFamily={fontHauoraBold} color="#111827">{ad.actionLabel || "Shop Now"}</Text>
                              </Div>
                            </TouchableOpacity>
                          </Div>
                        </Div>
                      );
                      adIndex++;
                    }
                  }
                  
                  return elements;
                })()}
              </>
            ) : (
              <Div style={{ gap: 16 }} mb={8}>
                {aiPicksLoading ? (
                  <Div py={24} alignItems="center">
                    <ActivityIndicator size="small" color={colorPrimary} />
                    <Text fontSize="sm" fontFamily={fontHauora} color="#6B7280" mt={8}>Loading recommendations…</Text>
                  </Div>
                ) : null}
                {aiPicksError ? (
                  <Div py={12} px={16} mb={8} bg="#FEF2F2" rounded={16} borderWidth={1} borderColor="#FECACA">
                    <Text fontSize="sm" fontFamily={fontHauora} color="#991B1B">{aiPicksError}</Text>
                  </Div>
                ) : null}
                {aiPicksError ? (
                  <Div py={20} alignItems="center" px={4}>
                    <Text fontSize="sm" fontFamily={fontHauora} color="#EF4444" textAlign="center">
                      ⚠️ Could not load AI picks right now. Check your connection and try again.
                    </Text>
                  </Div>
                ) : !aiPicksLoading && aiPicksProducts.length === 0 ? (
                  <Div py={24} alignItems="center">
                    <Text fontSize="sm" fontFamily={fontHauora} color="#9CA3AF" textAlign="center">
                      No recommendations available right now.{"\n"}Please try again later.
                    </Text>
                  </Div>
                ) : null}
                {!aiPicksLoading
                  ? aiPicksProducts.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        activeOpacity={0.85}
                        onPress={() =>
                          navigation.navigate("ProductDetailsScreen", { productId: p.id })
                        }
                      >
                        <Div
                          bg="white"
                          rounded={16}
                          p={12}
                          flexDir="row"
                          style={{ gap: 16 }}
                          borderWidth={1}
                          borderColor="#f9fafb"
                        >
                          {p.imageUrl ? (
                            <Image source={{ uri: p.imageUrl }} style={{ width: 96, height: 96, borderRadius: 12 }} resizeMode="cover" />
                          ) : (
                            <Image source={require("@/assets/images/no-image.png")} style={{ width: 96, height: 96, borderRadius: 12 }} resizeMode="cover" />
                          )}
                          <Div flex={1}>
                            <Div flexDir="row" justifyContent="space-between" alignItems="flex-start">
                              <Text flex={1} mr={8} fontSize={"lg"} fontFamily={fontHauoraBold} color="#222">{p.title}</Text>
                              <TouchableOpacity style={styles.addBtn}>
                                <IconCirclePlus size={16} color={colorPrimary} strokeWidth={2} />
                              </TouchableOpacity>
                            </Div>
                            <Text fontSize={"md"} fontFamily={fontHauoraBold} color={colorPrimary} mt={4}>{p.priceLabel}</Text>
                            <Div flexDir="row" alignItems="center" mt={4} style={{ gap: 4 }}>
                              <IconShieldCheck size={14} color={colorPrimary} />
                              <Text fontSize={"xs"} fontFamily={fontHauoraBold} color={colorPrimary} style={{ textTransform: "uppercase" }}>{p.tag}</Text>
                            </Div>
                            <Text fontSize={"xs"} fontFamily={fontHauora} color="#9CA3AF" mt={8} fontStyle="italic" lineHeight={16}>{p.subtitle}</Text>
                          </Div>
                        </Div>
                      </TouchableOpacity>
                    ))
                  : null}
              </Div>
            )}

            <Div flexDir="row" alignItems="center" bg="#EFF6FF" borderWidth={1} borderColor="#BFDBFE" rounded={12} p={16} style={{ gap: 12 }} mb={24}>
              <IconShieldCheck size={20} color={colorPrimary} />
              <Text fontSize={"xs"} fontFamily={fontHauora} color="#1E40AF" lineHeight={16} flex={1}>
                All products are vet-approved and sourced from trusted suppliers.
              </Text>
            </Div>
          </>
        ) : null}
      </ScrollView>
    </Layout>
  );
};

export default HomeServicesScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  topTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  topTabActive: { borderBottomColor: colorPrimary },
  subTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  subTabActive: {
    backgroundColor: colorPrimary,
    borderColor: colorPrimary,
  },
  serviceCard: {
    width: "48%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 24,
    marginBottom: CARD_GAP,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 18,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  productCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 20,
    marginBottom: CARD_GAP,
    marginHorizontal: CARD_GAP / 2,
    flexDirection: "column",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f9fafb",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
});
