import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { colorPrimary, fontHauoraBold, fontHauoraSemiBold } from "@/constant/constant";
import { useCaseStore } from "@/store/modules/case";
import { NavigationType } from "@/store/types";
import { CaseDetail, CaseStatusEnum } from "@/store/types/case.d";
import { getCaseStatusColor, getCaseStatusLabel } from "@/utils/helpers";
import { useRoute } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { Badge, Div, Image, ScrollDiv, Tag, Text } from "react-native-magnus";

const CaseDetailScreen: React.FC<{
  navigation: NavigationType;
}> = ({ navigation }) => {
  const route = useRoute();

  const { caseId } = route.params as Record<string, string>;
  const { fetchCase } = useCaseStore();

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);

  useEffect(() => {
    fetchCaseDetail();
  }, []);

  const fetchCaseDetail = async (isRefresh?: boolean) => {
    try {
      if (isRefresh) {
        setIsRefresh(true);
      } else {
        setIsLoading(true);
      }

      const caseDetail = await fetchCase(caseId);

      setCaseDetail(caseDetail);
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
    }
  };

  return (
    <Layout
      showBack
      title="Case Detail"
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={isLoading}
    >
      <ScrollDiv
        flex={1}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={() => fetchCaseDetail(true)}
            tintColor={colorPrimary}
          />
        }
      >
        <Text fontFamily={fontHauoraBold} fontSize="xl" lineHeight={24} mb={24}>
          Basic Details
        </Text>

        <ReadonlyItem
          field="Status"
          value={
            <Tag
              mt={4}
              bg={
                getCaseStatusColor(
                  caseDetail?.status,
                  caseDetail?.scheduleAt,
                  caseDetail?.isEmergency
                ) ?? ""
              }
            >
              <Text textTransform="capitalize" color="#fff">
                {getCaseStatusLabel(
                  caseDetail?.status,
                  caseDetail?.scheduleAt,
                  caseDetail?.isEmergency,
                  caseDetail?.isDirectEscalated
                ) ?? ""}
              </Text>
            </Tag>
          }
          mb={12}
        />

        <ReadonlyItem field="Description" value={caseDetail?.description ?? ""} mb={16} />

        {caseDetail?.scheduleAt && (
          <ReadonlyItem
            field="Scheduled At"
            value={dayjs(caseDetail?.scheduleAt).format("HH:mm A, DD MMM YYYY")}
            mb={12}
          />
        )}

        <ReadonlyItem
          borderWidth={3}
          field="Created At"
          value={dayjs(caseDetail?.createdAt).format("DD MMM YYYY")}
          mb={12}
          pb={28}
        />

        <Text fontFamily={fontHauoraBold} fontSize="xl" lineHeight={24} mb={24} mt={26}>
          Expert Details
        </Text>

        <ReadonlyItem
          field="Name"
          value={
            <Div row>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
                {caseDetail?.assignedVet?.name}
              </Text>

              <Image
                source={{
                  uri:
                    caseDetail?.assignedVet?.profileImg?.url ?? "https://via.placeholder.com/150",
                }}
                w={50}
                h={50}
                rounded={100}
                right={0}
                top={-25}
                position="absolute"
                bg="#eeeeee"
                ml="auto"
              />
            </Div>
          }
          mb={12}
        />

        <ReadonlyItem
          field="Designation"
          value={caseDetail?.assignedVet?.designation ?? ""}
          mb={12}
        />

        <ReadonlyItem
          borderWidth={3}
          field="Note"
          value={caseDetail?.vetNote ?? "-"}
          mb={12}
          pb={26}
        />

        <Text fontFamily={fontHauoraBold} fontSize="xl" lineHeight={24} mb={24} mt={26}>
          Pet Details
        </Text>

        <ReadonlyItem
          field="Name"
          value={
            <Div row>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
                {caseDetail?.pet?.name}
              </Text>

              <Image
                source={{ uri: caseDetail?.pet?.photos[0]?.url }}
                w={50}
                h={50}
                rounded={100}
                right={0}
                top={-25}
                position="absolute"
                bg="#eeeeee"
                ml="auto"
              />
            </Div>
          }
          mb={12}
        />
        <ReadonlyItem field="Age" value={caseDetail?.pet?.age.toString() ?? ""} mb={12} />
        <ReadonlyItem
          field="Weight"
          value={caseDetail?.pet?.weight?.toString() + " Kg" ?? ""}
          mb={12}
        />
        <ReadonlyItem field="Breed" value={caseDetail?.pet?.breed ?? ""} mb={32} />
      </ScrollDiv>

      <ButtonPrimary onPress={() => navigation.goBack()}>Go Back</ButtonPrimary>
    </Layout>
  );
};

const ReadonlyItem = ({
  field,
  value,
  mb,
  borderWidth,
  pb,
}: {
  field: string;
  value: string | React.ReactNode;
  mb?: number;
  borderWidth?: number;
  pb?: number;
}) => {
  return (
    <Div pb={pb || 16} borderBottomWidth={borderWidth || 0} borderColor="#E0E0E0" mb={mb ? mb : 0}>
      <Text
        fontFamily={fontHauoraBold}
        fontSize={"xl"}
        // lineHeight={16}
        color="darkGreyText"
      >
        {field}
      </Text>

      {typeof value === "string" ? (
        <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
          {value}
        </Text>
      ) : (
        value
      )}
    </Div>
  );
};

export default CaseDetailScreen;
