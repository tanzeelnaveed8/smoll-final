import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { Avatar, Badge, Div, Image, Text } from "react-native-magnus";
import Verified from "./Verified";
import { IconUser } from "@tabler/icons-react-native";
import VerifiedIcon from "../icons/VerifiedIcon";

type PropTypes = {
  name: string;
  speciality: string;
  experience?: number;
  verified?: boolean;
  slotScreen?: boolean;
  isOnline?: boolean;
  image?: string;
  about?: string;
};

const DoctorCard: React.FC<PropTypes> = (props) => {
  const {
    name,
    speciality,
    experience,
    verified = false,
    slotScreen = false,
    isOnline = false,
    image,
    about,
  } = props;

  return (
    <Div flexDir={"row"} justifyContent="space-between">
      <Div flexDir="row" alignItems={slotScreen ? "center" : "flex-start"}>
        {isOnline ? (
          <Div mr={slotScreen ? 12 : 24}>
            <Badge
              right={slotScreen ? 0 : 10}
              top={6}
              h={15}
              w={15}
              style={{ backgroundColor: "#00ff28" }}
              borderWidth={2}
              borderColor="#fff"
            >
              {image ? (
                <Image source={{ uri: image }} w={100} h={100} rounded={100} bg="#eeeeee" />
              ) : (
                <IconUser size={24} />
              )}
            </Badge>
            <Div bg="#17d34a" rounded={15} px={10} py={2} alignSelf="center" mt={10}>
              <Text fontSize={"sm"} color="#fff" fontFamily={fontHauoraSemiBold}>
                I'm Online!
              </Text>
            </Div>
          </Div>
        ) : image ? (
          <Image
            source={{ uri: image }}
            w={100}
            h={100}
            rounded={100}
            bg="#eeeeee"
            mr={slotScreen ? 12 : 24}
          />
        ) : (
          <Avatar size={100} bg="#eeeeee" mr={slotScreen ? 12 : 24}>
            <IconUser size={40} color="#666" />
          </Avatar>
        )}
        <Div w="full" flexDir="row" justifyContent="space-between">
          <Div style={{ gap: 4 }}>
            <Div row alignItems="center" style={{ gap: 6 }}>
              <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24} color="#222222">
                {name}
              </Text>

              {!slotScreen && verified && (
                <Div mb={1}>
                  <VerifiedIcon />
                </Div>
              )}
            </Div>
            <Text fontSize="md" fontFamily={fontHauoraMedium} color="#494949" lineHeight={20}>
              {speciality}
            </Text>
            {experience !== undefined && (
              <Text fontSize="md" fontFamily={fontHauoraMedium} color="#494949" lineHeight={20}>
                {experience} yrs of experience
              </Text>
            )}
            {about && (
              <Text
                fontSize="md"
                fontFamily={fontHauoraMedium}
                color="#494949"
                lineHeight={20}
                maxW={"90%"}
              >
                {about.length > 60 ? about.slice(0, 60) + "..." : about}
              </Text>
            )}
            {/* {!slotScreen && verified && <Verified />} */}
          </Div>
        </Div>
      </Div>
      {slotScreen && verified && <Verified />}
    </Div>
  );
};

export default DoctorCard;
