
import Layout from "@/components/app/Layout";
import OnboardingCongratsModal from "@/components/app/onboarding/OnboardingCongratsModal";
import { fontHauora, fontHauoraBold, fontHauoraMedium, fontHeading } from "@/constant/constant";
import { useNotificationStore } from "@/store/modules/notification";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { useCartStore } from "@/store/modules/cart";
import { IconArrowRight, IconBell, IconUser, IconShoppingCart } from "@tabler/icons-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Div, ScrollDiv, Text } from "react-native-magnus";

// Use the same illustration assets and paths as the GitHub project.
const smollHomeIllustration = require("../stitch-export/home-final/Illustrations/smol-home.png");
const smollVetIllustration = require("../stitch-export/home-final/Illustrations/smoll-vet.png");
const appointmentIllustration = require("../stitch-export/home-final/Illustrations/appointments.png");
const networkIllustration = require("../stitch-export/home-final/Illustrations/network.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Props {
  navigation: NavigationType;
  isNewUser?: boolean;
}

const HomeScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  const { user } = useUserStore();
  const { fetchNotifications, notifications } = useNotificationStore();
  const [showCongratsModal, setShowCongratsModal] = useState(false);

  useEffect(() => {
    fetchNotifications(1, 20);
  }, []);

  useEffect(() => {
    const isNewUser = (route?.params as Record<string, string>)?.isNewUser === "true";
    if (isNewUser) {
      setTimeout(() => setShowCongratsModal(true), 500);
    }
  }, [route?.params]);

  const displayName = user?.name ? user.name : "Jane";
  const displayFirstName = displayName.split(" ")[0] || "Jane";
  const hasNotifications = Boolean(notifications?.count && notifications.count > 0);
  const cartItemsCount = useCartStore((state) => state.items.filter((item) => item.type === "product").length);

  return (
    <>
      <Layout style={{ justifyContent: "flex-start" }} disableHeader>
        <Div flex={1} flexDir="column" pb={24}>

          {/* Header: logo + notifications/profile */}
          <Div
            flexDir="row"
            justifyContent="space-between"
            alignItems="center"
            pt={8}
            pb={6}
            mb={8}
          >
            <Div flexDir="row" alignItems="center" style={{ gap: 8 }}>
              <Image
                source={require("../assets/logo.png")}
                style={{ width: 100, height: 28, resizeMode: "contain" }}
              />
            </Div>
            <Div flexDir="row" alignItems="center" style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={() => props.navigation.navigate("NotificationScreen")}
                style={styles.iconButton}
              >
                <Div position="relative">
                  <IconBell size={30} color="#1a1a1a" strokeWidth={1.4} />
                  {hasNotifications && (
                    <Div
                      position="absolute"
                      top={-2}
                      right={-2}
                      w={6}
                      h={6}
                      rounded={100}
                      bg="#EF4444"
                      borderWidth={2}
                      borderColor="#fff"
                    />
                  )}
                </Div>
              </TouchableOpacity>
              
              {cartItemsCount > 1 && (
                <TouchableOpacity
                  onPress={() => props.navigation.navigate("YourCartScreen")}
                  style={styles.iconButton}
                >
                  <Div position="relative">
                    <IconShoppingCart size={30} color="#1a1a1a" strokeWidth={1.4} />
                    <Div
                      position="absolute"
                      top={-2}
                      right={-2}
                      w={6}
                      h={6}
                      rounded={100}
                      bg="#EF4444"
                      borderWidth={2}
                      borderColor="#fff"
                    />
                  </Div>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => props.navigation.navigate("SettingsMainScreen")}
                style={styles.iconButton}
              >
                <IconUser size={30} color="#1a1a1a" strokeWidth={1.4} />
              </TouchableOpacity>
            </Div>
          </Div>

          {/* Greeting */}
          <Div mb={32}>
            <Text fontSize={"5xl"} fontFamily={fontHeading} color="#111111" mb={4}>
              Hi, {displayFirstName}
            </Text>
            <Text fontSize={"lg"} fontFamily={fontHauora} color="#494949">
              How can we help you today?
            </Text>
          </Div>

          {/* smoll Home card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => props.navigation.navigate("HomeServicesScreen")}
            style={[styles.primaryCard, { flex: 1.1 }]}
          >
            <Div pt={4}>
              <Text fontSize={"4xl"} fontFamily={fontHauoraBold} color="#111827" mb={4}>
                smoll®Home
              </Text>
              <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#111111" lineHeight={24}>
                Book Home Visits
              </Text>
            </Div>
            <Image source={smollHomeIllustration} style={styles.primaryHomeImage} />
            <Div style={styles.primaryArrowWrap}>
              <IconArrowRight size={32} color="#111827" strokeWidth={2.5} />
            </Div>
          </TouchableOpacity>

          <Div h={14} />

          {/* smoll Vet card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => props.navigation.navigate("ExpertsListScreen")}
            style={[styles.primaryCard, { flex: 1.1 }]}
          >
            <Div pt={4}>
              <Text fontSize={"4xl"} fontFamily={fontHauoraBold} color="#111827" mb={4}>
                smoll®Vet
              </Text>
              <Text fontSize={"lg"} fontFamily={fontHauoraBold} color="#111111" lineHeight={24}>
                Consult over Video
              </Text>
            </Div>
            <Image source={smollVetIllustration} style={styles.primaryVetImage} />
            <Div style={styles.primaryArrowWrap}>
              <IconArrowRight size={32} color="#111827" strokeWidth={2.5} />
            </Div>
          </TouchableOpacity>

          <Div h={14} />

          {/* Secondary row: Appointment + Network */}
          <Div flexDir="row" style={{ gap: 14 }} flex={1}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => props.navigation.navigate("AppointmentsScreen")}
              style={[styles.secondaryCard, { flex: 1 }]}
            >
              <Image source={appointmentIllustration} style={styles.secondaryIconImage} />
              <Div>
                <Text fontSize={"xl"} fontFamily={fontHauoraBold} color="#111827" mb={2}>
                  Appointment
                </Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#111111" lineHeight={18}>
                  Your appointment Here
                </Text>
              </Div>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => props.navigation.navigate("ClinicListScreen")}
              style={[styles.secondaryCard, { flex: 1 }]}
            >
              <Image source={networkIllustration} style={styles.secondaryIconImage} />
              <Div>
                <Text fontSize={"xl"} fontFamily={fontHauoraBold} color="#111827" mb={2}>
                  Network
                </Text>
                <Text fontSize={"sm"} fontFamily={fontHauoraMedium} color="#111111" lineHeight={18}>
                  Our partners clinics
                </Text>
              </Div>
            </TouchableOpacity>
          </Div>

        </Div>

        <OnboardingCongratsModal
          isVisible={showCongratsModal}
          onSuccess={async () => setShowCongratsModal(false)}
        />
      </Layout>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryCard: {
    backgroundColor: "#FAF8F5",
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 0,
    paddingBottom: 0,
    minHeight: undefined,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  primaryHomeImage: {
    position: "absolute",
    right: -15,
    bottom: -10,
    width: "60%",
    height: "100%",
    resizeMode: "contain",
  },
  primaryVetImage: {
    position: "absolute",
    right: 20,
    bottom: -5,
    width: "40%",
    height: "105%",
    resizeMode: "contain",
  },
  primaryArrowWrap: {
    position: "absolute",
    left: 24,
    bottom: 20,
  },
  secondaryCard: {
    backgroundColor: "#FAF8F5",
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: undefined,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "visible",
    justifyContent: "center",
  },
  secondaryIconImage: {
    width: SCREEN_WIDTH < 350 ? 56 : 64,
    height: SCREEN_WIDTH < 350 ? 56 : 64,
    resizeMode: "contain",
    marginBottom: 8,
  },
});