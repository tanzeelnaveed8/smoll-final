import Layout from "@/components/app/Layout";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { PetGenderEnum, PetPayloadDto, PetSpeciesEnum } from "@/store/types/pet.d";
import { useRoute } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Div, ScrollDiv } from "react-native-magnus";
import * as Progress from "react-native-progress";
import { useToast } from "react-native-toast-notifications";
import PetProfileBasicDetailScreens from "./PetProfileBasicDetailScreens";
import PetProfileBreedScreen from "./PetProfileBreedScreen";
import PetProfileDOBScreen from "./PetProfileDOBScreen";
import PetProfileGenderScreen from "./PetProfileGenderScreen";
import PetImageUploadScreen from "./PetProfileImageScreen";
import PetProfileNameScreen from "./PetProfileNameScreen";
import PetProfileSpayedScreen from "./PetProfileSpayedScreen";
import PetProfileSpeciesScreen from "./PetProfileSpeciesScreen";

const windowWidth = Dimensions.get("window").width;

interface Props {
  navigation: NavigationType;
}

const totalSteps = 7;

const PetProfileScreen: React.FC<Props> = (props) => {
  const route = useRoute();
  const toast = useToast();
  const { UPDATE_PET_COUNT } = useUserStore();
  const { addPet, petsDetailMap } = usePetStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pet, setPet] = useState<PetPayloadDto>({
    name: "",
    age: 0,
    weight: 0,
    species: PetSpeciesEnum.CAT,
    gender: PetGenderEnum.MALE,
    spayedOrNeutered: false,
    photos: [],
    breed: "",
    dob: new Date().toString(),
    chipNumber: "",
    preExistingConditions: "",
  });

  const progress = useMemo(() => (currentStep + 1) / totalSteps - 0.2, [currentStep]);

  const isActionDisabled = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !pet.name.trim().length;
      case 2:
        return !pet.gender.length;
      case 4:
        return !pet.breed.length;
      case 7:
        return !pet.photos.length || pet.photos.every((photo) => typeof photo === "undefined");
    }

    return false;
  }, [currentStep, pet, petsDetailMap]);

  const handleNext = async () => {
    const comingFrom = (route.params as Record<string, string>)?.from;
    const expertId = (route.params as Record<string, string>)?.expertId;
    const scheduleAt = (route.params as Record<string, string>)?.scheduleAt;
    const selectedTime = (route.params as Record<string, string>)?.selectedTime;
    const selectedDate = (route.params as Record<string, string>)?.selectedDate;

    const consultationId = (route.params as Record<string, string>)?.consultationId;

    if (currentStep === 7) {
      try {
        setLoading(true);

        const { id } = await addPet(pet);

        UPDATE_PET_COUNT(1);

        props.navigation.navigate("PetProfileMedicalHistoryScreen", {
          navigateTo: comingFrom === "modal" ? "HomeScreen" : comingFrom,
          petId: id ?? "",
          petName: pet.name.trim(),
          petBg: pet.photos?.[0]?.url ?? "",
          expertId,
          consultationId,
          scheduleAt,
          selectedTime,
          selectedDate,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep((step) => step + 1);
    }
  };

  const handleBack = () => {
    const comingFrom = (route.params as Record<string, string>)?.from;

    if (currentStep === 0) {
      if (comingFrom === "modal") {
        props.navigation.navigate("Home", {
          showSetupModal: "true",
        });

        return;
      }

      props.navigation.goBack();
    }

    setCurrentStep((step) => step - 1);
  };

  return (
    <Layout showBack={currentStep !== 8} onBackPress={handleBack} style={styles.container}>
      <ScrollDiv style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        {/* progress bar */}
        <Progress.Bar
          progress={progress}
          height={8}
          width={windowWidth - 40}
          borderColor="transparent"
          style={{
            marginBottom: 32,
            backgroundColor: "#EFEFEF",
            borderRadius: 100,
          }}
          color="#222"
        />
        {/* screens */}
        {currentStep === 0 && <PetProfileNameScreen pet={pet} setPet={setPet} />}
        {currentStep === 1 && <PetProfileDOBScreen pet={pet} setPet={setPet} />}
        {currentStep === 2 && <PetProfileGenderScreen pet={pet} setPet={setPet} />}
        {currentStep === 3 && <PetProfileSpeciesScreen pet={pet} setPet={setPet} />}
        {currentStep === 4 && <PetProfileBreedScreen pet={pet} setPet={setPet} />}
        {currentStep === 5 && <PetProfileSpayedScreen pet={pet} setPet={setPet} />}
        {currentStep === 6 && <PetProfileBasicDetailScreens pet={pet} setPet={setPet} />}
        {currentStep === 7 && (
          <PetImageUploadScreen navigation={props.navigation} pet={pet} setPet={setPet} />
        )}
      </ScrollDiv>

      <Div>
        <ButtonPrimary
          // bgColor="primary"
          onPress={handleNext}
          disabled={isActionDisabled || loading}
          loading={loading}
        >
          Next
        </ButtonPrimary>
      </Div>
    </Layout>
  );
};

export default PetProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
});
