import { IMessage } from "react-native-gifted-chat";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import { Platform } from "react-native";
import ZIM, {
  ZIMConversationType,
  ZIMMediaMessageBase,
  ZIMMessage,
  ZIMMessageBase,
  ZIMMessagePriority,
  ZIMMessageType,
  ZIMMessageQueryConfig,
} from "zego-zim-react-native";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { useUserInfoStore } from "@/store/modules/userInfo";
import { useGroupNotificationStore } from "@/store/modules/groupNotification";

let zim: ZIM;

const buildFallbackUserName = (userID: string) => {
  if (userID?.trim().length) {
    const normalized = userID.trim();
    return `Guest-${normalized.slice(-6)}`;
  }
  return `Guest-${Date.now()}`;
};


const initializeChat = async (
  appID: string,
  appSign: string,
  userID: string,
  playerId: string,
  userName?: string,
  userAvatar?: string
) => {
  try {
    ZIM.create({
      appID: Number(appID),
      appSign: appSign as string,
    });

    zim = ZIM.getInstance();

    const sanitizedUserID = userID?.trim().length ? userID : `guest_${Date.now()}`;
    const safeUserName = userName?.trim().length ? userName : buildFallbackUserName(sanitizedUserID);

    await zim.login(sanitizedUserID, {
      userName: safeUserName,
      token: "",
      isOfflineLogin: false,
    });


    if (userAvatar) {
      await zim.updateUserAvatarUrl(userAvatar);
    }
    await zim.updateUserExtendedData(
      JSON.stringify({
        playerId,
        displayName: safeUserName,
      })
    );
    // const userInfo = useUserInfoStore((state) => state.userInfo);
    // ✅ Use .getState() instead of hook
    const userInfo = useUserInfoStore.getState().userInfo;

    await getUnreadCount(userInfo?.id);
  } catch (error) {
    console.error("Failed to initialize ZIM SDK:", error);
  }
};

const requestPermissions = async (): Promise<boolean> => {
  const CALL_PERMISSIONS = Platform.select({
    android: [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ],
    ios: [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.MICROPHONE],
    default: [],
  });

  const permissionStatuses = await Promise.all(
    CALL_PERMISSIONS.map((permission) => Permissions.check(permission))
  );

  const permissionsToRequest = CALL_PERMISSIONS.filter(
    (_, index) => permissionStatuses[index] !== "granted"
  );

  if (permissionsToRequest.length > 0) {
    const result = await Permissions.requestMultiple(permissionsToRequest);
    return Object.values(result).every((value) => value === "granted");
  }

  return true;
};

const sendTypingStatus = async (channelUrl: string, isTyping: boolean) => {
  // if (!sb) return;
  // const channel: GroupChannel = await sb.groupChannel.getChannel(channelUrl);
  // if (isTyping) {
  //   channel.startTyping();
  // } else {
  //   channel.endTyping();
  // }
};
const getUnreadCount = async (groupId: string) => {

  try {
    const res = await ZIM.getInstance().queryConversation(
      groupId,
      ZIMConversationType.Group
    );

    console.log("Unread messages →", res.conversation?.unreadMessageCount);
    const unread = res?.conversation?.unreadMessageCount || 0;

    // ⬅ SET TO ZUSTAND STORE
    useGroupNotificationStore.getState().setCount(unread);

    return unread;
  } catch (err) {
    console.log("Unread count error", err);
    return 0;
  }
}
const clearAllUnreadMessage = async () => {
  const userInfo = useUserInfoStore.getState().userInfo;
  const groupId = userInfo?.id;
  const iscountclear = await ZIM.getInstance().clearConversationUnreadMessageCount(
    groupId,
    ZIMConversationType.Group
  ).then((response) => {
    console.log("clear all group unread message",)
    useGroupNotificationStore.getState().reset();

  }).catch((e) => {
    console.log("erorr while notification clean", e)
  })
}



// Function to send messages to a peer (one-to-one chat)
const sendMessage = async (toUserId: string, messages: IMessage[]) => {
  if (!zim) {
    console.error("ZIM instance not initialized");
    return;
  }

  const sentMessages: ZIMMessage[] = [];

  const messagePromises = messages.map(async (message) => {
    // Check for file payload (documents, PDFs, etc.)
    const filePayload = (message as any).file as
      | { uri: string; name: string; type: string }
      | undefined;

    if (filePayload) {
      let workingUri = filePayload.uri;

      // If the picker returns a content:// URI, copy it into our app cache so
      // that Zego (and FileSystem) can read it via a regular file:// path.
      if (workingUri.startsWith("content://")) {
        try {
          const ext = filePayload.name?.split(".").pop() || "bin";
          const targetPath = `${FileSystem.cacheDirectory}zego-file-${Date.now()}.${ext}`;

          await FileSystem.copyAsync({
            from: workingUri,
            to: targetPath,
          });

          workingUri = targetPath; // this is a file:// URI
        } catch (copyErr) {
          console.error("Failed to copy content URI to cache:", copyErr);
          return null;
        }
      }

      const fileUri = workingUri.startsWith("file://")
        ? workingUri
        : `file://${workingUri}`;
      const filePath = fileUri.replace("file://", "");

      const exists = await checkFileExists(fileUri);
      if (!exists) {
        console.error("Attachment file does not exist:", filePath);
        return null;
      }

      const mediaMessage = {
        type: ZIMMessageType.File,
        fileLocalPath: filePath,
        // keep original file name for display on receive
        extendedData: filePayload.name,
      } as ZIMMediaMessageBase;

      return sendMediaMessage(zim, mediaMessage, toUserId);
    } else if (message.image) {
      const mediaMessage = {
        type: ZIMMessageType.Image,
        fileLocalPath: message.image.replace("file://", ""),
        extendedData: message.extendedData,
      } as ZIMMediaMessageBase;
      return sendMediaMessage(zim, mediaMessage, toUserId);
    } else if (message.video) {
      const mediaMessage = {
        type: ZIMMessageType.Video,
        fileLocalPath: message.video.replace("file://", ""),
        extendedData: message.extendedData,
      } as ZIMMediaMessageBase;
      return sendMediaMessage(zim, mediaMessage, toUserId);
    } else if (message.audio) {
      const audioPath = message.audio.replace("file://", "");
      const fileExists = await checkFileExists(message.audio);

      if (!fileExists) {
        console.error("Audio file does not exist:", audioPath);
        return;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: message.audio });
      const status = await sound.getStatusAsync();
      const durationMillis = status.isLoaded ? status.durationMillis : 0;

      const mediaMessage = {
        type: ZIMMessageType.Audio,
        fileLocalPath: audioPath,
        audioDuration: durationMillis ? Math.round(durationMillis / 1000) : 0, // Convert to seconds
        extendedData: message.extendedData,
      } as ZIMMediaMessageBase;

      return sendMediaMessage(zim, mediaMessage, toUserId);
    } else if (message.text) {
      const textMessage = {
        type: ZIMMessageType.Text,
        message: message.text,
        extendedData: message.extendedData,
      } as ZIMMessageBase;
      return sendTextMessage(zim, textMessage, toUserId);
    }
  });

  const results = await Promise.all(messagePromises);

  results.forEach((result) => {
    if (result) {
      sentMessages.push(result);
    }
  });

  return sentMessages;
};



// Add this helper function to check if a file exists
const checkFileExists = async (filePath: string): Promise<boolean> => {
  try {
    const { exists } = await FileSystem.getInfoAsync(filePath);
    return exists;
  } catch (error) {
    console.error("Error checking file existence:", error);
    return false;
  }
};

const sendTextMessage = async (zim: ZIM, message: ZIMMessageBase, toUserId: string) => {
  const config = { priority: ZIMMessagePriority.Low };

  try {
    const result = await zim.sendMessage(message, toUserId, ZIMConversationType.Peer, config);

    return result.message;
  } catch (error) {
    console.error("Error sending text message:", error);
  }
};

const sendMediaMessage = async (zim: ZIM, message: ZIMMediaMessageBase, toUserId: string) => {
  const config = { priority: ZIMMessagePriority.Low };

  // const notification: ZIMMessageSendNotification = {
  //   onMediaUploadingProgress: (
  //     message: any,
  //     currentFileSize: number,
  //     totalFileSize: number
  //   ) => {
  //     console.log(
  //       `Upload progress: ${(currentFileSize / totalFileSize) * 100}%`
  //     );
  //   },
  // };

  try {
    const result = await zim.sendMediaMessage(
      message,
      toUserId,
      ZIMConversationType.Peer,
      config
      // notification
    );

    console.log("Media message sent successfully:", result.message);
    return result.message;
  } catch (error) {
    console.error("Error sending media message:", error);
  }
};

// Function to send messages to a group (supports text, image, video, audio)
export const sendGroupMessage = async (groupId: string, messages: IMessage[]) => {
  if (!zim) {
    console.error("ZIM instance not initialized");
    return [];
  }

  const sentMessages: ZIMMessage[] = [];
  const config = { priority: ZIMMessagePriority.Low };

  const messagePromises = messages.map(async (message) => {
    try {
      // custom file payload from ChatComposer (generic docs, pdf, etc.)
      const filePayload = (message as any).file as
        | { uri: string; name: string; type: string }
        | undefined;

      if (filePayload) {
        let workingUri = filePayload.uri;

        // If the picker returns a content:// URI, copy it into our app cache so
        // that Zego (and FileSystem) can read it via a regular file:// path.
        if (workingUri.startsWith("content://")) {
          try {
            const ext = filePayload.name?.split(".").pop() || "bin";
            const targetPath = `${FileSystem.cacheDirectory}zego-file-${Date.now()}.${ext}`;

            await FileSystem.copyAsync({
              from: workingUri,
              to: targetPath,
            });

            workingUri = targetPath; // this is a file:// URI
          } catch (copyErr) {
            console.error("Failed to copy content URI to cache:", copyErr);
            return null;
          }
        }

        const fileUri = workingUri.startsWith("file://")
          ? workingUri
          : `file://${workingUri}`;
        const filePath = fileUri.replace("file://", "");

        const exists = await checkFileExists(fileUri);
        if (!exists) {
          console.error("Attachment file does not exist:", filePath);
          return null;
        }

        const mediaMessage = {
          type: ZIMMessageType.File,
          fileLocalPath: filePath,
          // keep original file name for display on receive
          extendedData: filePayload.name,
        } as ZIMMediaMessageBase;

        const result = await zim.sendMediaMessage(
          mediaMessage,
          groupId,
          ZIMConversationType.Group,
          config
        );

        console.log("Group file message sent successfully:", result.message);
        return result.message;
      } else if (message.image) {
        // Handle image message
        // Normalize the path - remove file:// prefix if present
        const imageUri = message.image.startsWith("file://")
          ? message.image
          : `file://${message.image}`;
        const imagePath = imageUri.replace("file://", "");

        // Check if file exists (use the URI format for checkFileExists)
        const fileExists = await checkFileExists(imageUri);
        if (!fileExists) {
          console.error("Image file does not exist:", imagePath);
          return null;
        }

        const mediaMessage = {
          type: ZIMMessageType.Image,
          fileLocalPath: imagePath,
          extendedData: message.extendedData,
        } as ZIMMediaMessageBase;

        const result = await zim.sendMediaMessage(
          mediaMessage,
          groupId,
          ZIMConversationType.Group,
          config
        );

        console.log("Group image message sent successfully:", result.message);
        return result.message;
      } else if (message.video) {
        // Handle video message
        const videoUri = message.video.startsWith("file://")
          ? message.video
          : `file://${message.video}`;
        const videoPath = videoUri.replace("file://", "");

        const fileExists = await checkFileExists(videoUri);
        if (!fileExists) {
          console.error("Video file does not exist:", videoPath);
          return null;
        }

        const mediaMessage = {
          type: ZIMMessageType.Video,
          fileLocalPath: videoPath,
          extendedData: message.extendedData,
        } as ZIMMediaMessageBase;

        const result = await zim.sendMediaMessage(
          mediaMessage,
          groupId,
          ZIMConversationType.Group,
          config
        );

        console.log("Group video message sent successfully:", result.message);
        return result.message;
      } else if (message.audio) {
        // Handle audio message
        const audioUri = message.audio.startsWith("file://")
          ? message.audio
          : `file://${message.audio}`;
        const audioPath = audioUri.replace("file://", "");

        const fileExists = await checkFileExists(audioUri);
        if (!fileExists) {
          console.error("Audio file does not exist:", audioPath);
          return null;
        }

        const { sound } = await Audio.Sound.createAsync({ uri: message.audio });
        const status = await sound.getStatusAsync();
        const durationMillis = status.isLoaded ? status.durationMillis : 0;

        const mediaMessage = {
          type: ZIMMessageType.Audio,
          fileLocalPath: audioPath,
          audioDuration: durationMillis ? Math.round(durationMillis / 1000) : 0,
          extendedData: message.extendedData,
        } as ZIMMediaMessageBase;

        const result = await zim.sendMediaMessage(
          mediaMessage,
          groupId,
          ZIMConversationType.Group,
          config
        );

        console.log("Group audio message sent successfully:", result.message);
        return result.message;
      } else if (message.text) {
        // Handle text message
        const textMessage = {
          type: ZIMMessageType.Text,
          message: message.text,
          extendedData: message.extendedData,
        } as ZIMMessageBase;

        const result = await zim.sendMessage(
          textMessage,
          groupId,
          ZIMConversationType.Group,
          config
        );

        console.log("Group text message sent successfully:", result.message);
        return result.message;
      }
    } catch (error) {
      console.error("Error sending group message:", error);
      return null;
    }
  });

  const results = await Promise.all(messagePromises);
  results.forEach((result) => {
    if (result) {
      sentMessages.push(result);
    }
  });

  return sentMessages;
};

export const getMessages = async (
  conversationID: string,
  conversationType: ZIMConversationType,
  config: ZIMMessageQueryConfig
): Promise<ZIMMessage[]> => {
  if (!zim) {
    console.error("ZIM instance not initialized");
    return [];
  }

  try {
    const result = await zim.queryHistoryMessage(conversationID, conversationType, config);

    return result.messageList;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

const logout = () => {
  zim.logout();
  zim.destroy();
};

export { zim, initializeChat, sendMessage, sendTypingStatus, requestPermissions, logout, getUnreadCount, clearAllUnreadMessage };
