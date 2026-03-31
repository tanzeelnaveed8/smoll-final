import { colorErrorText, colorPrimary, colorSuccessText } from "@/constant/constant";
import { CaseDetail, CaseStatusEnum } from "@/store/types/case.d";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import { IMessage } from "react-native-gifted-chat";
import {
  ZIMAudioMessage,
  ZIMFileMessage,
  ZIMImageMessage,
  ZIMMessage,
  ZIMMessageType,
  ZIMTextMessage,
  ZIMVideoMessage,
} from "zego-zim-react-native";

export const getCountryCode = (input: string) => {
  // Use a regular expression to match the country code
  const match = input.match(/\((\+\d+)\)/);

  if (match) {
    // Return the country code (including the + symbol)
    return match[1];
  } else {
    // If no match is found, return an empty string
    return "";
  }
};

export const getAxiosErrMsg = (error: AxiosError<any, any>) => {
  if (Array.isArray(error.response?.data?.message)) {
    return error.response?.data?.message[0];
  }

  return error.response?.data?.message;
};

export const getCaseStatusLabel = (
  status?: CaseStatusEnum,
  scheduledAt?: string,
  isEmergency?: boolean,
  isDirectEscalated?: boolean
) => {
  if (scheduledAt) {
    const currentTime = dayjs();
    const scheduledTime = dayjs(scheduledAt);

    if (currentTime.isBefore(scheduledTime) && status === CaseStatusEnum.CLOSED) {
      return "Scheduled Cancelled";
    }

    if (currentTime.isAfter(scheduledTime.add(35, "minute"))) {
      return "Scheduled Expired";
    }

    return status === CaseStatusEnum.OPEN ? "Scheduled" : "Scheduled Closed";
  }

  switch (status) {
    case CaseStatusEnum.OPEN_ESCALATED:
      if (isEmergency) {
        return "Emergency";
      }

      if (isDirectEscalated) {
        return "Direct Escalated";
      }

      return "Escalated";
    case CaseStatusEnum.CLOSED:
      return "Closed";
    case CaseStatusEnum.OPEN:
      return "Open";
    default:
      return "";
  }
};

export const getCaseStatusColor = (
  status?: CaseStatusEnum,
  scheduledAt?: string,
  isEmergency?: boolean
) => {
  if (scheduledAt) {
    const currentTime = dayjs();
    const scheduledTime = dayjs(scheduledAt);

    if (currentTime.isAfter(scheduledTime.add(35, "minute"))) {
      return colorErrorText;
    }

    if (currentTime.isBefore(scheduledTime) && status === CaseStatusEnum.CLOSED) {
      return colorErrorText;
    }

    return colorSuccessText;
  }

  switch (status) {
    case CaseStatusEnum.OPEN_ESCALATED: {
      if (isEmergency) {
        return colorErrorText;
      }

      return colorPrimary;
    }
    case CaseStatusEnum.CLOSED:
      return colorSuccessText;
    default:
      return colorPrimary;
  }
};

export const hasAvailabilityDateTimePassed = (date: string, time: string): boolean => {
  // const dateTime = dayjs(`${date}T${time}Z`); // need to test it
  // const timeOnly = dateTime.format("HH:mm");
  // const currentTimeOnly = dayjs().format("HH:mm");

  // // If it's not today, it hasn't passed
  // if (dayjs(date).date() !== dayjs().date()) {
  //   return false;
  // }

  // // console.log("currentTimeOnly", currentTimeOnly, "timeOnly", timeOnly);

  // // For today, compare times
  // return currentTimeOnly > time;

  const dateTime = dayjs(`${date}T${time}Z`);
  // console.log("dateTime = ", dateTime);
  const timeOnly = dateTime.format("HH:mm");
  const currentTimeOnly = dayjs().format("HH:mm");

  // If it's not today, it hasn't passed
  if (dayjs(date).date() !== dayjs().date()) {
    return false;
  }

  // For today, compare times
  return currentTimeOnly > timeOnly;
};

export const getUserTimezoneOffset = () => {
  const date = new Date();
  const timezoneOffset = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(timezoneOffset) / 60);
  const minutes = Math.abs(timezoneOffset) % 60;
  const sign = timezoneOffset >= 0 ? "+" : "-";
  const gmtOffset = `GMT${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return gmtOffset;
};

export const transformMessages = (
  data: ZIMMessage[],
  props: { recipientId: string; chatWithName: string }
) => {
  const transformedMessages = data.map((msg: any) => {
    const obj: IMessage = {
      _id: msg.messageID,
      text: "",
      createdAt: new Date(msg.timestamp),
      user: {
        _id: msg.senderUserID,
        name: msg.senderUserID === props.recipientId ? props.chatWithName : undefined,
        avatar: undefined,
      },
    };

    // Handle reply metadata from both sources
    if (msg.repliedInfo) {
      // Handle web replies
      obj.replyTo = {
        _id: msg.repliedInfo.messageID,
        text: msg.repliedInfo.messageInfo.message,
        user: {
          _id: msg.repliedInfo.senderUserID,
          name: msg.repliedInfo.senderUserID === props.recipientId ? props.chatWithName : undefined,
          avatar: undefined,
        },
        audio:
          msg.repliedInfo.messageInfo.type === ZIMMessageType.Audio
            ? msg.repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
        image:
          msg.repliedInfo.messageInfo.type === ZIMMessageType.Image
            ? msg.repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
        video:
          msg.repliedInfo.messageInfo.type === ZIMMessageType.Video
            ? msg.repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
      };
    } else if (msg.extendedData) {
      // Handle app replies
      try {
        const extendedData = JSON.parse(msg.extendedData);
        if (extendedData.repliedInfo) {
          obj.replyTo = {
            _id: extendedData.repliedInfo.messageID,
            text: extendedData.repliedInfo.messageInfo.message,
            user: {
              _id: extendedData.repliedInfo.senderUserID,
              name:
                extendedData.repliedInfo.senderUserID === props.recipientId
                  ? props.chatWithName
                  : undefined,
              avatar: undefined,
            },
            image:
              extendedData.repliedInfo.messageInfo.type === ZIMMessageType.Image
                ? extendedData.repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
            video:
              extendedData.repliedInfo.messageInfo.type === ZIMMessageType.Video
                ? extendedData.repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
            audio:
              extendedData.repliedInfo.messageInfo.type === ZIMMessageType.Audio
                ? extendedData.repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
          };
        }
      } catch (e) {
        console.error("Error parsing extendedData:", e);
      }
    }

    switch (msg.type) {
      case ZIMMessageType.Text:
        obj.text = (msg as ZIMTextMessage).message;
        break;
      case ZIMMessageType.Image:
        obj.image = (msg as ZIMImageMessage).fileDownloadUrl;
        break;
      case ZIMMessageType.Audio:
        obj.audio = (msg as ZIMAudioMessage).fileDownloadUrl;
        break;
      case ZIMMessageType.Video:
        obj.video = (msg as ZIMVideoMessage).fileDownloadUrl;
        break;
      case ZIMMessageType.File:
        // Handle other file types as attachments
        const fileMessage = msg as ZIMFileMessage;
        obj.text = `[ATTACHMENT]|${fileMessage.extendedData}|${fileMessage.fileDownloadUrl}`;
        break;
      default:
        obj.text = "Unsupported message type";
    }

    return obj;
  });

  return transformedMessages;
};

export const truncateFileName = (filename: string, maxBaseLength = 12) => {
  const parts = filename.split(".");
  if (parts.length < 2) return filename; // no extension

  const ext = parts.pop(); // get the extension
  const base = parts.join(".");

  const truncatedBase = base.length > maxBaseLength ? base.slice(0, maxBaseLength) + ".." : base;

  return `${truncatedBase}.${ext}`;
};

export const isValidText = (value: string | undefined) => {
  if (!value) return false;

  const trimmed = value.trim();
  const hasInvalidChars =
    /[\p{Emoji_Presentation}\p{Extended_Pictographic}~`!@#$%^&*()_+=[\]{}|\\:;"'<>,.?/]/gu.test(
      trimmed
    );

  return trimmed !== "" && !hasInvalidChars;
};
