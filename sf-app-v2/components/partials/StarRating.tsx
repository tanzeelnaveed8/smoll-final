import { IconStar } from "@tabler/icons-react-native";
import React, { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { Div } from "react-native-magnus";

const arr = [1, 2, 3, 4, 5];

const StarRating: React.FC<{
  onChange?: (e: number) => void;
  defaultRating?: number;
  size?: number;
  columnGap?: number;
}> = ({ onChange, defaultRating, size, columnGap }) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (typeof defaultRating === "number") {
      setRating(defaultRating);
    }
  }, [defaultRating]);

  return (
    <Div flexDir="row" style={{ gap: columnGap || 16 }} mt={3}>
      {arr.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => {
            if (onChange) {
              setRating(item);
              onChange(item);
            }
          }}
        >
          <IconStar
            width={size || 32}
            height={size || 32}
            color={"#679FF0"}
            strokeWidth={3}
            fill={rating && rating >= item ? "#679FF0" : "#fff"}
          />
        </TouchableOpacity>
      ))}
    </Div>
  );
};

export default StarRating;
