import { IMessage, User } from "react-native-gifted-chat";

// Extend the IMessage interface to include reply functionality
declare module "react-native-gifted-chat" {
  export interface IMessage {
    replyTo?: {
      _id: string | number;
      text?: string;
      user: User;
      image?: string;
      audio?: string;
      video?: string;
    };
    repliedInfo?: {
      messageID: string;
      timestamp: number;
      senderUserID: string;
      messageInfo: {
        message: string;
        type: number;
      };
    };
    extendedData?: string;
  }
}
