import { fontHauoraSemiBold } from "@/constant/constant";
import { useRoute } from "@react-navigation/native";
import { IconChecklist, IconMessage, IconWindow } from "@tabler/icons-react-native";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Div, Text } from "react-native-magnus";

const tabList = [
  {
    name: "Home",
    link: "HomeScreen",
    icon: (active?: boolean) => (
      <IconWindow width={28} height={28} color={active ? "#000" : "#494949"} />
    ),
  },
  {
    name: "Chats",
    link: "ExpertsInboxScreen",
    // link: "CounsellingChatScreen",
    icon: (active?: boolean) => (
      <IconMessage width={28} height={28} color={active ? "#000" : "#494949"} />
    ),
  },
  {
    name: "Quotations",
    link: "CasesQuotesListScreen",
    // link: "PartnerVetDetailScreen",
    icon: (active?: boolean) => (
      <IconChecklist width={28} height={28} color={active ? "#000" : "#494949"} />
    ),
  },
];

const TabNavigationBar: React.FC<{
  navigation: any;
}> = ({ navigation }) => {
  const route = useRoute();

  return (
    <Div borderTopWidth={0} borderColor="#dcdcdc14">
      <Div flexDir="row" justifyContent="space-around" bg="transparent" px={25} pb={10}>
        {tabList.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={{
              flexDirection: "column",
              alignItems: "center",
            }}
            onPress={() => {
              navigation.navigate(item.link);
            }}
          >
            <Div
              h={4}
              bg={route.name === item.link ? "#000" : "transparent"}
              w={60}
              style={{ borderBottomRightRadius: 4, borderBottomLeftRadius: 4 }}
            />
            <Div>{item.icon(route.name === item.link)}</Div>
            <Text
              fontSize={"md"}
              fontFamily={fontHauoraSemiBold}
              color={route.name === item.link ? "#000" : "#494949"}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </Div>
    </Div>
  );
};

export default TabNavigationBar;
