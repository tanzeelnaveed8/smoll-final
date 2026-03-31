import ImageUpload from "@/components/partials/ImageUpload";
import { fontHauoraMedium, fontHeading } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { UploadedFile } from "@/store/types/file";
import { PetPayloadDto } from "@/store/types/pet";
import { useState } from "react";
import { Div, Text } from "react-native-magnus";

interface Props {
  navigation: NavigationType;
  pet: PetPayloadDto;
  setPet: (pet: PetPayloadDto) => void;
}

const PetProfileImageScreen: React.FC<Props> = (props) => {
  const [images, setImages] = useState<UploadedFile[]>([]);

  const handleImageChange = (files: UploadedFile[], index: number) => {
    const updatedPhotos = [...props.pet.photos];
    console.log("updatedPhotos", updatedPhotos, "index", index);
    console.log("updatedPhotos[index]", updatedPhotos[index]);
    updatedPhotos[index] = files[0];

    setImages(updatedPhotos);

    props.setPet({ ...props.pet, photos: updatedPhotos });
  };

  const handleUnselectFile = (index: number) => {
    const updatedPhotos = [...props.pet.photos];

    updatedPhotos[index] = undefined; // Set the photo at the specified index to undefined

    setImages(updatedPhotos);

    props.setPet({ ...props.pet, photos: updatedPhotos });
  };

  return (
    <Div>
      <Text fontSize={"6xl"} lineHeight={40} color="#222222" mb={16} fontFamily={fontHeading}>
        Upload {props.pet.name ?? "your pet"} photo
      </Text>
      <Div mb={24} flexDir="row" style={{ gap: 12 }}>
        <ImageUpload
          uri={props.pet.photos[0]?.uri}
          isPrimary={true}
          singleImage
          onUnSelect={(e) => handleUnselectFile(0)}
          onChange={(files) => handleImageChange(files, 0)}
          mediaType="Images"
          disableDownload
        />
      </Div>
      <Text fontFamily={fontHauoraMedium} fontSize="md" lineHeight={20} color="#494949" maxW={350}>
        Please make sure to upload a pretty and clear photo in JPEG or PNG format
      </Text>
    </Div>
  );
};

export default PetProfileImageScreen;
