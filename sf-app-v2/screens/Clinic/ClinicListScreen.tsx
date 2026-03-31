import Layout from "@/components/app/Layout";
import InputField from "@/components/partials/InputField";
import SelectInput from "@/components/partials/SelectInput";
import { colorPrimary, fontHauoraBold, fontHeading } from "@/constant/constant";
import { usePartnerStore } from "@/store/modules/partner";
import { NavigationType } from "@/store/types";
import { uaeCities } from "@/utils/country-codes";
import { getCurrentLocation } from "@/utils/location";
import {
  IconChevronRight,
  IconCurrentLocation,
  IconPhoto,
  IconX,
} from "@tabler/icons-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { FlatList } from "react-native-bidirectional-infinite-scroll";
import { Avatar, Div, Image, Text, WINDOW_HEIGHT } from "react-native-magnus";

const ClinicListScreen = ({ navigation }: { navigation: NavigationType }) => {
  const { clinics, fetchClinics } = usePartnerStore();
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState<{ label: string; value: string } | null>();
  const [renderKey, setRenderKey] = useState(0);
  const [search, setSearch] = useState<string>();
  const [locationLoading, setLocationLoading] = useState(false);

  const isMounted = useRef(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchClinics(search, city?.value);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setSearch("");
    setCity(null);
    setLoading(true);
    setRenderKey((prev) => prev + 1);
    try {
      await fetchClinics("", "");
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { city: currentCity } = await getCurrentLocation();

      // Find the matching state in uaeCities
      // here I found that state field is capturing the all emirates
      const matchingCity = uaeCities.find(
        (cityOption) =>
          cityOption.state.toLowerCase().includes(currentCity.toLowerCase()) ||
          currentCity.toLowerCase().includes(cityOption.state.toLowerCase())
      );

      if (matchingCity) {
        setCity(matchingCity);
        setRenderKey((prev) => prev + 1);
      } else {
        Alert.alert(
          "Location Not Found",
          `We couldn't find "${currentCity}" in our supported cities. Please select a city manually.`
        );
      }
    } catch (error) {
      Alert.alert(
        "Location Error",
        error instanceof Error
          ? error.message
          : "Unable to get your current location. Please try again."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [city]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const delay = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <Layout showBack onBackPress={() => navigation.goBack()} title="Partner Clinics">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Div flex={1} style={{ gap: 28 }}>
          <Text fontSize={"5xl"} fontFamily={fontHeading}>
            Locate the nearest partner near you
          </Text>
          <Div flexDir="row" alignItems="center">
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleGetCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size={32} color="#222" style={{ marginRight: 12 }} />
              ) : (
                <IconCurrentLocation
                  size={32}
                  color={"#222"}
                  strokeWidth={1.2}
                  style={{ marginRight: 12 }}
                />
              )}
            </TouchableOpacity>

            <SelectInput
              label="Select city"
              options={uaeCities as any}
              onSelect={(val) => {
                setCity(val);
              }}
              selectedValue={city as any}
              key={renderKey}
              mainInputStyle={{
                borderRadius: 40,
                width: "97%",
                height: 34,
                paddingVertical: 1,
                borderWidth: 1.2,
                fontSize: 16,
              }}
              style={{
                flex: 1,
              }}
            />

            <InputField
              placeholder="Search"
              maxLength={20}
              disabled={loading}
              inputStyle={{
                marginLeft: 4,
                borderRadius: 40,
                height: 34,
                paddingVertical: 1,
                borderWidth: 1.2,
                fontSize: 16,
                width: "97%",
              }}
              value={search}
              containerStyle={{
                flex: 1,
              }}
              returnKeyType="done"
              onChangeText={(search) => setSearch(search)}
              onSubmitEditing={Keyboard.dismiss}
            />

            {(search || city) && (
              <TouchableOpacity
                onPress={clearFilters}
                disabled={loading}
                style={{
                  marginLeft: 8,
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: "#f0f0f0",
                }}
                activeOpacity={0.7}
              >
                <IconX size={24} color={"#666"} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </Div>
          {!loading && (
            <FlatList
              data={clinics}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  key={item.id}
                  onPress={() => {
                    navigation.navigate("ClinicDetailScreen", {
                      id: item.id,
                    });
                  }}
                >
                  <Div
                    flexDir="row"
                    style={{ gap: 16 }}
                    borderWidth={1}
                    p={14}
                    mb={20}
                    alignItems="center"
                    rounded={24}
                  >
                    {item.clinicImg?.url ? (
                      <Image
                        alignSelf="flex-start"
                        source={{ uri: item.clinicImg?.url ?? "" }}
                        w={54}
                        h={54}
                        rounded={32}
                      />
                    ) : (
                      <Avatar bg="gray200" size={54} rounded={32}>
                        <IconPhoto size={24} color={"#222"} />
                      </Avatar>
                    )}
                    <Div flex={1}>
                      <Text fontSize={"xl"} fontFamily={fontHauoraBold} lineHeight={24}>
                        {item.name}
                      </Text>
                      {item.city ? (
                        <Div flexDir="row" alignItems="center">
                          <Text
                            fontSize={"md"}
                            lineHeight={17}
                            textAlignVertical="center"
                            fontFamily={fontHauoraBold}
                            color="#494949"
                          >
                            {item.city}
                          </Text>
                        </Div>
                      ) : (
                        <></>
                      )}
                    </Div>
                    <IconChevronRight size={24} color={"#222"} />
                  </Div>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `${index}`}
              onEndReached={async () => {}}
              onStartReached={async () => {}}
              ListEmptyComponent={
                <Text mt="xl" textAlign="center">
                  No clinics found.
                </Text>
              }
            />
          )}

          {loading && (
            <Div flex={1} justifyContent="center" minH={WINDOW_HEIGHT / 1.4}>
              <ActivityIndicator size="large" color={colorPrimary} style={{ marginTop: -80 }} />
            </Div>
          )}
        </Div>
      </TouchableWithoutFeedback>
    </Layout>
  );
};

export default ClinicListScreen;
