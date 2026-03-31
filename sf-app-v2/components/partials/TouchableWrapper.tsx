import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

interface Prop extends TouchableOpacityProps {
  children: React.ReactNode;
}

const TouchableWrapper: React.FC<Prop> = ({ children, ...restProps }) => {
  return <TouchableOpacity {...restProps}>{children}</TouchableOpacity>;
};

export default TouchableWrapper;
