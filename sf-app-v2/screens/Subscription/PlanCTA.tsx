import ButtonPrimary from "@/components/partials/ButtonPrimary";
import { fontHauoraBold, fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { IconArrowRight } from "@tabler/icons-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "react-native-magnus";

const PlanCTA = ({
  petName,
  onButtonPress,
  loading,
}: {
  petName?: string;
  onButtonPress: () => void;
  loading?: boolean;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image h={37} w={240} source={require("@/assets/images/pet-joined.png")} />
      </View>

      <ButtonPrimary
        borderWidth={2}
        borderColor="#222"
        textColor="#222"
        fontFamily={fontHauoraBold}
        bg="transparent"
        onPress={onButtonPress}
        loading={loading}
        py={14}
        appendIcon={<IconArrowRight color="#222" height={28} width={28} />}
      >
        Proceed
      </ButtonPrimary>
    </View>
  );
};

export default PlanCTA;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#faf8f5",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarGroup: {
    flexDirection: "row",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
