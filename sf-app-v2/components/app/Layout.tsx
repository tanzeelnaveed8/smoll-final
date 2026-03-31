import React, { useEffect } from "react";
import { ActivityIndicator, StyleProp, StyleSheet, ViewStyle } from "react-native";
import { Div, Text, WINDOW_HEIGHT } from "react-native-magnus";
import BackButton from "../partials/BackButton";
import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showBack?: boolean;
  onBackPress?: () => void;
  backBtnText?: string;
  title?: string;
  showCloseIcon?: boolean;
  loading?: boolean;
  disableHeader?: boolean;
  /**
   * @requires navigation
   */
  preventBackGesture?: boolean;
  navigation?: NavigationType;
}

const Layout: React.FC<Props> = ({
  children,
  style,
  onBackPress,
  showBack,
  backBtnText,
  title,
  showCloseIcon,
  loading,
  disableHeader = false,
}) => {
  const externalStyles: {} = style ? style : {};

  return (
    <Div style={{ ...styles.container, ...externalStyles }}>
      {!disableHeader && (
        <Div row style={styles.titleContainer}>
          <Div
            row
            justifyContent="space-between"
            alignItems="center"
            position="relative"
            flex={1}
            // bg="yellow"
          >
            {(showBack || showCloseIcon) && (
              <Div top={2}>
                <BackButton
                  onPress={onBackPress}
                  text={backBtnText}
                  showCloseIcon={showCloseIcon}
                />
              </Div>
            )}
            {/* <Div flex={1} minH={34}> */}
            <Text
              fontSize={"xl"}
              fontWeight="600"
              textAlign="center"
              flex={1}
              lineHeight={28}
              fontFamily={fontHauoraSemiBold}
              style={{ position: "absolute", width: "100%", zIndex: -1, top: 0 }}
            >
              {title}
            </Text>
          </Div>
        </Div>
      )}

      {loading ? (
        <Div flex={1} justifyContent="center" minH={WINDOW_HEIGHT / 1.4}>
          <ActivityIndicator size="large" color={colorPrimary} />
        </Div>
      ) : (
        children
      )}
    </Div>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    lineHeight: 21,
  },
});
