import Layout from "@/components/app/Layout";
import ImageUpload from "@/components/partials/ImageUpload";
import {
  colorErrorText,
  colorPrimary,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { NavigationType } from "@/store/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { Button, Div, DropdownRef, Image, Tag, Text } from "react-native-magnus";
import ProfileOptionButton from "./ProfileOptionButton";
import AddButton from "@/components/partials/AddButton";
import { useRoute } from "@react-navigation/native";
import { usePetStore } from "@/store/modules/pet";
import { Benefit, HealthHistory, PetDetail } from "@/store/types/pet";
import { UploadedFile } from "@/store/types/file";
import { useToast } from "react-native-toast-notifications";
import { showMessage } from "react-native-flash-message";
import ConfirmationModal from "@/components/partials/ConfirmationModal";
import { IconCrown, IconDots } from "@tabler/icons-react-native";
import Dropdown from "@/components/partials/Dropdown";
import HealthHistoryModal from "@/components/app/pet/HealthHistoryModal";
import SubscriptionBenefitsList from "@/components/app/subscription/SubscribedBenefitsList";
import dayjs from "dayjs";
import { useUserStore } from "@/store/modules/user";

type RouteType = { petId: string; activeBenefitTab: boolean; backNavigation: string };

const PetProfileDetailsScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
    const { findUser } = useUserStore();
  const route = useRoute();
  const toast = useToast();
  const id = (route.params as RouteType)?.petId;
  const activeTabParam = (route.params as RouteType)?.activeBenefitTab;
  const {
    petsDetailMap,
    fetchPetDetails,
    updatePet,
    deleteHealthHistory,
    deletePet,
    cancelSubscription,
  } = usePetStore();
  // const [healthHistoryDataState, setHealthHistoryDataState] = useState<
  //   HealthHistory[] | null
  // >(null);

  const backNavigation = (route.params as RouteType)?.backNavigation;

  const optionMenuRef = useRef<DropdownRef>(null);
  const [profileImg, setProfileImg] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [deleteHealthHistoryLoading, setDeleteHealthHistoryLoading] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState("");
  const [showDeletePetModal, setShowDeletePetModal] = useState(false);
  const [deletePetLoading, setDeletePetLoading] = useState(false);

  const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);

  const petDetailsData = petsDetailMap.get(id);
  const healthHistoryDataState = petsDetailMap.get(id)?.healthHistory;

  const isCarePet = petDetailsData?.careId;

  const btns = useMemo(() => {
    const baseBtns = ["Basic Details", "Health History"];
    if (Boolean(isCarePet)) {
      return ["smoll® Care", ...baseBtns];
    }
    return baseBtns;
  }, [isCarePet]);

  const [activeTab, setActiveTab] = useState(btns[0]);

  useEffect(() => {
    setActiveTab(btns[0]);
  }, [btns]);

  const [open, setOpen] = useState(false);
  // const [selectedPetId, setSelectedPetId] = useState("");
  const [healthHistoryId, setHealthHistoryId] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const itemPositions = useRef<Record<string, number>>({});
  const [layoutReady, setLayoutReady] = useState(false);
  const layoutCount = useRef(0);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        await fetchPetDetails(id);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
const fetchUser = async () => {
  console.log("now call the me api-----------------------------------------------------")
   await findUser();
}
fetchUser();

  }, []);

  useEffect(() => {
    if (!petDetailsData) return;

    for (let i = 0; i < petDetailsData.photos.length; i++) {
      const image = petDetailsData.photos[i];
      if (image && image.url) {
        setProfileImg(image.url);
        break;
      }
    }
  }, [petDetailsData]);

  // useEffect(() => {
  //   if (petDetailsData && petDetailsData.healthHistory) {
  //     setHealthHistoryDataState(petDetailsData.healthHistory);
  //   }
  // }, []);

  const handleUpdateImage = async (file: UploadedFile[]) => {
    if (!petDetailsData) return;

    const filesArr = [...file, ...petDetailsData?.photos];

    try {
      setImageLoading(true);

      await updatePet(id, { photos: filesArr });

      toast.show("Pet Profile Image updated successfully");
    } finally {
      setImageLoading(false);
    }
  };

  const deleteHealthHistoryHandler = async () => {
    const historyId = showDeleteModal;
    // if (!healthHistoryDataState) return;
    try {
      setDeleteHealthHistoryLoading(historyId);
      await deleteHealthHistory(id, historyId);

      // const updatedHealthHistoryState = healthHistoryDataState.filter(
      //   (item) => item.id?.toString() !== historyId
      // );
      // console.log("updatedHealthHistoryState", updatedHealthHistoryState);
      // setHealthHistoryDataState(updatedHealthHistoryState);
    } finally {
      setDeleteHealthHistoryLoading("");
      setShowDeleteModal("");
    }
  };
  // deleteHealthHistoryHandler(`${item.id}`);

  function calculateAge(dateOfBirth: string): string {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years <= 0) return `${months} ${months === 1 ? "month" : "months"}`;
    return `${years} ${years === 1 ? "yr" : "yrs"} ${months > 0 ? `${months} ${months === 1 ? "month" : "months"}` : ""}`;
  }

  const petDetails = [
    {
      title: "Name",
      value: petDetailsData?.name,
      link: "PetEditInfoScreen",
      fileName: "name",
    },
    {
      title: "Age",
      value: petDetailsData?.dob ? calculateAge(petDetailsData?.dob) : 0,
      link: "PetEditInfoScreen",
      fileName: "dob",
    },
    {
      title: "Weight",
      value: petDetailsData?.weight ? `${petDetailsData?.weight} kg` : 0,
      link: "EditInfoScreen",
      heading: "Please enter pet's Weight",
      placeholder: "Weight",
      fieldKey: "weight",
      dataValue: petDetailsData?.weight,
    },
    {
      title: "Species",
      value: petDetailsData?.species,
      link: "PetEditInfoScreen",
      fileName: "species",
      editable: false,
    },
    {
      title: "Gender",
      value: petDetailsData?.gender,
      link: "PetEditInfoScreen",
      fileName: "gender",
    },
    {
      title: "Breed",
      value: petDetailsData?.breed,
      link: "PetEditInfoScreen",
      fileName: "breed",
    },
    {
      title: "Chip Number (Optional)",
      value: petDetailsData?.chipNumber,
      link: "EditInfoScreen",
      heading: "Please add Pet's Chip Number",
      placeholder: "Chip Number",
      fieldKey: "chipNumber",
      dataValue: petDetailsData?.chipNumber,
    },
    {
      title: "Spayed/Neutered",
      value: petDetailsData?.spayedOrNeutered ? "Yes" : "No",
      link: "PetEditInfoScreen",
      fileName: "spayed/neutered",
    },
    {
      title: "Any Pre-Existing Conditions",
      value: petDetailsData?.preExistingConditions,
      link: "EditInfoScreen",
      heading: "Any Pre-Existing Conditions",
      placeholder: "Pre-Existing Conditions",
      fieldKey: "preExistingConditions",
      dataValue: petDetailsData?.preExistingConditions,
    },
  ];

  const handleCancelSubscription = async (petId: string) => {
    try {
      setShowCancelSubscriptionModal(false);
      setLoading(true);

      await cancelSubscription(petId);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      await fetchPetDetails(petId);

      toast.show("Subscription canceled successfully", {
        placement: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuDropdownSelect = (value: string) => {
    setTimeout(() => {
      if (
        petDetailsData?.subscriptionDetails?.status === "Active" &&
        (value === "Delete Pet" || value === "Deceased")
      ) {
        showMessage({
          message: "Please cancel your subscription before making changes.",
          type: "danger",
        });
        return;
      }

      if (value === "Delete Pet") {
        setShowDeletePetModal(true);
      }

      if (value === "Deceased") {
        handleUpdateDeceased();
      }
      if (value === "cancelSubscription") {
        setShowCancelSubscriptionModal(true);
      }
    }, 500);
  };

  const handleUpdateDeceased = async () => {
    if (!petDetailsData) return;
    try {
      const updatedValue = petDetailsData?.isDeceased ? false : true;
      await updatePet(id, { isDeceased: updatedValue });
    } finally {
      setDeletePetLoading(false);
    }
  };

  const handleDeletePet = async () => {
    try {
      setDeletePetLoading(true);
      await deletePet(id);

      navigation.navigate("PetProfileListScreen");
    } finally {
      setDeletePetLoading(false);
    }
  };

  const handleTabPress = (item: string) => {
    setActiveTab(item);
    const x = itemPositions.current[item];
    if (x !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ x: x - 16, animated: true });
    }
  };

  useEffect(() => {
    if (activeTabParam && layoutReady) {
      handleTabPress("smoll® Care");
    }
  }, [activeTabParam, layoutReady]);

  return (
    <Layout
      showBack
      title="Profile"
      onBackPress={() => {
        if (backNavigation) {
          navigation.navigate(backNavigation);
        } else {
          navigation.goBack();
        }
      }}
    >
      {!loading && (
        <Div flex={1}>
          <Div flexDir="row" alignItems="center" mb={35}>
            <Div w={118} h={115} justifyContent="center" alignItems="flex-end">
              <Div mx={"auto"}>
                <ImageUpload
                  h={92}
                  w={93}
                  editIcon
                  rounded={100}
                  uri={profileImg}
                  hideUnselectBtn
                  openImageOnTab
                  onChange={handleUpdateImage}
                  disableDownload
                  mediaType="Images"
                  docType="image/"
                />
              </Div>
            </Div>
            <Div ml={14}>
              <Div>
                <Text fontSize={"4xl"} fontFamily={fontHauoraMedium}>
                  {petDetailsData?.name}
                </Text>
                {petDetailsData?.careId && (
                  <Text fontSize={"lg"} mt={4} fontFamily={fontHauoraMedium} color="#494949">
                    PetId: {petDetailsData?.careId}
                  </Text>
                )}
              </Div>

              {petDetailsData?.isDeceased && (
                <Tag fontSize={"md"} mt={8} p={0} bg={colorErrorText} color="#fff">
                  Deceased
                </Tag>
              )}
            </Div>
          </Div>

          <Div flexDir="row" position="relative" mb={20}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
            >
              {btns.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.6}
                  style={{ marginRight: 20 }}
                  onPress={() => handleTabPress(item)}
                  onLayout={(event) => {
                    itemPositions.current[item] = event.nativeEvent.layout.x;
                    layoutCount.current += 1;

                    if (layoutCount.current === btns.length) {
                      setLayoutReady(true);
                    }
                  }}
                >
                  <Button py={0} flexDir="column" px={4} bg="transparent" pointerEvents="none">
                    <Text
                      fontSize="lg"
                      fontFamily={fontHauoraSemiBold}
                      mb={8}
                      color={activeTab === item ? "#222" : "darkGreyText"}
                    >
                      {item}
                    </Text>

                    {item === activeTab && (
                      <Div
                        h={7}
                        bg="primary"
                        w="100%"
                        style={{
                          borderTopRightRadius: 4,
                          borderTopLeftRadius: 4,
                        }}
                      />
                    )}
                  </Button>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              activeOpacity={0.6}
              onPress={() => {
                console.log(petDetailsData);
                if ("current" in optionMenuRef && optionMenuRef.current) {
                  optionMenuRef.current.open();
                }
              }}
            >
              <IconDots style={{ marginLeft: 12 }} width={26} height={26} color={"#222"} />
            </TouchableOpacity>

            <Dropdown
              ref={optionMenuRef}
              onSelect={handleMenuDropdownSelect}
              showCancelSubscription={petDetailsData?.subscriptionDetails?.status === "Active"}
              isDeceased={petDetailsData?.isDeceased ?? false}
            />

            <Div
              borderBottomWidth={1}
              borderBottomColor="#D0D7DC"
              h={4}
              w={"200%"}
              position="absolute"
              bottom={0}
              left={-100}
            />
          </Div>

          {activeTab === "Basic Details" && (
            <>
              {!petDetailsData?.isDeceased && !isCarePet && (
                <Div
                  style={{
                    padding: 16,
                    borderWidth: 2,
                    borderColor: "#6e99f0",
                    flexDirection: "row",
                    marginBottom: 16,
                    alignItems: "center",
                  }}
                  rounded={20}
                >
                  <Text
                    maxW={146}
                    w={"100%"}
                    fontSize={"lg"}
                    color="#545454"
                    fontFamily={fontHauoraSemiBold}
                  >
                    {`${petDetailsData?.name.charAt(0).toLocaleUpperCase()}${petDetailsData?.name.slice(1)} isn't enrolled in the plan`}
                  </Text>

                  <Button
                    bg="#6e99f0"
                    rounded={100}
                    h={42}
                    pt={13}
                    pb={13}
                    lineHeight={18}
                    w={134}
                    ml={"auto"}
                    alignSelf="center"
                    fontFamily={fontHauoraMedium}
                    onPress={() => {
                      if (isCarePet) {
                        handleTabPress("smoll® Care");
                      } else {
                        navigation.navigate("PetProfileBenefitsScreen", {
                          petId: petDetailsData?.id,
                        });
                      }
                    }}
                  >
                    Enroll
                  </Button>
                </Div>
              )}
              <FlatList
                data={petDetails}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ProfileOptionButton
                    title={item.title}
                    value={item.value}
                    editable={typeof item.editable === "boolean" ? item.editable : true}
                    onEdit={() => {
                      if (item.fileName) {
                        navigation.navigate(item.link, {
                          petId: id,
                          fileName: item.fileName,
                        });
                      }

                      if (item.heading) {
                        navigation.navigate(item.link, {
                          heading: item.heading,
                          placeholder: item.placeholder,
                          fieldKey: item.fieldKey,
                          value: `${item.dataValue || ""}`,
                          petId: id,
                        });
                      }
                    }}
                  />
                )}
                keyExtractor={(item, i) => `${i}`}
              />
            </>
          )}

          {activeTab === "Health History" && (
            <Div>
              {healthHistoryDataState && healthHistoryDataState.length > 0 && (
                <FlatList
                  style={{ marginBottom: 32 }}
                  data={healthHistoryDataState}
                  renderItem={({ item, index }) => (
                    <HealthHistoryCard
                      onOpen={() => {
                        if (!petDetailsData) return;

                        setOpen(true);
                        // setSelectedPetId(id || "");
                        setHealthHistoryId(item.id || "");

                        // navigation.navigate("PetProfileMedicalHistoryScreen", {
                        //   navigateTo: "PetProfileDetailsScreen",
                        //   petId: id ?? "",
                        //   petName: petDetailsData.name,
                        //   petBg: petDetailsData.photos[0]?.url,
                        //   showBackBtn: "true",
                        //   historyId: item.id,
                        // });
                      }}
                      isLoading={item.id?.toString() === deleteHealthHistoryLoading}
                      name={item.name}
                      onDelete={() => setShowDeleteModal(`${item.id}`)}
                      mb={index + 1 === healthHistoryDataState.length ? 0 : 12}
                    />
                  )}
                  keyExtractor={(item, index) => `${index}`}
                />
              )}

              <AddButton
                text="Add New Record"
                onPress={() => {
                  if (!petDetailsData) return;
                  setOpen(true);

                  // setHealthHistoryId(item.id || "");

                  // navigation.navigate("PetProfileMedicalHistoryScreen", {
                  //   navigateTo: "PetProfileDetailsScreen",
                  //   petId: id ?? "",
                  //   petName: petDetailsData.name,
                  //   petBg: petDetailsData.photos[0]?.url,
                  //   showBackBtn: "true",
                  // });
                }}
              />

              <HealthHistoryModal
                open={open}
                onClose={() => {
                  setOpen(false);
                  // setSelectedPetId("");
                  setHealthHistoryId("");
                }}
                petId={id}
                healthHistoryId={healthHistoryId}
              />
            </Div>
          )}
          {activeTab === "smoll® Care" && (
            <>
              <SubscriptionBenefitsList
                planFeatures={petDetailsData?.benefits as Benefit[]}
                isExpandable={true}
              />

              <Div py={16} bg="#FAF8F5" px={4}>
                <Div>
                  <Text color="primary" fontSize="lg" fontFamily={fontHauoraBold}>
                    {petDetailsData?.name} smoll® Care plan is active until
                  </Text>
                  <Text color="#333" fontSize="xl" fontFamily={fontHauoraBold}>
                    {dayjs(petDetailsData?.subscriptionDetails?.endDate).format("DD MMM YYYY")}
                  </Text>
                </Div>
                {petDetailsData?.subscriptionDetails?.status === "Canceled" && (
                  <Text mt={4} fontSize={"md"} color="#494949" fontFamily={fontHauoraBold}>
                    Your subscription will not auto-renew as you have canceled the subscription.
                  </Text>
                )}
              </Div>
            </>
          )}
        </Div>
      )}

      <ConfirmationModal
        heading="Delete Health History"
        text="Are you sure you want to delete this health history?"
        isLoading={deleteHealthHistoryLoading === showDeleteModal}
        showModal={showDeleteModal ? true : false}
        onClose={() => setShowDeleteModal("")}
        onConfirm={deleteHealthHistoryHandler}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmBgColor={colorErrorText}
      />

      <ConfirmationModal
        heading="Delete Pet"
        text="Are you sure you want to delete this pet? Deleting it will remove all the data associated with it, even your bookings."
        isLoading={deletePetLoading}
        height={365}
        showModal={showDeletePetModal}
        onClose={() => setShowDeletePetModal(false)}
        onConfirm={handleDeletePet}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmBgColor={colorErrorText}
      />

      <ConfirmationModal
        heading="Cancel Subscription"
        height={365}
        text="Are you sure you want to cancel your subscription? You'll retain full access until your plan ends. It won't renew automatically."
        showModal={showCancelSubscriptionModal ? true : false}
        onClose={() => setShowCancelSubscriptionModal(false)}
        onConfirm={() => handleCancelSubscription(id)}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmBgColor={colorErrorText}
      />

      {loading && (
        <Div flex={1} justifyContent="center">
          <ActivityIndicator size="large" color={colorPrimary} />
        </Div>
      )}
    </Layout>
  );
};

export default PetProfileDetailsScreen;

const HealthHistoryCard: React.FC<{
  mb?: number;
  onDelete: () => void;
  name: string;
  isLoading: boolean;
  onOpen: () => void;
}> = ({ mb, onDelete, name, isLoading, onOpen }) => {
  return (
    <Div
      flexDir="row"
      justifyContent="space-between"
      py={12}
      borderBottomWidth={1}
      borderColor="#E0E0E0"
      mb={typeof mb === "number" ? mb : 0}
    >
      <TouchableOpacity style={{ flex: 1 }} onPress={onOpen}>
        <Text fontSize={"sm"} fontFamily={fontHauoraMedium}>
          Title
        </Text>
        <Text fontSize={"xl"} fontFamily={fontHauoraMedium}>
          {name}
        </Text>
      </TouchableOpacity>

      <Button
        p={0}
        bg="transparent"
        color="#f10"
        alignSelf="center"
        onPress={onDelete}
        pr={isLoading ? 10 : 0}
        loading={isLoading}
        loaderColor="#222"
      >
        Delete
      </Button>
    </Div>
  );
};
