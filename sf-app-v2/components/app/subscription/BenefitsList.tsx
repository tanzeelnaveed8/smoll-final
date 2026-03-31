import { fontHauoraBold, fontHauoraSemiBold } from "@/constant/constant";
import { Benefit } from "@/store/types/pet";
import { IconMinus, IconPlus } from "@tabler/icons-react-native";
import React, { useState } from "react";
import { Dimensions, Platform, Pressable, View } from "react-native";
import { Div, Image, Text } from "react-native-magnus";

interface BenefitsListProps {
  planFeatures: Benefit[];
}

const PlanRow = ({
  benefit,
  styles,
  expandable = false,
}: {
  benefit: { heading: string; icon: string; items: string[] };
  styles: any;
  expandable?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const width = Dimensions.get("window").width;

  return (
    <Pressable onPress={() => setExpanded((prev) => !prev)} style={{ ...styles }}>
      <Div flexDir="row" justifyContent="space-between" alignItems="center">
        <Div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
          flex={1}
        >
          <Div flexDir="row" style={{ gap: 10 }} alignItems="center">
            <Image w={20} h={20} source={benefit?.icon} />
            <Text
              numberOfLines={expanded ? 2 : 1}
              maxW={width - 180}
              fontSize={14}
              fontFamily={fontHauoraBold}
              color="#000"
            >
              {benefit?.heading}
            </Text>
          </Div>

          {expanded ? (
            <IconMinus size={18} color="#494949" />
          ) : (
            <IconPlus size={18} color="#494949" />
          )}
        </Div>
      </Div>
      {expanded && (
        <Div ml={34} mr={12} my={4} style={{ gap: 4 }}>
          {benefit?.items?.map((item, index) => (
            <Div key={index} flexDir="row" alignItems="center">
              <Text fontSize={"sm"} textAlignVertical="center" mr={4}>
                •
              </Text>
              <Text maxW={250} fontSize={"sm"} fontFamily={fontHauoraSemiBold}>
                {item}
              </Text>
            </Div>
          ))}
        </Div>
      )}
    </Pressable>
  );
};

export default function BenefitsList({ planFeatures }: BenefitsListProps) {
  const vaccineBenefits = [
    {
      heading: "No consultations fees, ever!",
      icon: require("@/assets/icons/benefits/stethoscope.png"),
      items: ["Consultations are included"],
    },
    {
      heading: "Annual Vaccines",
      icon: require("@/assets/icons/benefits/syringe.png"),
      items: [planFeatures[0].name, planFeatures[1].name, planFeatures[2].name],
    },
    {
      heading: "Unlimited access to vets & wellness experts",
      icon: require("@/assets/icons/benefits/telephone-receiver.png"),
      items: [
        "24/7 access to tele-vet consultations",
        "Behavioral advice, nutrition consults, minor follow-ups",
      ],
    },
    {
      heading: "Dental Check up",
      icon: require("@/assets/icons/benefits/tooth.png"),
      items: [planFeatures[3].name],
    },
    {
      heading: "Routine Diagnostics",
      icon: require("@/assets/icons/benefits/test-tube.png"),
      items: [planFeatures[4].name, planFeatures[5].name],
    },
    {
      heading: "Wellness Services",
      icon: require("@/assets/icons/benefits/soap.png"),
      items: [planFeatures[6].name, planFeatures[7].name, planFeatures[8].name],
    },
    {
      heading: "Health Records & Follow-Ups",
      icon: require("@/assets/icons/benefits/ledger.png"),
      items: [
        "Digital health record management",
        "Automated reminders for vaccination & checkups",
        "Follow-up consults on previously seen conditions",
      ],
    },
    {
      heading: "Predictable and Upfront Quotations",
      icon: require("@/assets/icons/benefits/umbrella-rain-drops.png"),
      items: ["No paperwork, no fine print, know what you pay, know what you get"],
    },
    {
      heading: "Peace of Mind",
      icon: require("@/assets/icons/benefits/person-getting-massage.png"),
      items: ["Never worry again about vet visit again"],
    },
  ];

  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 32,
        marginHorizontal: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: Platform.OS === "android" ? 5 : 0,
        marginBottom: 10,
      }}
    >
      {vaccineBenefits.map((item, index) => (
        <PlanRow
          key={index}
          benefit={item}
          styles={{
            borderBottomWidth: index !== vaccineBenefits.length - 1 ? 1 : 0,
            borderColor: "#c7c5c3",
            paddingBottom: index !== vaccineBenefits.length - 1 ? 16 : 0,
            marginBottom: index !== vaccineBenefits.length - 1 ? 8 : 0,
          }}
        />
      ))}
    </View>
  );
}
