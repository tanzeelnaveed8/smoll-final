import { fontHauoraMedium } from "@/constant/constant";
import { IconStar } from "@tabler/icons-react-native";
import React from "react";
import { Div, Text } from "react-native-magnus";

const arr = [1, 2, 3, 4, 5];

const PartnerVetStarRating: React.FC<{ rating: number; color?: string }> = ({ rating, color }) => {
  return (
    <Div py={6} flexDir="row" alignItems="center">
      <Div flexDir="row" style={{ gap: 4 }} mt={3}>
        {arr.map((item) => (
          <IconStar
            width={12}
            height={12}
            color={color ? color : "#679FF0"}
            fill={rating && rating >= item ? (color ? color : "#679FF0") : "#fff"}
          />
        ))}
      </Div>

      <Text fontSize={"md"} fontFamily={fontHauoraMedium} color="darkGreyText" ml={8}>
        {rating}/5 Rating
      </Text>
    </Div>
  );
};

export default PartnerVetStarRating;
