import BottomSheet from "@/components/partials/BottomSheet";
import ButtonPrimary from "@/components/partials/ButtonPrimary";
import ImageUpload from "@/components/partials/ImageUpload";
import { fontCooper, fontHauoraMedium, fontHauoraSemiBold, fontHeading } from "@/constant/constant";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Text, Div, Button, ScrollDiv } from "react-native-magnus";
import InputField from "@/components/partials/InputField";
import DatePickerComponent from "@/components/partials/DatePickerComponent";
import { HealthHistory } from "@/store/types/pet";
import { UploadedFile } from "@/store/types/file";
import { usePetStore } from "@/store/modules/pet";
import { useToast } from "react-native-toast-notifications";
import TextAreaField from "@/components/partials/TextAreaField";
import { Keyboard, Linking, TouchableOpacity } from "react-native";
import { IconFile, IconVideo, IconX } from "@tabler/icons-react-native";
import { truncateFileName } from "@/utils/helpers";

type PropTypes = {
  open: boolean;
  onClose: () => void;
  petId: string;
  healthHistoryId?: string;
};

const initialState = {
  name: "",
  description: "",
  date: new Date().toISOString(),
  documents: [],
};

const HealthHistoryModal = (props: PropTypes) => {
  const { addHealthHistory, petsDetailMap, updateHealthHistory } = usePetStore();
  const toast = useToast();

  const { open, onClose } = props;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<HealthHistory>({ ...initialState });
  const [uploading, setUploading] = useState(false);

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
      ?.healthHistory?.filter((item) => item.id === props?.healthHistoryId)
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
    console.log("form ===", form);

    const formCopy = { ...form };

    if (typeof value === "string" && key !== "documents") {
      formCopy[key] = value;
    } else if (key === "documents" && typeof value === "object") {
    } else if (key === "date") {
      formCopy.date = `${value}`;
    }

    console.log("updated formCopy", formCopy);
    setForm(formCopy);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (props.healthHistoryId) {
        await updateHealthHistory(props.petId, props.healthHistoryId, form);
        toast.show("Pet Health History updated successfully", {
          placement: "top",
        });
      } else {
        await addHealthHistory(props.petId, form);
        toast.show("Pet Health History added successfully", {
          placement: "top",
        });
      }
      props.onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleUnSelectDocument = (uri: string) => {
    const formCopy = { ...form };
    formCopy.documents = formCopy.documents.filter((document) => document.url !== uri);
    setForm(formCopy);
  };

  const isDisabled = useMemo(() => {
    return !form.name || !form.date || !form.description;
  }, [form]);

  return (
    <BottomSheet
      isVisible={open}
      h="93%"
      px={20}
      style={{ position: "relative" }}
      onCloseIconClick={() => {
        props.onClose();
      }}
    >
      <Div h={"100%"}>
        <ScrollDiv
          flex={1}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text fontSize={"6xl"} lineHeight={40} color="#222222" mb={4} fontFamily={fontHeading}>
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
              maxDate={new Date()}
            />

            <TextAreaField
              placeholder="Description"
              value={form.description}
              onChangeText={(e) => {
                handleFormChange("description", e);
              }}
              onSubmitEditing={() => {
                Keyboard.dismiss();
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
          </Div>

          <Div>
            <ScrollDiv
              flexDir="row"
              style={{ gap: 12 }}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {/* <Button onPress={handleDocumentSelection}>Select Document</Button> */}

              <ImageUpload
                plusIcon={true}
                w={139}
                h={150}
                mr={12}
                noImage
                document
                onLoading={(item) => {
                  setUploading(item);
                }}
                onChange={(file) => {
                  setForm((prev) => ({
                    ...prev,
                    documents: [...file, ...prev.documents],
                  }));
                }}
              />

              {form.documents.map((item, i) => {
                const mime = item.mimetype;

                return (
                  <React.Fragment key={i}>
                    <ImageUpload
                      plusIcon={false}
                      w={139}
                      h={150}
                      disabled
                      showDownloadBtn
                      openImageOnTab
                      docType={item.mimetype}
                      documentName={item.filename}
                      onUnSelect={handleUnSelectDocument}
                      uri={item?.url || ""}
                    />

                    <Div w={12} />
                  </React.Fragment>
                );
              })}
            </ScrollDiv>
          </Div>
        </ScrollDiv>

        <Div>
          <ButtonPrimary
            onPress={handleSubmit}
            loading={loading}
            mt={30}
            mb={30}
            disabled={loading || isDisabled || uploading}
          >
            Confirm
          </ButtonPrimary>
        </Div>
      </Div>
    </BottomSheet>
  );
};

export default HealthHistoryModal;
