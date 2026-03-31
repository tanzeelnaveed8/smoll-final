import React from "react";
import { ScrollDiv } from "react-native-magnus";

const ScrollWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ScrollDiv flex={1} showsVerticalScrollIndicator={false}>
      {children}
    </ScrollDiv>
  );
};

export default ScrollWrapper;
