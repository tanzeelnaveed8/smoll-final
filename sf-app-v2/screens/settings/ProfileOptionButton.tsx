import { fontHauoraMedium } from "@/constant/constant";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Div, Text } from "react-native-magnus";

type OptionPropTypes = {
  title: string;
  value: string | undefined | null | number | boolean;
  varified?: boolean;
  editable?: boolean;
  onEdit?: () => void;
};

const ProfileOptionButton = (props: OptionPropTypes) => {
  const { title, value, varified, onEdit, editable } = props;
  return (
    <React.Fragment>
      <Div
        w="full"
        py={12}
        flexDir="row"
        justifyContent="space-between"
        alignItems="center"
        borderBottomWidth={1}
        borderBottomColor="#E0E0E0"
      >
        <Div>
          <Text color="#494949" fontSize="sm" fontFamily={fontHauoraMedium} lineHeight={16}>
            {title}
          </Text>
          <Text color="#222222" fontSize={"xl"} lineHeight={24} fontFamily={fontHauoraMedium}>
            {value}
          </Text>
        </Div>

        {editable && (
          <TouchableOpacity onPress={onEdit}>
            <Text fontSize={"lg"} lineHeight={24} color="primary">
              {value ? "Edit" : "Add"}
            </Text>
          </TouchableOpacity>
        )}
      </Div>
      {varified && (
        <Text fontSize="md" lineHeight={20} color="#2F6E20" fontFamily={fontHauoraMedium} mt={4}>
          Verified
        </Text>
      )}
    </React.Fragment>
  );
};

export default ProfileOptionButton;
