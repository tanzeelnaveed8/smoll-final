import { fontHauora } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import React from "react";
import { Button, ButtonProps } from "react-native-magnus";

interface BlankPrimaryProps extends ButtonProps {
  onTouchEnd?: () => void;
  children: React.ReactNode;
  bgColor?: string;
  link?: string;
  params?: { [key: string]: string };
  navigation?: NavigationType;
  disableUnderlayColor?: boolean;
}

const IconButton: React.FC<BlankPrimaryProps> = ({
  children,
  onTouchEnd,
  link,
  navigation,
  bgColor,
  params = {},
  disableUnderlayColor,
  ...restProps
}) => {
  return (
    <Button
      onTouchEnd={() => {
        if (onTouchEnd) onTouchEnd();
        if (link && navigation) {
          navigation.navigate(link, { ...params });
        }
      }}
      py={0}
      px={0}
      bg={bgColor ? bgColor : "#fff"}
      {...(disableUnderlayColor ? {} : { underlayColor: "#f3f3f3" })}
      fontFamily={fontHauora}
      {...restProps}
    >
      {children}
    </Button>
  );
};

export default IconButton;
