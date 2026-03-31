import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import {
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeading,
} from "@/constant/constant";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Div, ScrollDiv, Text } from "react-native-magnus";
import { NavigationType } from "@/store/types";
import { UploadedFile } from "@/store/types/file";
import SelectInput from "@/components/partials/SelectInput";
import { useCaseStore } from "@/store/modules/case";
import { usePetStore } from "@/store/modules/pet";
import { useExpertStore } from "@/store/modules/expert";
import { useRoute } from "@react-navigation/native";
import ImageUpload from "@/components/partials/ImageUpload";
import TextAreaField from "@/components/partials/TextAreaField";
import { CaseStatusEnum, CreateCasePayloadDto } from "@/store/types/case.d";
import { useNavigation } from "@react-navigation/native";
import { useAppointmentStore } from "@/store/modules/appointments";
import { Pet } from "@/store/types/pet";
import BottomSheet from "@/components/partials/BottomSheet";

const NoPetOptions = ({
  navigation,
  setShowModal,
  expertId,
  scheduleAt,
  selectedTime,
  selectedDate,
}: {
  navigation: NavigationType;
  setShowModal: (showModal: boolean) => void;
  expertId: string;
  scheduleAt: string;
  selectedTime: string;
  selectedDate: string;
}) => {
  return (
    <Div pl={14} pt={14}>
      <Text mb={4} fontSize={"lg"} fontFamily={fontHauoraMedium}>
        No pets found
      </Text>
      <TouchableOpacity
        onPress={() => {
          setShowModal(false);

          setTimeout(() => {
            navigation.navigate("PetProfileScreen", {
              from: "ConsultationCaseBriefScreen",
              expertId,
              scheduleAt,
              selectedTime,
              selectedDate,
            });
          });
        }}
      >
        <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold} color="primary">
          Add Pet?
        </Text>
      </TouchableOpacity>
    </Div>
  );
};

const ConsultationCaseBriefScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const { createCase } = useCaseStore();
  const { updateConsultation } = useExpertStore();
  const { cancelConsultation } = useAppointmentStore();
  const { fetchPets } = usePetStore();
  const { requestConsultation } = useExpertStore();

  const route = useRoute();

  const comingFrom = (route.params as Record<string, string>)?.from;

  // NOTE: When coming from ExpertsListDetailScreen schedule action
  const selectedTime = (route.params as Record<string, string>)?.selectedTime;
  const selectedDate = (route.params as Record<string, string>)?.selectedDate;
  const caseData = (route.params as Record<string, string>)?.caseData;
  const scheduleAt = (route.params as Record<string, string>)?.scheduleAt;

  // NOTE: Will be there if coming from pet profile creation
  const petId = (route.params as Record<string, string>)?.petId;
  const petName = (route.params as Record<string, string>)?.petName;
  const expertId = (route.params as Record<string, string>)?.expertId;

  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    console.log("documents", documents);
  }, [documents]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showLimitConsultationPopup, setShowLimitConsultationPopup] = useState(false);

  const [selectedPet, setSelectedPet] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    fetchAllPets();
  }, []);

  useEffect(() => {
    setPet();
  }, [petId, petName]);

  useEffect(() => {
    if (!caseData) return;

    const parsedCase = JSON.parse(caseData) as CreateCasePayloadDto;
    const pet = pets?.find((pet) => pet.id === parsedCase.petId);

    setDescription(parsedCase.description);
    setDocuments(parsedCase.assets);

    setSelectedPet({ label: pet?.name ?? "", value: pet?.id ?? "" });
  }, [caseData]);

  const setPet = async () => {
    await fetchAllPets();
  };

  const petOptions = useMemo<{ label: string; value: string }[]>(
    () =>
      pets?.map((pet) => ({
        label: pet.name,
        value: pet.id,
      })) || [],
    [pets]
  );

  const isActionDisable = useMemo(
    () => actionLoading || !selectedPet || !description.trim(),
    [actionLoading, selectedPet, description]
  );

  const fetchAllPets = async () => {
    try {
      setLoading(true);
      const response = await fetchPets(false);
      setPets(response);
    } finally {
      setLoading(false);
    }
  };

  const handleUnSelectImage = (url: string) => {
    const newDocuments = documents.filter((doc) => doc.url !== url);
    setDocuments(newDocuments);
  };

  const handleCreateCase = async () => {
    const isScheduled = scheduleAt ? true : false;

    // Don't create case in scheduled
    if (isScheduled) {
      navigation.navigate("ExpertsScheduleConfirmationScreen", {
        expertId,
        caseData: JSON.stringify({
          description: description.trim(),
          assets: documents,
          petId: selectedPet?.value || "",
          vetId: expertId,
          status: CaseStatusEnum.OPEN,
        }),
        petId: selectedPet?.value || "",
        petName: selectedPet?.label || "",
        selectedTime,
        selectedDate,
        scheduleAt,
      });

      return;
    }

    try {
      setActionLoading(true);

      const { id: consultationId } = await requestConsultation(
        expertId,
        selectedPet?.value as string
      ); //send petId also

      const { id: caseId } = await createCase({
        description,
        assets: documents,
        petId: selectedPet?.value || "",
        vetId: expertId,
        status: CaseStatusEnum.OPEN,
      });

      await updateConsultation({
        id: consultationId,
        caseId,
      });

      navigation.navigate("ConsultationWaitingScreen", {
        consultationId,
        caseId,
        expertId,
        petName: selectedPet?.label || "",
      });
    } catch (err: any) {
      if (String(err.msgStr).includes("You've used your free consulatation call.")) {
        setShowLimitConsultationPopup(true);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConsultation = () => {
    navigation.goBack();
  };

  const handleExploreBenefitPress = async () => {
    setShowLimitConsultationPopup(false);
    await new Promise((resolve) => setTimeout(resolve, 200));
    navigation.navigate("PetProfileBenefitsScreen", { petId: selectedPet?.value });
  };

  return (
    <Layout showBack title="Case Brief" loading={loading} onBackPress={handleCancelConsultation}>
      <ScrollDiv flex={1} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text fontSize={"4xl"} mb={12} fontFamily={fontHeading}>
          Tell the expert your pet's condition
        </Text>

        <Text mb={24} fontFamily={fontHauoraMedium} color="darkGreyText" fontSize={"lg"}>
          Please describe your pet's symptoms, including any changes in behaviour, appetite, energy,
          or physical signs like vomiting, diarrhoea, coughing, or unusual discharge.
        </Text>

        <Div mb={12}>
          <SelectInput
            showModal={showModal}
            onOpen={() => setShowModal(true)}
            onClose={() => setShowModal(false)}
            label="Select Pet"
            options={petOptions}
            onSelect={(value) => {
              setSelectedPet(value);
            }}
            selectedValue={selectedPet}
            renderNoOptions={() =>
              NoPetOptions({
                navigation,
                setShowModal,
                expertId,
                scheduleAt,
                selectedTime,
                selectedDate,
              })
            }
            disableKeyboardDismissOnSelect
          />
        </Div>

        <TextAreaField
          ref={textAreaRef}
          placeholder="e.g. My cat is vomiting and color is white......"
          value={description}
          onChangeText={setDescription}
          mb={24}
        />

        <Text fontFamily={fontHauoraSemiBold} fontSize="xl" mb={8}>
          Documents
        </Text>
        <Text fontSize={"lg"} fontFamily={fontHauoraMedium} color="darkGreyText" mb={4}>
          Upload supportive documents
        </Text>

        <Text fontSize={"lg"} fontFamily={fontHauoraMedium} color="darkGreyText" mb={16}>
          (Image, Video, Doc)
        </Text>

        {/* <Div flexDir="row" style={{ gap: 12 }} overflow="scroll" > */}
        <ScrollDiv
          flexDir="row"
          style={{ gap: 12 }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <ImageUpload
            plusIcon={false}
            w={139}
            h={150}
            mr={12}
            document
            noImage
            disableCropping
            aspectRatio={"auto"}
            onLoading={(item) => {
              setUploading(item);
            }}
            onUnSelect={handleUnSelectImage}
            onChange={(file) => {
              console.log("filess == ", file);
              setDocuments((prev) => [...file, ...prev]);
            }}
          />

          {documents.length > 0 &&
            documents.map((item, i) => {
              return (
                <ImageUpload
                  key={i}
                  plusIcon={false}
                  mr={12}
                  w={139}
                  disableCropping
                  h={150}
                  uri={item.url}
                  onUnSelect={handleUnSelectImage}
                  disabled
                  docType={item.mimetype}
                  documentName={item.filename}
                />
              );
            })}
        </ScrollDiv>
        {/* </Div> */}

        <Div h={40}></Div>
      </ScrollDiv>
      <ButtonPrimary
        disabled={isActionDisable || uploading}
        onPress={handleCreateCase}
        loading={actionLoading}
      >
        {comingFrom === "ExpertsListDetailScreen" || scheduleAt ? "Confirm" : "Connect"}
      </ButtonPrimary>
      <BottomSheet
        isVisible={showLimitConsultationPopup}
        onCloseIconClick={() => setShowLimitConsultationPopup(false)}
        h="40%"
        roundedTop={24}
      >
        <Div p={8}>
          <Text fontSize="4xl" color="#000" fontFamily={fontHauoraBold}>
            You have used your free consultation!
          </Text>
          <Text mt={10} fontSize="xl" maxW={280} fontFamily={fontHauoraMedium}>
            But the good news is you can have as many consultations as you need with smoll® Care
            plan
          </Text>
          <Div mt={16} maxW={230} alignItems="center">
            <ButtonPrimary py={10} bg="#3859ff" onPress={async () => handleExploreBenefitPress()}>
              Explore Benefits
            </ButtonPrimary>
            <Text mt={4} fontSize={"sm"} fontFamily={fontHauoraMedium}>
              No commitment, cancel anytime
            </Text>
          </Div>
        </Div>
      </BottomSheet>
    </Layout>
  );
};

export default ConsultationCaseBriefScreen;
