
import React, { useCallback, useEffect, useState } from "react";
import Layout from "@/components/app/Layout";
import {
  fontCooper,
  fontCooperBold,
  fontHauoraBold,
  fontHauoraMedium,
  fontHauoraSemiBold,
  fontHeading,
} from "@/constant/constant";
import { usePetStore } from "@/store/modules/pet";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { IconChevronRight, IconSquareRoundedPlus } from "@tabler/icons-react-native";
import { FlatList, TouchableOpacity ,View,  } from "react-native";
import { Button, Div, Image, ScrollDiv, Skeleton, Text } from "react-native-magnus";
import { GroupProfiles } from "@/store/types/pet";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import rainbowImage from "../../assets//images/rainbow.png";
import AddButton from "@/components/partials/AddButton";
import ImageUpload from "@/components/partials/ImageUpload";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import api from "@/utils/api";
import { showMessage } from "react-native-flash-message";

const GroupProfile = () => {
   const route = useRoute();
   console.log("0000000000000000000000000",route?.params?.id)
     const navigation=useNavigation()
     const { fetchPets } = usePetStore();
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<GroupProfile>(null);

  useFocusEffect(
    useCallback(() => {
        
      fetchData(route?.params?.id);
    }, [route?.params?.id])
  );

  const fetchData = async (id:any) => {
    try {
      setLoading(true);
    //   const response = await fetchPets();
    console.log("idddd->",id)
      const response = await api.get(`/members/profile/${id}`)
 console.log("this is ==>",response?.data)
      setPets(
        response?.data

      );

    }catch(e){
        // console.log("-->",e?.response?.data?.message)
         showMessage({
              message:e?.response?.data?.message||"same thing went wrong please try again ",
              type: "success",
            });
    }  
    
    finally {
      setLoading(false);
    }
  };
console.log("pates",pets?.profileImg?.url)

  return (
    <Layout
      showBack
    //   title="My Pets"
      onBackPress={() => {
        navigation.goBack();
      }}
      loading={loading}
      
    >
   <Div
  flexDir="row"
  alignItems="center"
  mt={10}
  mb={20}
  px={10}
>
  {/* Profile Image */}
  {
    pets?.profileImg?.url?
     <Image
    source={{uri: pets?.profileImg?.url||"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}}     
    w={90}
    h={90}
    rounded="circle"
    mr={12}
    bg="grey"
  />:
    <Image
    source={require("../../assets/images/userother.png")}     
    w={90}
    h={90}
    rounded="circle"
    mr={12}
    bg="grey"
  />
  

  }
 

  <Div>
    <Text fontSize="lg" color="#000000" fontFamily={fontCooper}>
      Profile
    </Text>

    <Text fontSize="5xl" color="#000" fontFamily={fontHauoraMedium}>
      {pets?.name}
    </Text>
  </Div>
</Div>
  
    {
      pets?.pets?.length==0?
        <Div flex={1}   justifyContent="center" >
         
                 
    <Text fontSize={"4xl"} lineHeight={30} fontFamily={fontHeading} textAlign="center">
      There is no any pet available
        
    </Text>

    </Div>:
  
      <ScrollDiv style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Div flex={1} pt={20}  >
        
          <Div mb={18}>
            {pets?.pets &&
              pets?.pets.map((item, i) => {
                let image;
                for (let i = 0; i < item.photos.length; i++) {
                  if (item.photos[i]?.url) {
                    image = item.photos[i]?.url;
                  }
                }
                console.log("pets details-->",item)
                return (
                  <ProfileCard
                    image={image}
                    key={i}
                    name={item.name}
                    year={getAge(item?.dob)}
                      breed={item?.breed}
                    // careId={item?.careId}
                    isCarePet={Boolean(item.careId)}
                    isDeceased={item.isDeceased}
                    
                    onEnrollPress={() => {
                      navigation.navigate("PetProfileBenefitsScreen", {
                        petId: item?.id,
                      });
                    }}
                  />
                );
              })}
          </Div>
       
        </Div>
      </ScrollDiv>
        }
    </Layout>
  )
}

export default GroupProfile






export const ProfileCard: React.FC<{
  name: string;
  onPress: () => void;
  image?: string;
  careId?: string | null | undefined;
  isDeceased?: boolean;
  isCarePet?: boolean;
  year?:number
  breed?:string
  onEnrollPress?: () => void;
}> = ({ name, onPress, image, isDeceased, careId, isCarePet, onEnrollPress ,year,breed}) => {
  return (
    <View >
      <Div
        flexDir="row"
        alignItems="center"
        my={8}
        rounded={24}
        borderWidth={1}
        overflow="hidden"
        style={{
          borderColor: isCarePet ? "#6e99f0" : "#c7c5c3",
          backgroundColor: isCarePet ? "#6e99f0" : "#FAF8F5",
        }}
      >
        <Div p={12} flexDir="row" justifyContent="space-between" flex={1} rounded={24} bg="#FAF8F5">
          <Div flexDir="row">
            <Div w={68} h={62} justifyContent="center" alignItems="center">
              <Image
                src={
                  image
                    ? image
                    : "https://static.vecteezy.com/system/resources/thumbnails/004/141/669/small/no-photo-or-blank-image-icon-loading-images-or-missing-image-mark-image-not-available-or-image-coming-soon-sign-simple-nature-silhouette-in-frame-isolated-illustration-vector.jpg"
                }
                w={58}
                h={58}
                borderColor="#222"
                borderRadius={50}
                mr={20}
              />
            </Div>
            <Div ml={8} alignSelf="center">
              <Text
                fontSize={"xl"}
                color={isCarePet ? "#6e99f0" : "grey"}
                fontFamily={fontHauoraMedium}
                numberOfLines={1}
                ellipsizeMode="tail"
                maxW={130}
              >
                {name}
              </Text>
              <Text
                fontSize={"sm"}
                color={ "grey"}
                fontFamily={fontHauoraMedium}
                numberOfLines={1}
                ellipsizeMode="tail"
                maxW={170}
              >
                {`${year} ${breed}` }
              </Text>
            
            </Div>
          </Div>

          <Div flexDir="row" alignItems="center">
            {isDeceased && <Image ml="auto" mr={10} source={rainbowImage} h={55} w={100} />}
          
           
          </Div>
        </Div>
        

        <Div ml="auto" row={true} alignItems="center">
          {/* isCarPet  */}
          {!isDeceased && isCarePet && (
            <Div bg="#6e99f0" py={28} px={12}>
              <Image w={84} h={30} source={require("@/assets/icons/smollcare-member-logo.png")} />
            </Div>
          )}
        </Div>
      </Div>
    </View>
  );
};


const getAge = (dob: string) => {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust days if negative
  if (days < 0) {
    months--;
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += previousMonth;
  }

  // Adjust months if negative
  if (months < 0) {
    years--;
    months += 12;
  }

  // Priority 1 → Years
  if (years > 0) {
    return `${years} y/o`; // Example: 2 y/o
  }

  // Priority 2 → Months
  if (months > 0) {
    return `${months} m/o`; // Example: 7 m/o
  }

  // Priority 3 → Days
  return `${days} d/o`; // Example: 12 d/o
};