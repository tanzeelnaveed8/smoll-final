import Layout from "@/components/app/Layout";
import DoctorListCard from "@/components/partials/DoctorListCard";
import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
import { usePartnerStore } from "@/store/modules/partner";
import { NavigationType } from "@/store/types";
import { useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { Text } from "react-native-magnus";

const PartnerVetScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { partnerVets, fetchPartnerVets } = usePartnerStore();

  const bookingId = (route.params as Record<string, string>)?.bookingId;
  const caseId = (route.params as Record<string, string>)?.caseId;
  const partnerId = (route.params as Record<string, string>)?.partnerId;
  const partnerName = (route.params as Record<string, string>)?.partnerName;
  const selectedServices = (
    route.params as {
      selectedServices: { id: string; label: string; price: number }[];
    }
  )?.selectedServices;
  const backTo = (route.params as Record<string, string>)?.backTo;
  const isReschedule = (route.params as Record<string, boolean>)?.isReschedule;

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const vets = useMemo(() => partnerVets.get(partnerId), [partnerVets, partnerId]);

  useEffect(() => {
    handleFetchRequests();
  }, [partnerId]);

  const handleFetchRequests = async (isRefreshing?: boolean) => {
    try {
      if (isRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      if (!vets || isRefreshing) {
        await fetchPartnerVets(partnerId);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  return (
    <Layout
      showBack
      title={partnerName}
      onBackPress={() => {
        if (backTo) {
          navigation.navigate(backTo);
        } else {
          navigation.goBack();
        }
      }}
      loading={isLoading}
    >
      <FlatList
        data={vets ?? []}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            tintColor={colorPrimary}
            onRefresh={() => handleFetchRequests(true)}
          />
        }
        ListHeaderComponent={
          <Text fontSize="xl" fontFamily={fontHauoraSemiBold} lineHeight={24} mb={16}>
            Find your Doctor
          </Text>
        }
        renderItem={({ item, index }) => (
          <DoctorListCard
            mb={index + 1 === vets?.length ? 0 : 20}
            name={item.name}
            speciality={item.designation}
            experience={item.yearsOfExperience ?? 0}
            image={item.profileImg?.url}
            verified
            nextAvailable=""
            about={item?.about}
            onCheckAvailability={() => {
              navigation.navigate("PartnerVetDetailScreen", {
                bookingId,
                vetId: item.id,
                partnerId: partnerId,
                partnerName,
                caseId,
                selectedServices,
                isReschedule,
              });
            }}
          />
        )}
        keyExtractor={(item, i) => `${i}`}
      />
    </Layout>
  );
};

export default PartnerVetScreen;
