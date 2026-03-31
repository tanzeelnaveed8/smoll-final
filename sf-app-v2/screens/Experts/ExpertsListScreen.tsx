import Layout from "@/components/app/Layout";
import DoctorListCard from "@/components/partials/DoctorListCard";
import {
  colorPrimary,
  fontCooper,
  fontHauora,
  fontHauoraBold,
  fontHauoraSemiBold,
} from "@/constant/constant";
import { SocketEventEnum } from "@/socket/events";
import { useSocket } from "@/socket/provider";
import { useExpertStore } from "@/store/modules/expert";
import { NavigationType } from "@/store/types";
import { Expert } from "@/store/types/expert";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList } from "react-native";
import { Div, Button, Text } from "react-native-magnus";

const windowHeight = Dimensions.get("window").height;

const ExpertsListScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const socket = useSocket();
  const {
    fetchExperts,
    fetchExpertFilter,
    fetchExpertsBySpeciality,
    updateExpertStatus,
    experts=[],
    expertFilter=[],
    expertDetailMap,
  } = useExpertStore();

  // const [experts, setExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState();
  const [isOnlineFilter, setIsOnlineFilter] = useState(false);

  useEffect(() => {
    console.log("run this usde effect -->1111");
    handleFetchRequests();
  
  }, []);

  // useEffect(() => {
  //   if (socket) {
  //     socket.on(SocketEventEnum.VET_ONLINE_STATUS_CHANGE, async (data) => {
  //       const vetId = data?.vetId;
  //       const isOnline = data?.isOnline;

  //       updateExpertStatus(vetId, isOnline);
  //     });
  //   }

  //   return () => {
  //     socket?.off(SocketEventEnum.VET_ONLINE_STATUS_CHANGE);
  //   };
  // }, []);

  useEffect(() => {
    const run = async () => {
      // console.log("-------------------------------->",activeIndex)
       const afterRemove = expertFilter?.filter(
  (item) => item?.name !== "Ophthalmology" && item?.name !== "Orthopedic"
);
//  console.log("this is data ----> main daaaaaaaaaaaaaaaaaaaaaa",afterRemove?.[activeIndex])



      let specialityId = afterRemove?.[activeIndex]?.id;

//  if(expertFilter?.[activeIndex]?.name=="Ophthalmology"){
//     specialityId=expertFilter?.[3]?.id

  
//       }
//       if(expertFilter?.[activeIndex]?.name=="Orthopedic"){
//     specialityId=expertFilter?.[4]?.id
//       } 

      if (specialityId || isOnlineFilter) {
        await fetchExpertsBySpeciality({ specialityId, online: isOnlineFilter });
      } else {
        await fetchExperts();
      }
    };
    run();
  }, [activeIndex, expertFilter, isOnlineFilter]);

  const handleFetchRequests = async () => {
  // console.log("then come here 2---->")
    try {
      setIsLoading(true);
// console.log("then come here 3---->")
      await fetchExperts();
      // console.log("then come here 4---->")
      await fetchExpertFilter();
      // console.log("then come here 5---->")
  
      // setExperts(experts);
    } finally {
      setIsLoading(false);
    }
  };

  // Guard against stores returning null instead of arrays
  const safeExpertFilter = Array.isArray(expertFilter) ? expertFilter : [];
  const safeExperts = Array.isArray(experts) ? experts : [];

  const filterData = [{ id: "online", name: "Online" }, ...safeExpertFilter];
    // console.log("this is expert list111111111111111111 ",filterData?.length)
    // console.log("this is expert list111111111111111111-----> ",filterData?.length)
 const afterRemove = filterData?.filter(
  (item) => item?.name !== "Ophthalmology" && item?.name !== "Orthopedic"
);


// console.log("now check after remove -->22222222", afterRemove?.length);
// console.log("now check after remove -->22222222222222222222222->", afterRemove);

  return (
    <Layout
      showBack
      title="Chat with Expert"
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={isLoading}
    >
      <Div mt={10} mb={10}>
        <FlatList
          data={afterRemove}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item, index }) => {
            if (item.id === "online") {
              const isActive = isOnlineFilter;

              return (
                <Button
                  px={35}
                  py={10}
                  rounded={30}
                  bg={isActive ? "#17d34a" : "#F7F7F7"}
                  borderWidth={isActive ? 0 : 1}
                  borderColor="#E4E4E4"
                  color={isActive ? "#FFFFFF" : "#7A7A7A"}
                  fontFamily={isActive ? fontHauoraBold : fontHauora} // Bold when active
                  fontSize="md"
                  onPress={() => {
                    setIsOnlineFilter(!isOnlineFilter);
                    setActiveIndex(undefined); // Reset speciality when online selected
                  }}
                >
                  {item.name }
                </Button>
              );
            }

            const specialityIndex = index - 1; // subtract 1 because Online is at index 0
            const isActive = specialityIndex === activeIndex;

            return (
              <Button
                px={35}
                py={10}
                rounded={30}
                bg={isActive ? colorPrimary : "#F7F7F7"}
                borderWidth={isActive ? 0 : 1}
                borderColor="#E4E4E4"
                color={isActive ? "#FFFFFF" : "#7A7A7A"}
                fontFamily={isActive ? fontHauoraBold : fontHauora} // Bold when active
                fontSize="md"
                onPress={() => {
                  setActiveIndex(isActive ? undefined : specialityIndex);
                  setIsOnlineFilter(false); // Reset online when speciality selected
                }}
              >
              {item.name=="Pet Behaviours"?"Pet Behaviour":item.name }
              </Button>
            );
          }}
        />
      </Div>

      <FlatList
        data={[...safeExperts].sort((a, b) => (b.isOnline === true) - (a.isOnline === true))}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: 20 }}
        ListEmptyComponent={() => (
          <Div minH={350} justifyContent="flex-end">
            <Text
              fontSize={"5xl"}
              textAlign="center"
              fontFamily={fontCooper}
              maxW={"80%"}
              mx={"auto"}
              lineHeight={36}
            >
              No experts are available at the moment
            </Text>
          </Div>
        )}
        renderItem={({ item, index }) => (
          <DoctorListCard
            mb={index + 1 === experts?.length ? 0 : 20}
            name={item.name}
            speciality={item.designation}
            verified
            byAppointmentOnly={item.byAppointmentOnly}
            isOnline={item.isOnline}
            image={item.profileImg?.url}
            about={item?.about}
            nextAvailable="-"
            onCheckAvailability={() => {
              navigation.navigate("ExpertsListDetailScreen", {
                id: item.id,
              });
            }}
          />
        )}
        keyExtractor={(item, i) => `${i}`}
      />
    </Layout>
  );
};

export default ExpertsListScreen;
