// import Layout from "@/components/app/Layout";
// import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
// import { NavigationType } from "@/store/types";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Dimensions,
//   FlatList,
//   TouchableOpacity,
//   Animated,
// } from "react-native";
// import { Button, Div, Text, Image } from "react-native-magnus";
// import { useWindowDimensions } from "react-native";

// const images = [
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-1.png"),
//     heading: ["Smarter Care for ", "Modern Pet Families"],
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-2.png"),
//     heading: ["Instant Care over ", "Video Call"],
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-3.png"),
//     heading: ["Routine In-Clinic ", "Pet Care"],
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-4.png"),
//     heading: ["Care, without the ", "guesswork"],
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-5.png"),
//     heading: ["Peace of Mind ", "at Work"],
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-6.png"),
//     heading: ["Pet Parents, ", "Talking Pets"],
//   },
// ];

// const windowWidth = Dimensions.get("window").width;

// const NewOnboardingScreen: React.FC<{ navigation: NavigationType }> = ({
//   navigation,
// }) => {
//   const { height } = useWindowDimensions();
//   const fontSize = height < 900 ? 30 : 36;

//   const flatListRef = useRef<FlatList>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   /** TEXT ANIMATION */
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const opacityAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     slideAnim.setValue(0); // 👈 LEFT se start
//     opacityAnim.setValue(0);

//     Animated.parallel([
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.timing(opacityAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [currentIndex]);

//   /** SYNC TEXT WITH IMAGE */
//   const onViewRef = useRef(({ viewableItems }) => {
//     if (viewableItems?.length > 0) {
//       setCurrentIndex(viewableItems[0].index);
//     }
//   });

//   return (
//     <Layout style={{ flex: 1 }}>
//       {/* HEADER */}
//       <Div px={8}>
//         <Div flexDir="row" justifyContent="space-between" alignItems="center">
//           <Image
//             w={90}
//             h={30}
//             resizeMode="contain"
//             source={require("./../assets/logo.png")}
//           />

//           <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
//             <Button
//               bg="transparent"
//               px={8}
//               py={2}
//               rounded={30}
//               borderWidth={1.5}
//               borderColor="#222"
//               color="#222"
//               fontFamily={fontHauoraSemiBold}
//             >
//               Get Started
//             </Button>
//           </TouchableOpacity>
//         </Div>

//         {/* TEXT */}
//         <Animated.View
//           style={{
//             marginTop: 50,
//             marginBottom: 30,
//             opacity: opacityAnim,
//             transform: [{ translateX: slideAnim }],
//           }}
//         >
//           {images[currentIndex].heading.map((item, index) => (
//             <Text
//               key={index}
//               fontFamily={fontHauoraMedium}
//               fontSize={fontSize}
//               lineHeight={fontSize + 12}
//             >
//               {item}
//             </Text>
//           ))}
//         </Animated.View>
//       </Div>

//       {/* IMAGE SLIDER */}
//       <FlatList
//         ref={flatListRef}
//         data={images}
//         horizontal
//         pagingEnabled
//         keyExtractor={(_, i) => i.toString()}
//         showsHorizontalScrollIndicator={false}
//         onViewableItemsChanged={onViewRef.current}
//         viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
//         renderItem={({ item }) => (
//           <Div w={windowWidth - 48} mr={4}>
//             <Div
//               w="97%"
//               h="97%"
//               overflow="hidden"
//               style={{
//                 borderRadius: 40,
//                 left: 10,
//               }}
//             >
//               <Image w="100%" h="100%" resizeMode="cover" source={item.img} />
//             </Div>
//           </Div>
//         )}
//       />

//       {/* DOTS */}
//       <Div flexDir="row" pl={20} pb={30} pt={20}>
//         {images.map((_, index) => (
//           <Div
//             key={index}
//             h={currentIndex === index ? 5 : 10}
//             w={currentIndex === index ? 15 : 10}
//             rounded="circle"
//             borderWidth={1}
//             borderColor="#222"
//             bg={currentIndex === index ? "#222" : "transparent"}
//             m={3}
//           />
//         ))}
//       </Div>
//     </Layout>
//   );
// };

// export default NewOnboardingScreen;




// ===================================================


// import Layout from "@/components/app/Layout";
// import { fontHauora, fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
// import { NavigationType } from "@/store/types";
// import React, { useEffect, useRef, useState } from "react";
// import { Dimensions, FlatList, ImageResolvedAssetSource, TouchableOpacity } from "react-native";
// import { Button, Div, Text, Image,  } from "react-native-magnus";
// import { useWindowDimensions ,Animated} from "react-native";
// import { Image as RNImage } from "react-native";

// // const images = [
// //   {
// //     img: require("@/assets/images/onboarding-screen/new/slide-1.jpg"),
// //     heading: ["Your All-Inclusive Pet", "Wellness Plan"],
// //     width: 260,
// //     height: 260,
// //   },
// //   {
// //     img: require("@/assets/images/onboarding-screen/new/slide-5.jpg"),
// //     heading: ["Unlimited", "Consultations"],
// //     width: 400,
// //     height: 380,
// //   },
// //   {
// //     img: require("@/assets/images/onboarding-screen/new/slide-2.jpg"),
// //     heading: ["Vaccines, tests and", "checkups, all here"],
// //     width: 380,
// //     height: 350,
// //   },
// //   {
// //     img: require("@/assets/images/onboarding-screen/new/slide-3.jpg"),
// //     heading: ["Free Telehealth all", "year long"],
// //     width: 300,
// //     height: 350,
// //   },
// //   {
// //     img: require("@/assets/images/onboarding-screen/new/slide-4.jpg"),
// //     heading: ["Stress Free,", "at-home visits"],
// //     width: 400,
// //     height: 380,
// //   },
// // ];

// const images = [
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-1.png"),
//     heading: ["Smarter Care for ", "Modern Pet Families"], 
//     width: 260,
//     height: 260,
//   },
//    {
//     img: require("@/assets/images/onboarding-screen/new/newslide-2.png"),
//     heading: ["Instant Care over ", "Video Call"],
//     width: 300,
//     height: 350,
//   },
//     {
//     img: require("@/assets/images/onboarding-screen/new/newslide-3.png"),
//     heading: ["Routine In-Clinic ", "Pet Care"],
//     width: 380,
//     height: 350,
//   },
//     {
//     img: require("@/assets/images/onboarding-screen/new/newslide-4.png"),
//     heading: ["Care, without the ", "guesswork"],
//     width: 400,
//     height: 380,
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-5.png"),
//     heading: ["Peace of Mind ", "at Work"],
//     width: 400,
//     height: 380,
//   },
//   {
//     img: require("@/assets/images/onboarding-screen/new/newslide-6.png"),
//     heading: ["Pet Parents, ", "Talking Pets"],
//     width: 400,
//     height: 380,
//   },

 

// ];
// const windowWidth = Dimensions.get("window").width;

// const NewOnboardingScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
//   const { height } = useWindowDimensions();
//   const fontSize = height < 900 ? 30 : 36;
//   const flatListRef = useRef<FlatList>(null);
//   const flatListRef2 = useRef<FlatList>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     return;
//     // Preload images
//     images.forEach((image) => {
//       const resolvedImage = RNImage.resolveAssetSource(image.img);
//       resolvedImage.uri && RNImage.prefetch(resolvedImage.uri);
//     });
//   }, []);

//   useEffect(() => {
//     const time = 4000;
//     if (currentIndex === images.length - 1) {
//       const timeout = setTimeout(() => {
//         setCurrentIndex(0);
//         flatListRef.current?.scrollToIndex({
//           index: 0,
//           animated: true,
//         });
//       }, time);
//       return () => clearTimeout(timeout);
//       // return;
//     }

//     const interval = setInterval(() => {
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Update currentIndex
//       flatListRef.current?.scrollToIndex({
//         index: (currentIndex + 1) % images.length,
//         animated: true,
//       });
//     }, time); // Adjust the interval time as needed

//     return () => clearInterval(interval); // Cleanup on unmount
//   }, [currentIndex]);

  


//  const slideAnim = useRef(new Animated.Value(30)).current;

// useEffect(() => {
//   slideAnim.setValue(120);
//   Animated.timing(slideAnim, {
//     toValue: 0,
//     duration: 250,
//     useNativeDriver: true,
//   }).start();
// }, [currentIndex]);



//   return (
//     <>
//       <Layout style={{ flex: 1 }}>
//         <Div px={8}>
//           <Div flexDir="row" justifyContent="space-between" alignItems="center">
//             <Image
//               w={90}
//               h={30}
//               style={{ objectFit: "contain" }}
//               source={require("./../assets/logo.png")}
//             />

//             <TouchableOpacity
//               onPress={() => {
//                 navigation.navigate("SignupScreen");
//               }}
//             >
//               <Button
//                 bg="transparent"
//                 px={8}
//                 py={2}
//                 rounded={30}
//                 borderWidth={1.5}
//                 borderColor="#222"
//                 color="#222"
//                 pointerEvents="none"
//                 fontFamily={fontHauoraSemiBold}
//               >
//                 Get Started
//               </Button>
//             </TouchableOpacity>
//           </Div>

//           <Div>
//             <Div mt={50} my={30}>
            
//           <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
//   {images[currentIndex].heading.map((item, index) => (
//     <Text key={index}  fontFamily={fontHauoraMedium}
//                   fontSize={fontSize}
//                   lineHeight={fontSize + 12} >{item}</Text>
//   ))}
// </Animated.View>
//             </Div>
//           </Div>
//         </Div>


//   <FlatList
//           data={images}
//           ref={flatListRef}
//           style={{
//             pointerEvents: "none",
//           }}
//           contentContainerStyle={{ alignItems: "flex-start" }}
//           keyExtractor={(item, i) => `${i}`}
//           renderItem={({ item }: { item: (typeof images)[0] }) => (
//             <Div w={windowWidth - 48} mt="auto" mr={10}>


          
//               <Div
//                 alignSelf="flex-start"
//                 w="97%"
//                 h="97%"
//                 overflow="hidden"
//                 style={{
//                   borderRadius: 40,
//                   left: 10,
//                   position: "relative",
//                 }}
//               >
//                 <Image w="100%" h="100%" resizeMode="cover" source={item.img} />
//               </Div>
//             </Div>
//           )}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           pagingEnabled
//         />
        













//         <FlatList
//           data={images}
//           ref={flatListRef}
//           style={{
//             pointerEvents: "none",
//           }}
//           contentContainerStyle={{ alignItems: "flex-start" }}
//           keyExtractor={(item, i) => `${i}`}
//           renderItem={({ item }: { item: (typeof images)[0] }) => (
//             <Div w={windowWidth - 48} mt="auto" mr={10}>


          
//               <Div
//                 alignSelf="flex-start"
//                 w="97%"
//                 h="97%"
//                 overflow="hidden"
//                 style={{
//                   borderRadius: 40,
//                   left: 10,
//                   position: "relative",
//                 }}
//               >
//                 <Image w="100%" h="100%" resizeMode="cover" source={item.img} />
//               </Div>
//             </Div>
//           )}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           pagingEnabled
//         />

//         {/* Dots Indicator */}
//         <Div flexDir="row" justifyContent="flex-start" alignItems="center" pl={20} pb={30} pt={20}>
//           {images.map((_, index) => (
//             <Div
//               key={index}
//               style={{
//                 height: currentIndex === index ? 5 : 10,
//                 width: currentIndex === index ? 15 : 10,
//                 borderRadius: 8,
//                 borderWidth: 1,
//                 borderColor: "#222",
//                 backgroundColor: currentIndex === index ? "#222" : "transparent",
//                 margin: 3,
//               }}
//             />
//           ))}
//         </Div>
//       </Layout>
//     </>
//   );
// };

// export default NewOnboardingScreen;
//----------------------------------------------------




import Layout from "@/components/app/Layout";
import { fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Button, Div, Text, Image } from "react-native-magnus";
import { useWindowDimensions } from "react-native";

const images = [
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-1.png"),
    heading: ["Smarter Care for ", "Modern Pet Families"],
    width: 260,
    height: 260,
  },
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-2.png"),
    heading: ["Instant Care over ", "Video Call"],
    width: 300,
    height: 350,
  },
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-3.png"),
    heading: ["Routine In-Clinic ", "Pet Care"],
    width: 380,
    height: 350,
  },
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-4.png"),
    heading: ["Care, without the ", "guesswork"],
    width: 400,
    height: 380,
  },
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-5.png"),
    heading: ["Peace of Mind ", "at Work"],
    width: 400,
    height: 380,
  },
  {
    img: require("@/assets/images/onboarding-screen/new/newslide-6.png"),
    heading: ["Pet Parents, ", "Talking Pets"],
    width: 400,
    height: 380,
  },
];

const windowWidth = Dimensions.get("window").width;

const NewOnboardingScreen: React.FC<{ navigation: NavigationType }> = ({
  navigation,
}) => {
  const { height } = useWindowDimensions();
  const fontSize = height < 900 ? 30 : 36;

  // ✅ FIX: TWO refs (one for each FlatList)
  const flatListRef1 = useRef<FlatList>(null);
  const flatListRef2 = useRef<FlatList>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  // ---------------- TEXT ANIMATION (UNCHANGED) ----------------
  const slideAnim = useRef(new Animated.Value(120)).current;

  useEffect(() => {
    slideAnim.setValue(120);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [currentIndex]);

  // ---------------- AUTO SLIDE (FIXED) ----------------
  useEffect(() => {
    const time = 4000;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);

      flatListRef1.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      flatListRef2.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, time);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <Layout style={{ flex: 1 }}>
      <Div px={8}>
        {/* Header */}
        <Div flexDir="row" justifyContent="space-between" alignItems="center">
          <Image
            w={90}
            h={30}
            style={{ objectFit: "contain" }}
            source={require("./../assets/logo.png")}
          />

          <TouchableOpacity onPress={() => navigation.navigate("SignupScreen")}>
            <Button
              bg="transparent"
              px={8}
              py={2}
              rounded={30}
              borderWidth={1.5}
              borderColor="#222"
              color="#222"
              pointerEvents="none"
              fontFamily={fontHauoraSemiBold}
         
              
            >
              Get Started
            </Button>
          </TouchableOpacity>
        </Div>

    
      </Div>

      {/* ----------- FIRST FLATLIST ----------- */}
      <Div   >
      <FlatList
        ref={flatListRef1}
        data={images}
        pointerEvents="none"
         style={{
             // 🔴 IMPORTANT (adjust as needed)
          }}
        contentContainerStyle={{ alignItems: "flex-start" }}
        keyExtractor={(_, i) => `${i}`}
        renderItem={({ item }) => (
          <Div w={windowWidth - 48} mt="auto" mr={10} mb={10}>
            <Div
              w="97%"
h="auto"

              style={{
                borderRadius: 40,
                left: 10,
                position: "relative",
              }}
            >
                <Div mt={50}mb={15} >
              {item.heading.map((text, index) => (
                <Text
                  key={index}
                  fontFamily={fontHauoraMedium}
                  fontSize={fontSize}
                  lineHeight={fontSize + 12}
                >
                  {text}
                </Text>
              ))}
            </Div>
            </Div>
          </Div>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
      </Div>

      {/* ----------- SECOND FLATLIST ----------- */}
      <FlatList
        ref={flatListRef2}
        data={images}
        pointerEvents="none"
          style={{
                     // 🔴 IMPORTANT (adjust as needed)
                  }}
        contentContainerStyle={{ alignItems: "flex-start" }}
        keyExtractor={(_, i) => `${i}`}
        renderItem={({ item }) => (
          <Div w={windowWidth - 48} mt="auto" mr={10}>
            <Div
              w="97%"
              h="97%"
              overflow="hidden"
              style={{
                borderRadius: 40,
                left: 10,
                position: "relative",
              }}
            >
              <Image w="100%" h="100%" resizeMode="cover" source={item.img} />
            </Div>
          </Div>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />

      {/* Dots */}
      <Div flexDir="row" pl={20} pb={30} pt={20}>
        {images.map((_, index) => (
          <Div
            key={index}
            style={{
              height: currentIndex === index ? 5 : 10,
              width: currentIndex === index ? 15 : 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#222",
              backgroundColor:
                currentIndex === index ? "#222" : "transparent",
              margin: 3,
            }}
          />
        ))}
      </Div>
    </Layout>
  );
};

export default NewOnboardingScreen;
