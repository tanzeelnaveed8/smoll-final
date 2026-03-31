import Layout from "@/components/app/Layout";
import ImageUpload from "@/components/partials/ImageUpload";
import StarRating from "@/components/partials/StarRating";
import {
  colorPrimary,
  fontHauora,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { usePartnerStore } from "@/store/modules/partner";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { IconCircleCheck, IconPhone } from "@tabler/icons-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, TouchableOpacity } from "react-native";
import { Div, Image, ScrollDiv, Text } from "react-native-magnus";

const TimeTab: React.FC<{ heading: string; time: string; mb?: number }> = ({
  heading,
  time,
  mb,
}) => {
  return (
    <Div flexDir="row" alignItems="center" mb={mb || 0}>
      <Div px={8} py={6} bg="#F4F6F8" rounded={12} mr={8}>
        <Text fontSize={"md"} mb={-1} fontFamily={fontHauoraSemiBold} lineHeight={14}>
          {heading}
        </Text>
      </Div>
      <Text fontSize={"md"} fontFamily={fontHauoraSemiBold} lineHeight={24} color="primary">
        {time}
      </Text>
    </Div>
  );
};

const ClinicDetailScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { id } = route.params as { id: string };
  const { clinicDetails, fetchClinicDetails } = usePartnerStore();

  const [isLoading, setIsLoading] = useState(true);

  const data = useMemo(() => clinicDetails.get(id), [id, clinicDetails]);

  useEffect(() => {
    if (data) {
      setIsLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchClinicDetails(id);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const openingHours =
    data?.openingHours && (JSON.parse(data?.openingHours) as { from: string; to: string });

  return (
    <Layout
      showBack
      title="Clinic Details"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      {isLoading && (
        <Div flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size={"large"} color={colorPrimary} />
        </Div>
      )}
      {!isLoading && data && (
        <Div flex={1} pt={24}>
          <ScrollDiv showsVerticalScrollIndicator={false}>
            <Div flexDir="row" alignItems="center" style={{ gap: 12 }} mb={16}>
              {data?.clinicImg?.url ? (
                <Image src={data.clinicImg.url} w={100} h={100} rounded={100} />
              ) : (
                <Image
                  source={require("@/assets/images/no-image.png")}
                  w={100}
                  h={100}
                  rounded={100}
                />
              )}

              <Div>
                <Text fontSize={"xl"} fontFamily={fontHauoraBold} lineHeight={24} mb={4}>
                  {data?.name}
                </Text>

                <Div flexDir="row" alignItems="center">
                  <Image
                    source={require("@/assets/images/uae-icon.png")}
                    w={20}
                    h={20}
                    rounded={20}
                    mr={8}
                  />
                  <Text fontSize={"md"} fontFamily={fontHauoraBold} lineHeight={20} color="#494949">
                    {data?.country}
                  </Text>
                </Div>
              </Div>
            </Div>

            <Div mb={16}>
              <TimeTab
                heading={"Opening Hours:"}
                time={openingHours ? `${openingHours.from} - ${openingHours.to}` : "-"}
                mb={2}
              />
            </Div>

            {data.specialities.length > 0 && (
              <Div flexDir="row" flexWrap="wrap" style={{ gap: 8 }} mb={16}>
                {data.specialities.map((item, i) => (
                  <Div key={i} px={8} py={6} rounded={32} borderWidth={1.2} borderColor="#222">
                    <Text fontSize={"md"} fontFamily={fontHauoraSemiBold} lineHeight={20}>
                      {item.name}
                    </Text>
                  </Div>
                ))}
              </Div>
            )}

            {data?.imgCollections?.length > 0 && (
              <Div mb={16}>
                <Text fontSize={"sm"} fontFamily={fontHauora} mb={8} color="#494949">
                  Inside clinic
                </Text>

                <FlatList
                  data={data?.imgCollections}
                  renderItem={({ item, index }) => (
                    <Div pr={index + 1 === data?.imgCollections?.length ? 0 : 8}>
                      {/* <Image source={item.url} w={120} h={100} rounded={8} /> */}
                      <ImageUpload
                        h={120}
                        w={120}
                        rounded={8}
                        uri={item.url}
                        hideUnselectBtn
                        openImageOnTab
                        disableDownload
                        docType="image/"
                        // onChange={handleUpdateImage}
                      />
                    </Div>
                  )}
                  // keyExtractor={({ item, index }) => `${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </Div>
            )}

            <Div pb={24} borderBottomWidth={1} borderBottomColor="#D0D7DC" mb={24}>
              <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} lineHeight={24} mb={4}>
                Address - {data.name}
              </Text>

              <Text
                fontSize={"lg"}
                fontFamily={fontHauoraMedium}
                lineHeight={24}
                mb={14}
                color="#494949"
              >
                {data.address}
              </Text>
              {data.phone && (
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL(`tel:${data.phone}`);
                  }}
                >
                  <Div flexDir="row" alignItems="center">
                    <IconPhone width={24} height={24} color={"#679FF0"} strokeWidth={1.5} />
                    <Text
                      fontSize={"lg"}
                      fontFamily={fontHauoraMedium}
                      lineHeight={24}
                      color="primary"
                      ml={4}
                    >
                      {data.phone}
                    </Text>
                  </Div>
                </TouchableOpacity>
              )}
            </Div>

            <Div>
              <Text fontSize={"sm"} fontFamily={fontHauoraSemiBold} color="#494949" mb={24}>
                Veterinarian
              </Text>

              {data.vets.map((item, i) => (
                <Div
                  key={i}
                  pb={16}
                  mb={16}
                  borderBottomWidth={1}
                  borderColor="#D0D7DC"
                  flexDir="row"
                >
                  {item?.profileImg?.url ? (
                    <Image src={item?.profileImg?.url} w={32} h={32} rounded={32} mr={16} />
                  ) : (
                    <Image
                      source={require("@/assets/images/no-image.png")}
                      w={32}
                      h={32}
                      rounded={32}
                      mr={16}
                    />
                  )}
                  <Div>
                    <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} lineHeight={24} mb={4}>
                      {item.name}
                    </Text>
                    <Text
                      fontSize={"md"}
                      fontFamily={fontHauoraMedium}
                      lineHeight={20}
                      color="#494949"
                      mb={4}
                    >
                      {item.designation}
                    </Text>
                    <Text
                      fontSize={"md"}
                      fontFamily={fontHauoraMedium}
                      lineHeight={20}
                      color="#494949"
                      mb={12}
                    >
                      {item.yearsOfExperience} yrs of experience
                    </Text>
                    <Div flexDir="row" alignItems="center">
                      <Div p={2}>
                        <IconCircleCheck size={12} color={"#2F6E20"} strokeWidth={1.5} />
                      </Div>
                      <Text fontSize={"sm"} fontFamily={fontHauoraMedium} lineHeight={16}>
                        Verified
                      </Text>
                    </Div>
                  </Div>
                </Div>
              ))}
            </Div>
          </ScrollDiv>
        </Div>
      )}
    </Layout>
  );
};

export default ClinicDetailScreen;
