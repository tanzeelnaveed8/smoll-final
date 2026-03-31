import { fontHauoraSemiBold } from "@/constant/constant";
import { IconChevronRight } from "@tabler/icons-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  //   Text,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Div, Tag, Text } from "react-native-magnus";

const CollapsibleView: React.FC<{
  type: string;
  servicesName: string;
  price: number;
  description: string;
  tagType: string;
}> = ({ type, servicesName, price, description, tagType }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [animation] = useState(new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState(0);
  const [show, setShow] = useState(false);
  const [applyStyle, setApplyStyle] = useState(false);

  const contentRef = useRef<View>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.measure((x, y, width, height, pageX, pageY) => {
        console.log("Height:", height);
        setContentHeight(height);
        setTimeout(() => {
          setApplyStyle(true);
        }, 200);
      });
    }
  }, []);

  const toggleCollapse = () => {
    if (collapsed) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    setShow(!show);
    setCollapsed(!collapsed);
  };

  const screenWidth = Dimensions?.get("screen").width;

  return (
    <Div flex={1}>
      <TouchableOpacity onPress={toggleCollapse}>
        <Div flexDir="row" alignItems="flex-start" flex={1}>
          <Div flexDir="row" flexWrap="wrap" style={{ gap: 4 }}>
            <Text
              fontSize={"lg"}
              fontFamily={fontHauoraSemiBold}
              mr={0}
              maxW={screenWidth > 390 ? 140 : 110}
            >
              {servicesName}
            </Text>

            <Animated.View
              style={{
                alignSelf: "flex-start",
                transform: [
                  { translateY: 7 },
                  {
                    rotate: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "90deg"],
                    }),
                  },
                ],
              }}
            >
              <IconChevronRight width={15} height={15} color={"#222"} />
            </Animated.View>
          </Div>

          <Div flexDir="row" flex={1} justifyContent="flex-end" style={{ gap: 8 }} ml={"auto"}>
            <Tag
              fontSize={"xs"}
              fontFamily={fontHauoraSemiBold}
              borderColor="#222"
              borderWidth={1.5}
              bg="transparent"
              rounded={40}
              mt={4}
              py={0}
              pb={1}
              px={8}
            >
              {tagType}
            </Tag>

            <Div>
              <Text fontSize={"xl"} fontFamily={fontHauoraSemiBold}>
                AED {price}
              </Text>
            </Div>
          </Div>
        </Div>
      </TouchableOpacity>
      <Animated.View
        style={
          applyStyle
            ? {
                paddingTop: 6,
                height: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, contentHeight + 6],
                }),
                overflow: "hidden",
              }
            : { opacity: 0, marginTop: -10 }
        }
      >
        <View
          ref={contentRef}
          onLayout={(event) => {
            event.persist(); // Retain the event object
          }}
        >
          <Text>{description ?? "-"}</Text>
        </View>
      </Animated.View>
    </Div>
  );
};

export default CollapsibleView;
