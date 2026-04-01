import { useAppVersion } from "@/app/hooks/useAppVersion";
import Layout from "@/components/app/Layout";
import ConfirmationModal from "@/components/partials/ConfirmationModal";
import SettingButton from "@/components/partials/SettingButton";
import { colorErrorText, fontHauora, fontHauoraSemiBold } from "@/constant/constant";
import { NavigationType } from "@/store/types";
import { logout } from "@/utils/chat.v2";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IconBell,
  IconChecklist,
  IconCreditCard,
  IconGavel,
  IconHelp,
  IconHistory,
  IconLogout,
  IconPaw,
  IconUserCircle,
  IconWorld,
} from "@tabler/icons-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Div, ScrollDiv, Text, Tag } from "react-native-magnus";
// import { OneSignal } from "react-native-onesignal";
import { SvgXml } from "react-native-svg";
import { useUserInfoStore } from "@/store/modules/userInfo";
import Smollcare from "@/components/icons/Smollcare";
import SmollVet from "@/components/icons/SmollVet";
import SmollBasic from "@/components/icons/SmollBasic";

interface OptionType {
  id: number;
  title: string;
  description?: string;
  toggleBtn?: boolean;
  iconFontSize?: number;
  link?: string;
  disabled?: boolean;
  externalLink?: boolean;
}

interface GroupType {
  id: number;
  groupName: string;
  options: OptionType[];
}

const options: GroupType[] = [
  {
    id: 1,
    groupName: "General",
    options: [
      {
        id: 1,
        title: "Personal Information",
        link: "SettingPersonalInfoScreen",
      },
      {
        id: 2,
        title: "Pets",
        link: "PetProfileListScreen",
      },
      { id: 3, title: "Quotations", link: "CasesQuotesListScreen" },
      { id: 4, title: "Recent Orders", link: "RecentOrdersScreen" },
    ],
  },
  {
    id: 2,
    groupName: "Settings",
    options: [
      {
        id: 4,
        title: "Push Notification",
        link: "",
      },
      {
        id: 3,
        title: "Language (soon)",
        disabled: true,
        externalLink: true,
        link: "/",
      },
    ],
  },
  {
    id: 3,
    groupName: "Privacy & Help",
    options: [
      {
        id: 2,
        title: "Legal",
        externalLink: true,
        link: "https://smoll.me/terms-and-conditions",
      },
      {
        id: 3,
        title: "Help",
        externalLink: true,
        link: "https://smoll.me/help",
      },
    ],
  },
];

const getOptionIcon = (title: string): React.ReactElement | undefined => {
  const iconSize = 26;
  const iconColor = "#222222";

  switch (title) {
    case "Personal Information":
      return <IconUserCircle size={iconSize} color={iconColor} />;
    case "Pets":
      return <IconPaw size={iconSize} color={iconColor} />;
    case "Quotations":
      return <IconChecklist size={iconSize} color={iconColor} />;
    case "Push Notification":
      return <IconBell size={iconSize} color={iconColor} />;
    case "Language (soon)":
      return <IconWorld size={iconSize} color={iconColor} />;
    case "Legal":
      return <IconGavel size={iconSize} color={iconColor} />;
    case "Help":
      return <IconHelp size={iconSize} color={iconColor} />;
    case "Recent Orders":
      return <IconHistory size={iconSize} color={iconColor} />;
    default:
      return undefined;
  }
};

// SVG content for membership cards
const basicSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="229.233" height="38" viewBox="0 0 229.233 38">
  <g id="Group_5277" data-name="Group 5277" transform="translate(4988.528 -17333.26)">
    <path id="Path_9244" data-name="Path 9244" d="M-68.427-23.743c0,.883-.9,1.485-2.58,1.485a14.96,14.96,0,0,1-7.413-2.488v5.177a16.26,16.26,0,0,0,7.453,1.726c5.529,0,8.559-2.769,8.559-6.421,0-2.568-1.351-4.374-4.669-5.458l-4.3-1.4c-1.024-.321-1.515-.843-1.515-1.445,0-.843.737-1.445,2.293-1.445a12.635,12.635,0,0,1,6.8,2.247v-5.257a14.324,14.324,0,0,0-6.675-1.565c-5.078,0-8.273,2.649-8.273,6.581,0,2.689,1.72,4.535,4.546,5.417l3.972,1.244C-68.878-24.907-68.427-24.425-68.427-23.743Zm19.125-9.39c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6a4.275,4.275,0,0,0-.041-.722,4.9,4.9,0,0,1,3.768-1.605c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6c0-4.575-2.621-7.865-7.617-7.865a8.486,8.486,0,0,0-7,3.411c-1.188-2.127-3.358-3.411-6.43-3.411a8.069,8.069,0,0,0-6.184,2.608V-38.23h-6.307v20.025h6.471V-31.568A4.9,4.9,0,0,1-49.3-33.133Zm26.292,4.976c0,5.979,4.792,10.353,11.016,10.353S-.773-22.258-.773-28.278c0-5.979-4.71-10.353-11.016-10.353C-18.055-38.631-23.01-34.177-23.01-28.157Zm15.931,0c0,3.05-2.048,5.177-4.792,5.177A4.853,4.853,0,0,1-16.7-28.157a4.853,4.853,0,0,1,4.832-5.177C-9.127-33.334-7.08-31.207-7.08-28.157Zm9.255,9.952H8.687V-47.58L2.176-46.9Zm10.566,0h6.512V-47.58l-6.512.682Z" transform="translate(-4909.781 17380.84)"/>
    <path id="Path_9245" data-name="Path 9245" d="M-27.47-110.159h-.857v1.564h.857a2.02,2.02,0,0,0,1.017-.18.692.692,0,0,0,.278-.63.615.615,0,0,0-.314-.572A2.023,2.023,0,0,0-27.47-110.159Zm.112-.39a2.515,2.515,0,0,1,1.349.282.979.979,0,0,1,.431.882,1.043,1.043,0,0,1-.283.744,1.185,1.185,0,0,1-.752.355l.969,1.964h-.668l-.928-1.884h-1.086v1.884h-.586v-4.227Zm3.248,2.169a3.235,3.235,0,0,0-.25-1.262,3.246,3.246,0,0,0-.719-1.062,3.347,3.347,0,0,0-1.1-.722,3.424,3.424,0,0,0-1.3-.247,3.382,3.382,0,0,0-1.282.245,3.223,3.223,0,0,0-1.068.7,3.437,3.437,0,0,0-.742,1.089,3.169,3.169,0,0,0-.258,1.254,3.143,3.143,0,0,0,.255,1.247,3.294,3.294,0,0,0,.734,1.067,3.4,3.4,0,0,0,1.089.722,3.293,3.293,0,0,0,1.272.252,3.341,3.341,0,0,0,1.282-.255,3.486,3.486,0,0,0,1.109-.73,3.151,3.151,0,0,0,.722-1.047A3.2,3.2,0,0,0-24.11-108.38Zm-3.36-3.653a3.812,3.812,0,0,1,1.441.275,3.65,3.65,0,0,1,1.211.8,3.475,3.475,0,0,1,.8,1.174,3.632,3.632,0,0,1,.275,1.4,3.576,3.576,0,0,1-.273,1.4,3.449,3.449,0,0,1-.8,1.159,3.87,3.87,0,0,1-1.231.812,3.7,3.7,0,0,1-1.42.282A3.673,3.673,0,0,1-28.882-105a3.723,3.723,0,0,1-1.209-.807,3.589,3.589,0,0,1-.816-1.179,3.513,3.513,0,0,1-.28-1.389,3.518,3.518,0,0,1,.286-1.394,3.8,3.8,0,0,1,.821-1.2,3.527,3.527,0,0,1,1.183-.784A3.776,3.776,0,0,1-27.47-112.033Z" transform="translate(-4856.069 17445.293)"/>
    <text id="Basic" transform="translate(-4884.295 17333.26)" font-size="28" font-family="Hauora-Light, Hauora" font-weight="300" letter-spacing="0em"><tspan x="0" y="30">Basic</tspan></text>
  </g>
</svg>`;

const vetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="153.233" height="38" viewBox="0 0 153.233 38">
  <g id="Group_5276" data-name="Group 5276" transform="translate(4988.528 -17333.26)">
    <path id="Path_9244" data-name="Path 9244" d="M-68.427-23.743c0,.883-.9,1.485-2.58,1.485a14.96,14.96,0,0,1-7.413-2.488v5.177a16.26,16.26,0,0,0,7.453,1.726c5.529,0,8.559-2.769,8.559-6.421,0-2.568-1.351-4.374-4.669-5.458l-4.3-1.4c-1.024-.321-1.515-.843-1.515-1.445,0-.843.737-1.445,2.293-1.445a12.635,12.635,0,0,1,6.8,2.247v-5.257a14.324,14.324,0,0,0-6.675-1.565c-5.078,0-8.273,2.649-8.273,6.581,0,2.689,1.72,4.535,4.546,5.417l3.972,1.244C-68.878-24.907-68.427-24.425-68.427-23.743Zm19.125-9.39c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6a4.275,4.275,0,0,0-.041-.722,4.9,4.9,0,0,1,3.768-1.605c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6c0-4.575-2.621-7.865-7.617-7.865a8.486,8.486,0,0,0-7,3.411c-1.188-2.127-3.358-3.411-6.43-3.411a8.069,8.069,0,0,0-6.184,2.608V-38.23h-6.307v20.025h6.471V-31.568A4.9,4.9,0,0,1-49.3-33.133Zm26.292,4.976c0,5.979,4.792,10.353,11.016,10.353S-.773-22.258-.773-28.278c0-5.979-4.71-10.353-11.016-10.353C-18.055-38.631-23.01-34.177-23.01-28.157Zm15.931,0c0,3.05-2.048,5.177-4.792,5.177A4.853,4.853,0,0,1-16.7-28.157a4.853,4.853,0,0,1,4.832-5.177C-9.127-33.334-7.08-31.207-7.08-28.157Zm9.255,9.952H8.687V-47.58L2.176-46.9Zm10.566,0h6.512V-47.58l-6.512.682Z" transform="translate(-4909.781 17380.84)" fill="#fff"/>
    <path id="Path_9245" data-name="Path 9245" d="M-27.47-110.159h-.857v1.564h.857a2.02,2.02,0,0,0,1.017-.18.692.692,0,0,0,.278-.63.615.615,0,0,0-.314-.572A2.023,2.023,0,0,0-27.47-110.159Zm.112-.39a2.515,2.515,0,0,1,1.349.282.979.979,0,0,1,.431.882,1.043,1.043,0,0,1-.283.744,1.185,1.185,0,0,1-.752.355l.969,1.964h-.668l-.928-1.884h-1.086v1.884h-.586v-4.227Zm3.248,2.169a3.235,3.235,0,0,0-.25-1.262,3.246,3.246,0,0,0-.719-1.062,3.347,3.347,0,0,0-1.1-.722,3.424,3.424,0,0,0-1.3-.247,3.382,3.382,0,0,0-1.282.245,3.223,3.223,0,0,0-1.068.7,3.437,3.437,0,0,0-.742,1.089,3.169,3.169,0,0,0-.258,1.254,3.143,3.143,0,0,0,.255,1.247,3.294,3.294,0,0,0,.734,1.067,3.4,3.4,0,0,0,1.089.722,3.293,3.293,0,0,0,1.272.252,3.341,3.341,0,0,0,1.282-.255,3.486,3.486,0,0,0,1.109-.73,3.151,3.151,0,0,0,.722-1.047A3.2,3.2,0,0,0-24.11-108.38Zm-3.36-3.653a3.812,3.812,0,0,1,1.441.275,3.65,3.65,0,0,1,1.211.8,3.475,3.475,0,0,1,.8,1.174,3.632,3.632,0,0,1,.275,1.4,3.576,3.576,0,0,1-.273,1.4,3.449,3.449,0,0,1-.8,1.159,3.87,3.87,0,0,1-1.231.812,3.7,3.7,0,0,1-1.42.282A3.673,3.673,0,0,1-28.882-105a3.723,3.723,0,0,1-1.209-.807,3.589,3.589,0,0,1-.816-1.179,3.513,3.513,0,0,1-.28-1.389,3.518,3.518,0,0,1,.286-1.394,3.8,3.8,0,0,1,.821-1.2,3.527,3.527,0,0,1,1.183-.784A3.776,3.776,0,0,1-27.47-112.033Z" transform="translate(-4856.069 17445.293)" fill="#fff"/>
    <text id="Vet" transform="translate(-4884.295 17333.26)" fill="#fff" font-size="28" font-family="Hauora-Light, Hauora" font-weight="300" letter-spacing="0em"><tspan x="0" y="30">Vet</tspan></text>
  </g>
</svg>`;

const careSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="189.817" height="34.199" viewBox="0 0 189.817 34.199">
  <g id="Group_5091" data-name="Group 5091" transform="translate(4501 2143.588)">
    <path id="Path_9244" data-name="Path 9244" d="M-66.894-20.2c0,1.014-1.035,1.705-2.963,1.705a17.182,17.182,0,0,1-8.514-2.858v5.946a18.675,18.675,0,0,0,8.561,1.982c6.35,0,9.831-3.18,9.831-7.374,0-2.95-1.552-5.024-5.362-6.268l-4.939-1.613c-1.176-.369-1.74-.968-1.74-1.659,0-.968.847-1.659,2.634-1.659a14.512,14.512,0,0,1,7.808,2.581v-6.038a16.452,16.452,0,0,0-7.667-1.8c-5.832,0-9.5,3.042-9.5,7.559,0,3.088,1.976,5.208,5.221,6.222l4.562,1.429C-67.412-21.539-66.894-20.986-66.894-20.2Zm21.966-10.785c2.446,0,3.857,1.659,3.857,4.1v13.043h7.432V-28.314a4.909,4.909,0,0,0-.047-.83,5.629,5.629,0,0,1,4.327-1.844c2.446,0,3.857,1.659,3.857,4.1v13.043h7.432V-28.314c0-5.254-3.01-9.034-8.749-9.034a9.747,9.747,0,0,0-8.043,3.918c-1.364-2.443-3.857-3.918-7.385-3.918a9.268,9.268,0,0,0-7.1,3v-2.489h-7.244v23h7.432V-29.19A5.623,5.623,0,0,1-44.929-30.988Zm30.2,5.715c0,6.867,5.5,11.891,12.653,11.891S10.809-18.5,10.809-25.411C10.809-32.278,5.4-37.3-1.844-37.3-9.04-37.3-14.732-32.186-14.732-25.273Zm18.3,0c0,3.5-2.352,5.946-5.5,5.946s-5.55-2.443-5.55-5.946,2.4-5.946,5.55-5.946S3.565-28.775,3.565-25.273ZM14.2-13.842h7.479V-47.58L14.2-46.8Zm12.135,0h7.479V-47.58l-7.479.784Z" transform="translate(-4422.252 -2096.007)" fill="#679FF0"/>
    <path id="Path_9245" data-name="Path 9245" d="M-26.918-109.881H-27.9v1.8h.984a2.321,2.321,0,0,0,1.168-.207.8.8,0,0,0,.319-.723.706.706,0,0,0-.36-.657A2.324,2.324,0,0,0-26.918-109.881Zm.129-.448A2.889,2.889,0,0,1-25.24-110a1.124,1.124,0,0,1,.495,1.013,1.2,1.2,0,0,1-.325.855,1.361,1.361,0,0,1-.864.407l1.113,2.255h-.767l-1.066-2.164H-27.9v2.164h-.674v-4.855Zm3.731,2.491a3.716,3.716,0,0,0-.287-1.449,3.729,3.729,0,0,0-.826-1.22,3.844,3.844,0,0,0-1.259-.829,3.932,3.932,0,0,0-1.488-.284,3.885,3.885,0,0,0-1.473.281,3.7,3.7,0,0,0-1.227.809,3.947,3.947,0,0,0-.852,1.251,3.64,3.64,0,0,0-.3,1.44,3.609,3.609,0,0,0,.293,1.432,3.784,3.784,0,0,0,.843,1.225,3.91,3.91,0,0,0,1.25.829,3.783,3.783,0,0,0,1.461.29,3.837,3.837,0,0,0,1.473-.293,4,4,0,0,0,1.274-.838,3.619,3.619,0,0,0,.829-1.2A3.679,3.679,0,0,0-23.058-107.838Zm-3.859-4.2a4.378,4.378,0,0,1,1.654.316,4.192,4.192,0,0,1,1.391.918,3.991,3.991,0,0,1,.919,1.349,4.171,4.171,0,0,1,.316,1.613,4.107,4.107,0,0,1-.313,1.607,3.961,3.961,0,0,1-.922,1.331,4.445,4.445,0,0,1-1.414.933,4.245,4.245,0,0,1-1.631.324,4.218,4.218,0,0,1-1.622-.318,4.276,4.276,0,0,1-1.388-.927,4.123,4.123,0,0,1-.937-1.354,4.035,4.035,0,0,1-.322-1.6,4.041,4.041,0,0,1,.328-1.6,4.359,4.359,0,0,1,.943-1.383,4.05,4.05,0,0,1,1.359-.9A4.337,4.337,0,0,1-26.918-112.033Z" transform="translate(-4353.499 -2031.555)" fill="#679FF0"/>
    <path id="Path_91970" data-name="Path 91970" d="M12.1,42.32c5.362,0,8.724-3.009,9.924-7.651l-1.9-.464c-.992,3.858-3.682,6.307-8.019,6.307-5.666,0-8.58-4.194-8.515-10.2.048-6,2.849-10.2,8.515-10.2,4.338,0,7.027,2.449,8.019,6.307l1.9-.464c-1.2-4.642-4.562-7.651-9.924-7.651-6.9,0-10.484,4.946-10.484,12S5.205,42.32,12.1,42.32Zm18.44,0a7.439,7.439,0,0,0,6.739-3.489V41.84h1.681V31.067A10.457,10.457,0,0,0,38.5,27.61c-.848-2.225-3.105-3.537-6.275-3.537-3.746,0-6.195,1.745-6.979,4.882l1.889.528c.672-2.465,2.385-3.633,5.026-3.633,3.6,0,4.962,1.7,4.978,5.218-2.049.256-5.474.624-8,1.184-2.513.592-4.546,2.049-4.546,4.978C24.589,39.951,26.558,42.32,30.544,42.32Zm.1-1.7c-3.105,0-4.162-1.793-4.162-3.377,0-2.113,1.761-3.025,3.281-3.425a55.872,55.872,0,0,1,7.363-1.056,16.609,16.609,0,0,1-.192,2.753C36.482,38.606,34.161,40.623,30.64,40.623ZM43.125,41.84h1.857V33.276c0-2.1.128-4.546,1.9-6.082a4.825,4.825,0,0,1,4.338-.9V24.553a5.619,5.619,0,0,0-6.419,2.721V24.553H43.125Zm17.943.48a7.974,7.974,0,0,0,7.507-4.674l-1.665-.736a6.246,6.246,0,0,1-5.874,3.617c-3.73,0-5.906-2.481-6.066-6.8H68.944c.08-6.066-2.865-9.652-7.907-9.652-4.962,0-8.051,3.489-8.051,9.156C52.985,38.8,56.106,42.32,61.068,42.32Zm0-16.5c3.489,0,5.522,2.177,5.89,6.243H55C55.338,28.074,57.483,25.817,61.068,25.817Z" transform="translate(-4380.128 -2151.88)" fill="#679FF0"/>
  </g>
</svg>`;

const vites=`<svg xmlns="http://www.w3.org/2000/svg" width="153.233" height="38" viewBox="0 0 153.233 38">
  <g id="Group_5276" data-name="Group 5276" transform="translate(4988.528 -17333.26)">
    <path id="Path_9244" data-name="Path 9244" d="M-68.427-23.743c0,.883-.9,1.485-2.58,1.485a14.96,14.96,0,0,1-7.413-2.488v5.177a16.26,16.26,0,0,0,7.453,1.726c5.529,0,8.559-2.769,8.559-6.421,0-2.568-1.351-4.374-4.669-5.458l-4.3-1.4c-1.024-.321-1.515-.843-1.515-1.445,0-.843.737-1.445,2.293-1.445a12.635,12.635,0,0,1,6.8,2.247v-5.257a14.324,14.324,0,0,0-6.675-1.565c-5.078,0-8.273,2.649-8.273,6.581,0,2.689,1.72,4.535,4.546,5.417l3.972,1.244C-68.878-24.907-68.427-24.425-68.427-23.743Zm19.125-9.39c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6a4.275,4.275,0,0,0-.041-.722,4.9,4.9,0,0,1,3.768-1.605c2.13,0,3.358,1.445,3.358,3.572v11.357h6.471v-12.6c0-4.575-2.621-7.865-7.617-7.865a8.486,8.486,0,0,0-7,3.411c-1.188-2.127-3.358-3.411-6.43-3.411a8.069,8.069,0,0,0-6.184,2.608V-38.23h-6.307v20.025h6.471V-31.568A4.9,4.9,0,0,1-49.3-33.133Zm26.292,4.976c0,5.979,4.792,10.353,11.016,10.353S-.773-22.258-.773-28.278c0-5.979-4.71-10.353-11.016-10.353C-18.055-38.631-23.01-34.177-23.01-28.157Zm15.931,0c0,3.05-2.048,5.177-4.792,5.177A4.853,4.853,0,0,1-16.7-28.157a4.853,4.853,0,0,1,4.832-5.177C-9.127-33.334-7.08-31.207-7.08-28.157Zm9.255,9.952H8.687V-47.58L2.176-46.9Zm10.566,0h6.512V-47.58l-6.512.682Z" transform="translate(-4909.781 17380.84)" fill="#405B7A"/>
    <path id="Path_9245" data-name="Path 9245" d="M-27.47-110.159h-.857v1.564h.857a2.02,2.02,0,0,0,1.017-.18.692.692,0,0,0,.278-.63.615.615,0,0,0-.314-.572A2.023,2.023,0,0,0-27.47-110.159Zm.112-.39a2.515,2.515,0,0,1,1.349.282.979.979,0,0,1,.431.882,1.043,1.043,0,0,1-.283.744,1.185,1.185,0,0,1-.752.355l.969,1.964h-.668l-.928-1.884h-1.086v1.884h-.586v-4.227Zm3.248,2.169a3.235,3.235,0,0,0-.25-1.262,3.246,3.246,0,0,0-.719-1.062,3.347,3.347,0,0,0-1.1-.722,3.424,3.424,0,0,0-1.3-.247,3.382,3.382,0,0,0-1.282.245,3.223,3.223,0,0,0-1.068.7,3.437,3.437,0,0,0-.742,1.089,3.169,3.169,0,0,0-.258,1.254,3.143,3.143,0,0,0,.255,1.247,3.294,3.294,0,0,0,.734,1.067,3.4,3.4,0,0,0,1.089.722,3.293,3.293,0,0,0,1.272.252,3.341,3.341,0,0,0,1.282-.255,3.486,3.486,0,0,0,1.109-.73,3.151,3.151,0,0,0,.722-1.047A3.2,3.2,0,0,0-24.11-108.38Zm-3.36-3.653a3.812,3.812,0,0,1,1.441.275,3.65,3.65,0,0,1,1.211.8,3.475,3.475,0,0,1,.8,1.174,3.632,3.632,0,0,1,.275,1.4,3.576,3.576,0,0,1-.273,1.4,3.449,3.449,0,0,1-.8,1.159,3.87,3.87,0,0,1-1.231.812,3.7,3.7,0,0,1-1.42.282A3.673,3.673,0,0,1-28.882-105a3.723,3.723,0,0,1-1.209-.807,3.589,3.589,0,0,1-.816-1.179,3.513,3.513,0,0,1-.28-1.389,3.518,3.518,0,0,1,.286-1.394,3.8,3.8,0,0,1,.821-1.2,3.527,3.527,0,0,1,1.183-.784A3.776,3.776,0,0,1-27.47-112.033Z" transform="translate(-4856.069 17445.293)" fill="#405B7A"/>
    <text id="Vet" transform="translate(-4884.295 17333.26)" fill="#405B7A" font-size="28" font-family="Hauora-Light, Hauora" font-weight="300" letter-spacing="0em"><tspan x="0" y="30">Vet</tspan></text>
  </g>
</svg>
`;

// Todos:
// 1. Person icon needs to be changed
// 2. Remaining icons needs to be added
const SettingsMainScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const userInfo = useUserInfoStore((state) => state.userInfo);
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(false);
  const [subscription, setSubscription] = useState<string>('smollBasic');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Get subscription from AsyncStorage like HomeScreen does
  const getSubscription = async () => {
    const subscriptionData: any = await AsyncStorage.getItem("subscription");
    console.log("Settings subscription:", subscriptionData);
    const finalSubscription = subscriptionData || 'smollBasic';
    setSubscription(finalSubscription);
   
  };
  

  const checkPushNotificationStatus = useCallback(async () => {
    // const deviceState = await OneSignal.Notifications.getPermissionAsync();
    // setPushNotificationEnabled(deviceState ?? false);
  }, []);

  const { version, buildNumber } = useAppVersion();

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    // Check status on initial mount
    checkPushNotificationStatus();
    getSubscription(); // Get subscription from AsyncStorage

    return () => {
      subscription.remove();
    };
  }, []);

  // Refresh subscription when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // getSubscription();
    }, [])
  );

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("App has come to the foreground!");
        checkPushNotificationStatus();
        getSubscription(); // Refresh subscription data when app comes to foreground
      }
    },
    [checkPushNotificationStatus]
  );

  const handlePushNotificationToggle = async (newValue: boolean) => {
    if (newValue) {
      // const deviceState = await OneSignal.Notifications.getPermissionAsync();

      // if (!deviceState) {
      //   const status = await OneSignal.Notifications.requestPermission(true);

      //   setPushNotificationEnabled(status);
      // } else {
      //   setPushNotificationEnabled(true);
      // }
    } else {
      // For turning off, we can't revoke permissions programmatically
      // So we'll just update the UI state
      Alert.alert(
        "Push Notifications",
        "Please go to your device settings to turn off push notifications.\n\nNote: This will disable all push notifications from the app, even the chat notifications.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Settings", onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    
    await AsyncStorage.setItem("subscription", "");
    await AsyncStorage.setItem("accessToken", "");
    AsyncStorage.removeItem("hideAccountSetupBtn");

    navigation.navigate("NewOnboardingScreen");
    logout();
    
  };

  // Get membership card properties based on subscription type

  const getMembershipCardProps = () => {
    const backgroundColor = subscription === "smollCare"
      ? "#6e99f0"
      : subscription === "smollVet"
      ? "#405B7A"
      : "#fff"; // smollBasic

    const borderColor = subscription === "smollCare"
      ? "#6e99f0"
      : subscription === "smollVet"
      ? "#405B7A"
      : "#000"; // smollBasic

   

    const { width, height } = subscription === "smollCare"
      ? { width: 189, height: 34 }
      : subscription === "smollVet"
      ? { width: 210, height: 50 }
      : { width: 229, height: 38 }; 

      // smollBasic
 const planSvg = subscription === "smollCare"
      ? <Smollcare height={height} width={width} fillColor="#679FF0" />
      : subscription === "smollVet"
      ? <SmollVet height={height} width={width} fillColor="#405B7A" />
      : <SmollBasic height={height} width={width} />; // smollBasic
    return { backgroundColor, borderColor, planSvg, width, height };
  };
 


  const { backgroundColor, borderColor, planSvg, width, height } = getMembershipCardProps();

  const getSubscriptionInfo = () => {
    const date = new Date(userInfo?.validUntil || '');
    console.log("this is date--->",date)
    let formattedDate = date
  .toLocaleDateString("en-GB") // gives DD/MM/YYYY              
  .replace(/\//g, ".");

  switch (subscription) {
    
    case "smollBasic":
      return { text: "Valid forever!", color: "#000000" };
    case "smollCare":
      return { text: `Valid until ${formattedDate}`, color: "#679FF0" };
    case "smollVet":
      return { text: `Valid until ${formattedDate}`, color: "#405B7A" };
    default:
      return { text: "Valid until 24.09.2026", color: "#405B7A"};
  }}
  
const { text, color } = getSubscriptionInfo(); 
  return (
    <Layout showBack onBackPress={() => navigation.goBack()} title="You">
      <ScrollDiv showsVerticalScrollIndicator={false}>
        {/* Membership Card */}
        <TouchableOpacity
          onPress={() => navigation.navigate("SubscriptionScreen")}
          activeOpacity={0.7}
        >
          <Div>
            <Text
              fontWeight="400"
              color="#000"
              fontSize={"lg"}
              fontFamily={fontHauora}
              lineHeight={24}
              mb={8}
            >
              Your Membership
            </Text>

            <Div flex={1} justifyContent="space-between">
              {planSvg}
            </Div>

            <Text
              fontWeight="400"
              color={color}
              fontSize="lg"
              fontFamily={fontHauora}
              lineHeight={24}
              mb={8}
              mt={5}
            >
              {text}
            </Text>
          </Div>
        </TouchableOpacity>
        


        {options.map((group) => (
          <Div key={`${group?.id}`} mb={20} borderBottomWidth={1} borderBottomColor="#E0E0E0">
            <Text
              fontWeight="400"
              color="#000000"
              fontSize={"lg"}
              fontFamily={fontHauora}
              lineHeight={24}
              mb={8}
            >
              {group.groupName}
            </Text>
            <Div>
              {group.options.map((option) => (
                <SettingButton
                  key={`${option?.id}`}
                  title={option.title}
                  icon={getOptionIcon(option.title)}
                  description={option?.description}
                  toggleBtn={option.title === "Push Notification"}
                  disabled={option?.disabled}
                  onPress={() => {
                    if (option.externalLink) {
                      Linking.openURL(option.link as string);
                    } else if (option.title === "Push Notification") {
                      handlePushNotificationToggle(!pushNotificationEnabled);
                    } else if (option.link) {
                      navigation.navigate(option.link);
                    }
                  }}
                  toggleValue={
                    option.title === "Push Notification" ? pushNotificationEnabled : undefined
                  }
                />
              ))}
            </Div>
          </Div>
        ))}

        <Div mt="auto" my={20}>
          <TouchableOpacity onPress={() => setShowLogoutModal(true)} style={{ marginBottom: 10 }}>
            <Div flexDir="row" alignItems="center">
              <Div mr={12} mt={3}>
                <IconLogout size={26} color="#000000" />
              </Div>
              <Text fontSize={"lg"} fontFamily={fontHauoraSemiBold} lineHeight={24} color="#000000">
                Logout
              </Text>
            </Div>
          </TouchableOpacity>

          <Text
            fontWeight="400"
            fontSize={"lg"}
            fontFamily={fontHauora}
            lineHeight={16}
            mb={6}
            color="#7B7B7B"
            mt={10}
          >
            App v {version} {Platform.OS === "ios" ? `(${buildNumber})` : ""}
          </Text>
        </Div>
      </ScrollDiv>

      <ConfirmationModal
        heading="Logout?"
        text="Are you sure you want to logout?"
        isLoading={false}
        showModal={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmText="Confirm"
        cancelText="Cancel"
        confirmBgColor={colorErrorText}
        cancelBgColor="#222"
      />
    </Layout>
  );
};

export default SettingsMainScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
