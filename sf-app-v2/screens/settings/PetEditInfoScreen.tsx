import Layout from "@/components/app/Layout";
import React, { useEffect, useState } from "react";
import { Div } from "react-native-magnus";
import { usePetStore } from "@/store/modules/pet";
import { PetDetail } from "@/store/types/pet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import PetProfileNameScreen from "../PetProfile/PetProfileNameScreen";
import PetProfileDOBScreen from "../PetProfile/PetProfileDOBScreen";
import PetProfileSpeciesScreen from "../PetProfile/PetProfileSpeciesScreen";
import PetProfileGenderScreen from "../PetProfile/PetProfileGenderScreen";
import PetProfileBreedScreen from "../PetProfile/PetProfileBreedScreen";
import PetProfileSpayedScreen from "../PetProfile/PetProfileSpayedScreen";
import { useRoute } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { colorPrimary } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { useToast } from "react-native-toast-notifications";
import { showMessage } from "react-native-flash-message";

type RouteType = { petId: string; fileName: string };

const PetEditInfoScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const toast = useToast();
  const route = useRoute();
  const petId = (route.params as RouteType)?.petId;
  const fileName = (route.params as RouteType)?.fileName;

  const { petsDetailMap, updatePet } = usePetStore();
  const [form, setForm] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!petId) return;
    const petDetails = petsDetailMap.get(petId) as PetDetail;
    if (petDetails) {
      setForm(petDetails);
    }
  }, [petId]);

  const handleUpdateDetails = async () => {
    if (!form) return;

    try {
      setLoading(true);

      await updatePet(petId, form);

      toast.show("Pet profile updated successfully");
      navigation.navigate("PetProfileDetailsScreen", { petId });
    } finally {
      setLoading(false);
    }
  };

  console.log("update info pet form=", form);

  const isNameInvalid =
    fileName === "name" && (!form?.name?.trim() || !/^[\p{L}\s]+$/u.test(form.name.trim()));

  return (
    <Layout
      showBack
      title="Update Info"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      {form && (
        <>
          <Div flex={1}>
            {fileName === "name" && <PetProfileNameScreen pet={form} setPet={setForm} />}

            {fileName === "dob" && <PetProfileDOBScreen pet={form} setPet={setForm} />}

            {fileName === "species" && <PetProfileSpeciesScreen pet={form} setPet={setForm} />}

            {fileName === "gender" && <PetProfileGenderScreen pet={form} setPet={setForm} />}

            {fileName === "breed" && <PetProfileBreedScreen pet={form} setPet={setForm} />}

            {fileName === "spayed/neutered" && (
              <PetProfileSpayedScreen pet={form} setPet={setForm} />
            )}
          </Div>

          <ButtonPrimary
            // bgColor="primary"
            onPress={handleUpdateDetails}
            loading={loading}
            disabled={loading || isNameInvalid}
          >
            Confirm
          </ButtonPrimary>
        </>
      )}

      {!form && (
        <Div flex={1} justifyContent="center">
          <ActivityIndicator size="large" color={colorPrimary} />
        </Div>
      )}
    </Layout>
  );
};

export default PetEditInfoScreen;
