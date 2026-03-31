import { fontHauoraMedium } from "@/constant/constant";
import { IconChevronRight } from "@tabler/icons-react-native";
import { Button, Div, Text } from "react-native-magnus";
import DoctorCard from "./DoctorCard";
import AppointmentOnlyIcon from "@/components/icons/AppointmentOnlyIcon";

type PropTypes = {
  name: string;
  speciality: string;
  experience?: number;
  verified?: boolean;
  nextAvailable: string;
  mb?: number;
  onCheckAvailability?: () => void;
  byAppointmentOnly?: boolean;
  isOnline?: boolean;
  image?: string;
  about?: string;
};

const DoctorListCard: React.FC<PropTypes> = (props) => {
  const {
    name,
    speciality,
    experience,
    verified,
    nextAvailable,
    mb,
    onCheckAvailability,
    byAppointmentOnly,
    isOnline,
    image,
    about,
  } = props;

  return (
    <Div pb={20} borderBottomWidth={1} borderColor="#E0E0E0" mb={mb}>
      <DoctorCard
        name={name}
        experience={experience}
        speciality={speciality}
        verified={verified}
        isOnline={isOnline}
        image={image}
        about={about}
      />

      {/* card footer */}
      <Div flexDir="row" mt={8} justifyContent="space-between">
        <Div>
          {/* <Text
            fontSize="md"
            fontFamily={fontHauoraMedium}
            color="#494949"
            lineHeight={20}
          >
            Next Available at
          </Text>
          <Text
            fontSize="md"
            fontFamily={fontHauoraMedium}
            color="#494949"
            lineHeight={20}
          >
            {nextAvailable}
          </Text> */}
        </Div>

        <Div flex={1} mr={15} justifyContent={"center"} alignItems={"flex-end"}>
          {byAppointmentOnly && <AppointmentOnlyIcon width={88} height={20} />}
        </Div>
        <Button
          bg="#222"
          rounded={100}
          fontSize="lg"
          fontFamily={fontHauoraMedium}
          color="#fff"
          py={8}
          px={12}
          suffix={
            <IconChevronRight
              color="#FFFFFF"
              size={24}
              strokeWidth={1.5}
              style={{ marginBottom: -2 }}
            />
          }
          lineHeight={24}
          onPress={onCheckAvailability}
        >
          Check availability
        </Button>
      </Div>
    </Div>
  );
};

export default DoctorListCard;
