import { useUserStore } from "@/store/modules/user";
import { useUserInfoStore } from "@/store/modules/userInfo";
import { NavigationType } from "@/store/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Div, Image } from "react-native-magnus";

const SplashScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { findUser } = useUserStore();
  const { loadUserInfo } = useUserInfoStore();

  useEffect(() => {
    const getStoredToken = async () => {
      const storedToken = await AsyncStorage.getItem("accessToken");

      if (storedToken) {
        try {
          // Load userInfo from AsyncStorage
          await loadUserInfo();
          // Load user data from API
          await findUser(true);
          
          navigation.navigate("HomeScreen");
        } catch (error) {
          setTimeout(() => {
            navigation.navigate("NewOnboardingScreen"); // latest
            // navigation.navigate("CasesQuotesListScreen");
          }, 1000);
        }
      } else {
        setTimeout(() => {
          navigation.navigate("NewOnboardingScreen"); // latest
          // navigation.navigate("CasesQuotesListScreen");
        }, 1000);
      }
    };

    getStoredToken();
  }, []);

  return (
    <Div bg="#FAF8F5" flex={1} justifyContent="center" alignItems="center">
      <Image source={require("../assets/logo.png")} w={220} h={60} />
    </Div>
  );
};

export default SplashScreen;
