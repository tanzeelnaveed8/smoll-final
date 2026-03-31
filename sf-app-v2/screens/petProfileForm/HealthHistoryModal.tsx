import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import ImageUpload from "@/components/partials/ImageUpload";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { useEffect, useState } from "react";
import { Text, Div, Button, ScrollDiv } from "react-native-magnus";
import AddMedicalHistoryInfo from "./AddMedicalHistoryInfo";
import InputField from "@/components/partials/InputField";
import DatePickerComponent from "@/components/partials/DatePickerComponent";
import { HealthHistory } from "@/store/types/pet";
import { UploadedFile } from "@/store/types/file";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { useToast } from "react-native-toast-notifications";

type PropTypes = {
  open: boolean;
  onClose: () => void;
  petId: string;
  healthHistoryId?: string;
};

const initialState = {
  name: "",
  description: "",
  // date: new Date().toISOString(),
  date: new Date().toISOString(),
  documents: [],
};

const PetDetailsModal = (props: PropTypes) => {
  const { addHealthHistory, petsDetailMap, updateHealthHistory } = usePetStore();
  const toast = useToast();

  const { open, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<HealthHistory>({ ...initialState });

  useEffect(() => {
    if (!props.healthHistoryId) {
      setForm(initialState);
      return;
    }

    // const healthHistory = healthHistoryMap
    //   .get(props.petId)
    //   ?.filter((item) => item.id === props.healthHistoryId)
    //   ?.pop();
    const healthHistory = petsDetailMap
      .get(props.petId)
      ?.healthHistory?.filter((item) => item.id === props.healthHistoryId)
      ?.pop();

    if (healthHistory) {
      setForm({
        name: healthHistory.name,
        date: healthHistory.date,
        description: healthHistory.description,
        documents: healthHistory.documents,
      });
    }
  }, [open]);

  const handleFormChange = (key: keyof typeof form, value: string | UploadedFile[]) => {
    const formCopy = { ...form };
    if (typeof value === "string" && key !== "documents") {
      formCopy[key] = value;
    } else if (key === "documents" && typeof value === "object") {
      formCopy.documents = value;
    } else if (key === "date") {
      formCopy.date = `${value}`;
    }
    setForm(formCopy);
  };

  const handleUnSelectDocument = () => {
    const formCopy = { ...form };
    formCopy.documents = [];
    setForm(formCopy);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (props.healthHistoryId) {
        await updateHealthHistory(props.petId, props.healthHistoryId, form);
        toast.show("Pet Health History updated successfully");
      } else {
        await addHealthHistory(props.petId, form);
        toast.show("Pet Health History added successfully");
      }
      props.onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet isVisible={open} onCloseIconClick={onClose} h="95%" px={0} showCloseIcon>
      <ScrollDiv style={{}} showsVerticalScrollIndicator={false}>
        <Div flex={1} px={20} pb={30}>
          <Text fontSize={"6xl"} lineHeight={40} color="#222222" mb={4}>
            Details
          </Text>
          <Text
            fontFamily={fontHauoraMedium}
            fontSize="xl"
            lineHeight={24}
            color="#494949"
            maxW={350}
            mb={24}
          >
            Please enter the details of your pet’s medical history, including past illnesses,
            treatments, and any ongoing conditions
          </Text>

          <Div mb={24} style={{ gap: 8 }}>
            <InputField
              placeholder="Vaccine or Surgery"
              h={"auto"}
              value={form.name}
              onChangeText={(e) => {
                handleFormChange("name", e);
              }}
            />

            <DatePickerComponent
              py={14}
              value={form.date}
              onChange={(dob) => {
                handleFormChange("date", dob.toISOString());
              }}
            />

            <InputField
              placeholder="Description"
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={(e) => {
                handleFormChange("description", e);
              }}
            />
          </Div>

          <Div>
            <Text
              fontFamily={fontHauoraSemiBold}
              fontSize="xl"
              lineHeight={24}
              color="#222222"
              mb={8}
            >
              Documents
            </Text>
            <Text
              fontFamily={fontHauoraMedium}
              fontSize="lg"
              lineHeight={24}
              color="#494949"
              mb={4}
            >
              Upload supportive docunments
            </Text>
            <Text
              fontFamily={fontHauoraMedium}
              fontSize="lg"
              lineHeight={24}
              color="#494949"
              mb={16}
            >
              (Image, Video, Doc)
            </Text>

            <ImageUpload
              plusIcon={false}
              w={139}
              h={150}
              onUnSelect={handleUnSelectDocument}
              onChange={(file) => {
                handleFormChange("documents", file);
              }}
            />
          </Div>
          <Div mt={60} pb={20}>
            <ButtonPrimary
              bgColor="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              Confirm
            </ButtonPrimary>
          </Div>
        </Div>
      </ScrollDiv>
    </BottomSheet>
  );
};

function Add({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <Div
      py={12}
      borderBottomWidth={1}
      borderColor="#D0D7DC"
      flexDir="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24} color="#494949">
        {title}
      </Text>

      <Button
        bg="transparent"
        px={0}
        py={0}
        fontFamily={fontHauoraSemiBold}
        fontSize="lg"
        lineHeight={24}
        color="primary"
        onPress={onAdd}
      >
        Add
      </Button>
    </Div>
  );
}

export default PetDetailsModal;
