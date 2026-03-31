// GroupChat.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { GiftedChat, IMessage, GiftedChatProps } from "react-native-gifted-chat";
import { Avatar } from "react-native-gifted-chat";
import { Badge, Div, Text } from "react-native-magnus";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ZIM, {
  ZIMConversationType,
  ZIMMessage,
  ZIMMessageQueryConfig,
  ZIMMessagePriority,
  ZIMMessageType,
} from "zego-zim-react-native";

import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
import { getGroupID } from "@/utils/groupId";
import ChatBubble from "./ChatBubble";
import ChatComposer from "./ChatComposer";
import { zim, sendGroupMessage, clearAllUnreadMessage } from "@/utils/chat.v2";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useUserStore } from "@/store/modules/user";
import { backgroundProps } from "react-native-magnus/lib/typescript/src/types";
import api from "@/utils/api";
import { useUserInfoStore } from "@/store/modules/userInfo";
import { getZegoGroupErrorMessage } from "./handlgrouperror";
import ToastContainer from "react-native-toast-notifications/lib/typescript/toast-container";
import { Toast } from "react-native-toast-notifications";
import { showMessage } from "react-native-flash-message";

import BottomPopup from "@/components/app/BottomPopup";
import { useGroupNotificationStore } from "@/store/modules/groupNotification";
import { Video } from "expo-av";
import { useGroupMemberStore } from "@/store/modules/groupMembers";


export default function GroupChat({ route, props }: any) {
  const navigation = useNavigation()
  const user = useUserStore((state) => state.user);
  const userInfo = useUserInfoStore((state) => state.userInfo);
  // console.log("this is userinfo in group chat-->", userInfo)
  const loadUserInfo = useUserInfoStore((state) => state.loadUserInfo);
  const saveUserInfo = useUserInfoStore((state) => state.saveUserInfo);
  const groupName = userInfo?.organizationName || "smoll Team";
  const userId = route?.params?.userId || "user_" + Math.floor(Math.random() * 10000);
  const userName = route?.params?.userName || "User " + Math.floor(Math.random() * 10000);

  // UI & pagination state
  const [messages, setMessages] = useState<IMessage[]>([]);

  const [loading, setLoading] = useState(true);
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessage, setLastMessage] = useState<ZIMMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isname, setIsname] = useState(true)
  const [groupInfo, setGroupInfo] = useState(null);
  const [isMember, setIsMember] = useState(true);

  const [showNewMessageChip, setShowNewMessageChip] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  const [hasJoinedAfterName, setHasJoinedAfterName] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [flag, setFlag] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState<
    Record<
      string,
      {
        name?: string | null;
        profileImg?: string | null;
      }
    >
  >({});
  const { upsertMembers, } = useGroupMemberStore();
  const members = useGroupMemberStore((state) => state.members);
  const DEFAULT_AVATAR_URL =
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";

  const listViewRef = useRef<GiftedChatProps<IMessage>["listViewProps"]>(null);
  const flatListRef = useRef<FlatList<IMessage>>(null); // ✅ changed ref type
  const [groupId, setGroupId] = useState<string | null>(null);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);


  useEffect(() => {
    (async () => {
      await loadUserInfo();
      setUserInfoLoaded(true);
    })();
  }, [loadUserInfo]);


  useEffect(() => {
    const resolvedId =
      user?.subscription?.groupChat?.id || userInfo?.id || null;
    if (resolvedId && resolvedId !== groupId) {
      setGroupId(resolvedId);
    }
  }, [user?.subscription?.groupChat?.id, userInfo?.id, groupId]);


  useEffect(() => {
    if (!userInfoLoaded) return;
    // If user has no name yet, just show the popup and skip all ZIM calls
    if (!user?.name || user?.name === null || user?.name === "") {
      setIsname(false);
      return;
    }
    (async () => {
      removeListeners();
      console.log("come here or not --->11111111111111111111")
      await joinGroupAndInit();
      console.log("22222222222222222222222222")
      await checkMembership();
       console.log("33333333333333333333")
      await fetchHistory();
       console.log("44444444444444444")
      await addListeners();
       console.log("5555555555555555")
      fetchGroupInfo();
       console.log("66666666666666666")
    })();
    return () => removeListeners();
  }, [userInfoLoaded, groupId, user?.name]);

  useFocusEffect(
    useCallback(() => {
      if (flag == true) {
        (async () => {
          console.log("0000000000.11111111111111111")

          await joinGroupAndInit();
          console.log("0.2222222222222222")
          await checkMembership();
            console.log("0.33333333333333333")
          await fetchHistory();
            console.log("0.44444444444444444")
          await addListeners();
            console.log("0.55555555555555555")
          fetchGroupInfo();
            console.log("0.66666666666666666")
        })();
        setHasJoinedAfterName(true);
        setFlag(false)
      }
      else {
      }
    }, [user?.name, hasJoinedAfterName])
  );
  useFocusEffect(
    useCallback(() => {
      (
        async () => {
          console.log("come here every time -->")
          clearAllUnreadMessage()
          await checkMembership()
        }
      )()
      return () => {
        clearAllUnreadMessage()
      }
    }, [])
  )

  const membersummery = async (ids: string[]) => {
    try {
      if (!ids.length) return;
      const query = ids.map((id) => `${encodeURIComponent(id)}`).join("&ids=");
      const response = await api.get(`/members/summary?ids=${query}`);
      const recordData = Object.fromEntries(
        response.data?.map((item: any) => [item.id, item])
      );
      if (Object.keys(recordData).length > 0) {
        upsertMembers(recordData);
      }
      const profilesArray = Array.isArray(response?.data) ? response.data : [];
      const mappedProfiles = profilesArray.reduce(
        (
          acc: Record<
            string,
            {
              name?: string | null;
              profileImg?: string | null;
            }
          >,
          profile: {
            id: string;
            name?: string | null;
            profileImg?: { url?: string | null } | null;
          }
        ) => {
          if (!profile?.id) {
            return acc;
          }
          acc[profile.id] = {
            name: profile.name ?? null,
            profileImg: profile.profileImg?.url ?? null,
          };
          return acc;
        },
        {}
      );
      setMemberProfiles((prev) => ({
        ...prev,
        ...mappedProfiles,
      }));
    } catch (e) {
      console.log("error while fetch group user info -->",e)
     
    }
  };

  const checkMembership = async () => {
    // console.log("check memebersho=ip-------------111111111")
    try {
      if (!groupId) {
        return;
      }
      if (!groupId) return;
      const res = await ZIM.getInstance().queryGroupMemberList(groupId, {
        count: 100, // Increased from 50 to ensure we check all members
        nextFlag: 0,
      });
      const ids = res.userList.map(u => u.userID);
   await   membersummery(ids);
         // 🔥 Mark that members are loaded BEFORE rendering UI
    setMembersLoaded(true);
      const found = res.userList.some((u) => u.userID === user?.id);
      setIsMember(found);
        //  console.log("check memebersho=ip-------------2222222222")
    } catch (err) {
      console.log("❌ MEMBERSHIP CHECK ERROR", err);
      setIsMember(false);
          // Even on error → we allow UI to continue
    setMembersLoaded(true);
    }
  };

  // --------------------
  // Join / Create group
  // --------------------
  const joinGroups = async (groupId: string) => {
    let count = 1;
    try {
      await ZIM.getInstance().joinGroup(groupId);
    } catch (err: any) {

     
      if (err?.code == 6000522) {
        const c = navigation.isFocused();
        if (c) {
          showMessage({
            message: "Welcome back to the chat!",
            type: "success",
          });
        }


      } else {
        // console.log("eorrr->>>>>>err",err)
        const c = navigation.isFocused();
        if (c) {
          showMessage({
            message: err?.message || "Failed to join group.",
            type: "danger",
          });
        }

      }
   

      // If already member (code 6000522), still fetch history
      if (err?.code === 6000522) {
        console.log("ℹ️ Already a member, fetching history...");
        // await fetchHistory();
      }
      // If group not exist -> create
      else if (err?.code === 6000523) {

        // console.log("ℹ️ Group doesn't exist, creating...");
        count >= 3 ? null : await createGroup()
      }
    }
  };


  const joinGroupAndInit = async () => {
    try {
      // username guard is handled in the effect; keep this as a safety net only
      if (!user?.name || user?.name === null || user?.name === "") {
        setIsname(false);
        // console.log("this is name where you add the name ");
        return;
      }

      // Clear unread because user opened chat
      clearAllUnreadMessage()

      if (!groupId) {
        // fallback — create group
        await createGroup();
        return;
      }
      await joinGroups(groupId);
    } catch (e) {

      console.log("joinGroupAndInit error", e);
    }
  };

  const createGroup = async () => {
    try {
      const groupInfo = {
        groupName,
        groupNotice: "This is company chat room.",
        groupAvatarUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
        groupType: 2,
      };
      //  groupType: 2, // 🔥 IMPORTANT — Large Group
      const res = await ZIM.getInstance().createGroup(groupInfo, []);
      const realID = res.groupInfo.baseInfo.groupID;
     
      try {

        const response = await api.post("/members/organization/group-chat-id", { chatId: realID, type: userInfo?.loginMethod });

      
      } catch (e) {

        console.log("eeeeeeeeeeeeee", e)
      }

      // save & reuse 
      await AsyncStorage.setItem("GROUP_ID", realID);
      setGroupId(realID);
      await saveUserInfo({
        ...(userInfo ?? {}),
        subscription: userInfo?.subscription ?? user?.subscription?.type ?? "",
        organizationName: userInfo?.organizationName ?? user?.subscription?.organizationName ?? "",
        validUntil: userInfo?.validUntil ?? user?.subscription?.validUntil ?? "",
        id: realID,
        loginMethod:
          user?.subscription?.groupChat?.loginMethod ??
          userInfo?.loginMethod ??
          "code",
        isEnabled:
          typeof user?.subscription?.groupChat?.isEnabled === "boolean"
            ? user?.subscription?.groupChat?.isEnabled!
            : userInfo?.isEnabled ?? true,
      });
      // join new group
      await joinGroups(realID);
    } catch (err) {
      
      showMessage({
        message: err?.message || "Failed to create group.",
        type: "danger",
      });

    }
  };

  // -----------------------------------------------------------
  // 2️⃣ FETCH GROUP INFO
  // -----------------------------------------------------------
  const fetchGroupInfo = async () => {
    try {

      if (!groupId) return;
      const res = await ZIM.getInstance().queryGroupInfo(groupId);

      setGroupInfo(res.groupInfo);
    } catch (err) {
      console.log("GROUP INFO ERROR", err);
    }
  };
  // --------------------
  // History (pagination)
  // --------------------
  const fetchHistory = async (isEarlier = false, suppressLoader = false) => {
    try {

      if (!isEarlier && !suppressLoader) setLoading(true);
      else if (isEarlier) setIsLoadingEarlier(true);

      const config: ZIMMessageQueryConfig = {
        count: 100, // Increased from 50 to 100 to fetch more messages
        nextMessage: null,
        reverse: true, // fetch from latest backwards
      };

      if (isEarlier && lastMessage?.timestamp) {
        config.nextMessage = lastMessage as ZIMMessage;
      }

      // const groupId = await getGroupID();
      if (!groupId) {
        
        if (!isEarlier) setLoading(false);
        else setIsLoadingEarlier(false);
        return;
      }

    

      const res = await ZIM.getInstance().queryHistoryMessage(
        groupId,
        ZIMConversationType.Group,
        config
      );

      // res.messageList is array of ZIMMessage
      const list = res?.messageList ?? [];
      //  console.log("--------------->",res)
     

      if (!list || list.length === 0) {
        // console.log("ℹ️ No messages found in group history");
        setHasMoreMessages(false);
        if (!isEarlier) setLoading(false);
        else setIsLoadingEarlier(false);
        return;
      }

      // Check if there are more messages to load
      if (list.length < config.count) {
        setHasMoreMessages(false);
        // console.log("✅ All messages loaded (no more to fetch)");
      } else {
        setHasMoreMessages(true);
        console.log("⏳ More messages available, can load earlier");
      }

      // save lastMessage for pagination (oldest fetched item)
      setLastMessage(list[0]);

      // convert to GiftedChat format and reverse so newest on top for GiftedChat inverted
      const formatted = list.map(convertToGifted).reverse();

      // console.log("✅ Converted messages:", formatted.length);

      if (isEarlier) {
        // append older messages to existing bottom (because GiftedChat is inverted)
        setMessages((prev) => [...prev, ...formatted]);
      } else {
        setMessages(formatted);
        // ensure we land on most recent message after initial history load
        setTimeout(() => scrollToBottom(),);
      }
    } catch (err) {
      console.log("❌ HISTORY ERROR", err);
    } finally {
      setLoading(false);
      setIsLoadingEarlier(false);
    }
  };

  // --------------------
  // ZIM listeners
  // --------------------
  const onGroupMsg = (_zim: any, data: any) => {
    try {
      data.messageList.forEach((m: ZIMMessage) => {
        pushIncomingMessage(m);
      });
    } catch (e) {
      console.warn("onGroupMsg parse error", e);
    }
  };

  const addListeners = () => {

    ZIM.getInstance().on("receiveGroupMessage", onGroupMsg);

  };

  const removeListeners = () => {
    try {
      ZIM.getInstance().off("receiveGroupMessage",onGroupMsg);
    } catch (e) {
      console.warn("removeListeners error", e);
    }
  };

  const pushIncomingMessage = (msg: ZIMMessage) => {
    // Convert and append to GiftedChat
    const g = convertToGifted(msg);
    setMessages((prev) => GiftedChat.append(prev, [g]));


    if (!isAtBottom) {
      setShowNewMessageChip(true);
    } else {
      setTimeout(scrollToBottom, 200);
    }
  };

  // --------------------
  // Convert ZIM -> GiftedChat IMessage
  // --------------------
  const convertToGifted = (m: ZIMMessage): IMessage => {
    // ZIM doesn't provide senderUserName by default - it only has sender UserID
    // We'll use the senderUserID to create a display name
    const senderName = (m as any).senderUserName || m.senderUserID;


    // 🔹 NEW: determine if this message is from current user
    const isCurrentUserMessage = m.senderUserID === user?.id; // ✅ added
    // console.log("this is ---idddd", m.senderUserID)

    // Handle different message types
    const baseMessage: IMessage = {
      _id: `${m.messageID}_${m.timestamp}`,
      text: m.message || "",
      createdAt: new Date(m.timestamp),
      user: {
        // _id: m.senderUserID,

        _id: isCurrentUserMessage ? m.senderUserID : m.senderUserID, // 🔹 use dummy ID for current user
        // name: senderName, // Use senderUserID as fallback
        name: isCurrentUserMessage
          ? user?.name || "You"       // Use actual current user name
          : senderName,
        avatar: (m as any).senderAvatar || "", // if you store avatar in message ext, use that
      },
    };

    // Handle image messages
    if (m.type === ZIMMessageType.Image) {
      const imageMessage = m as any;
      // ZIM provides fileDownloadUrl for images
      if (imageMessage.fileDownloadUrl) {
        baseMessage.image = imageMessage.fileDownloadUrl;
      } else if (imageMessage.fileLocalPath) {
        // If local path exists, use it (for messages we just sent)
        baseMessage.image = imageMessage.fileLocalPath.startsWith("file://")
          ? imageMessage.fileLocalPath
          : `file://${imageMessage.fileLocalPath}`;
      }
    }

    // Handle video messages
    if (m.type === ZIMMessageType.Video) {
      const videoMessage = m as any;
      if (videoMessage.fileDownloadUrl) {
        baseMessage.video = videoMessage.fileDownloadUrl;
      } else if (videoMessage.fileLocalPath) {
        baseMessage.video = videoMessage.fileLocalPath.startsWith("file://")
          ? videoMessage.fileLocalPath
          : `file://${videoMessage.fileLocalPath}`;
      }
    }

    // Handle audio messages
    if (m.type === ZIMMessageType.Audio) {
      const audioMessage = m as any;
      if (audioMessage.fileDownloadUrl) {
        baseMessage.audio = audioMessage.fileDownloadUrl;
      } else if (audioMessage.fileLocalPath) {
        baseMessage.audio = audioMessage.fileLocalPath.startsWith("file://")
          ? audioMessage.fileLocalPath
          : `file://${audioMessage.fileLocalPath}`;
      }
    }

    // Handle generic file messages (docs, pdf, etc.) as attachment text
    if (m.type === ZIMMessageType.File) {
      const fileMessage = m as any;
      const fileName =
        (fileMessage.extendedData as string | undefined) ||
        (fileMessage.fileName as string | undefined) ||
        "File";
      const fileUrl = fileMessage.fileDownloadUrl as string | undefined;

      if (fileUrl) {
        baseMessage.text = `[ATTACHMENT]|${fileName}|${fileUrl}`;
      }
    }

    // Handle reply metadata from extendedData
    if (m.extendedData) {
      try {
        const extendedData = JSON.parse(m.extendedData);
        if (extendedData.repliedInfo) {
          const repliedInfo = extendedData.repliedInfo;
          // Find the original sender id & name
          const repliedToSenderId = repliedInfo.senderUserID as string;

          const profileName =
            repliedToSenderId && memberProfiles?.[repliedToSenderId]
              ? memberProfiles[repliedToSenderId].name
              : undefined;

          const repliedToSenderName =
            repliedToSenderId === user?.id
              ? // current user → nice label
              user?.name || "You"
              : // other users → prefer profile name, then explicit senderUserName, else generic
              profileName ||
              (repliedInfo.senderUserName as string | undefined) ||
              "User";

          baseMessage.replyTo = {
            _id: repliedInfo.messageID,
            text: repliedInfo.messageInfo.message,
            user: {
              _id: repliedToSenderId,
              name: repliedToSenderName,
              avatar: undefined,
            },
            image:
              repliedInfo.messageInfo.type === ZIMMessageType.Image
                ? repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
            video:
              repliedInfo.messageInfo.type === ZIMMessageType.Video
                ? repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
            audio:
              repliedInfo.messageInfo.type === ZIMMessageType.Audio
                ? repliedInfo.messageInfo.fileDownloadUrl
                : undefined,
          };
        }
      } catch (e) {
        console.error("Error parsing extendedData for reply:", e);
      }
    }

    // Also check for repliedInfo directly on message (for web replies)
    if ((m as any).repliedInfo) {
      const repliedInfo = (m as any).repliedInfo;
      const repliedToSenderId = repliedInfo.senderUserID as string;

      const profileName =
        repliedToSenderId && memberProfiles?.[repliedToSenderId]
          ? memberProfiles[repliedToSenderId].name
          : undefined;

      const repliedToSenderName =
        repliedToSenderId === user?.id
          ? user?.name || "You"
          : profileName ||
          (repliedInfo.senderUserName as string | undefined) ||
          "User";

      baseMessage.replyTo = {
        _id: repliedInfo.messageID,
        text: repliedInfo.messageInfo.message,
        user: {
          _id: repliedToSenderId,
          name: repliedToSenderName,
          avatar: undefined,
        },
        image:
          repliedInfo.messageInfo.type === ZIMMessageType.Image
            ? repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
        video:
          repliedInfo.messageInfo.type === ZIMMessageType.Video
            ? repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
        audio:
          repliedInfo.messageInfo.type === ZIMMessageType.Audio
            ? repliedInfo.messageInfo.fileDownloadUrl
            : undefined,
      };
    }

    return baseMessage;
  };

  // --------------------
  // Reply handlers
  // --------------------
  const onScroll = ({ nativeEvent }: any) => {
    const paddingToBottom = 40;
    const isBottom =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - paddingToBottom;

    setIsAtBottom(isBottom);
  };

  const handleReply = (message: IMessage) => {
    setReplyingTo(message);
    
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  // --------------------
  // Send message
  // --------------------
  const onSend = async (newMessages: IMessage[] = []) => {
    if (!newMessages || newMessages.length === 0) return;

    if (!groupId) {
     
      return;
    }
    // Check if message has image, video, audio, text or file attachment
    const firstMsg: any = newMessages[0];
    const hasContent =
      firstMsg?.text ||
      firstMsg?.image ||
      firstMsg?.video ||
      firstMsg?.audio ||
      firstMsg?.file;

    if (!hasContent) {

      return;
    }

    // Add reply metadata if replying to a message
    if (replyingTo) {
      let messageType = ZIMMessageType.Text;
      let messageContent = replyingTo.text || "";
      let fileDownloadUrl = undefined;

      if (replyingTo.image) {
        messageType = ZIMMessageType.Image;
        fileDownloadUrl = replyingTo.image;
      } else if (replyingTo.video) {
        messageType = ZIMMessageType.Video;
        fileDownloadUrl = replyingTo.video;
      } else if (replyingTo.audio) {
        messageType = ZIMMessageType.Audio;
        fileDownloadUrl = replyingTo.audio;
      }

      // Extract message ID from the _id (format: "messageID_timestamp")
      const messageId = typeof replyingTo._id === 'string'
        ? replyingTo._id.split('_')[0]
        : replyingTo._id?.toString();

      newMessages[0].extendedData = JSON.stringify({
        repliedInfo: {
          senderUserID: replyingTo?.user?._id?.toString() || "",
          // store a human friendly name so other clients can render it
          senderUserName: replyingTo?.user?.name || "",
          state: 0,
          messageID: messageId || "",
          sentTime: new Date(replyingTo?.createdAt).getTime(),
          messageInfo: {
            message: messageContent,
            type: messageType,
            fileDownloadUrl: fileDownloadUrl,
          },
          messageSeq:
            typeof messageId === "string" ? parseInt(messageId.slice(-3)) || 0 : 0,
        },
      });
    }

    setIsSending(true);

    try {
      // Use sendGroupMessage to handle all message types (text, image, video, audio)
      const sentMessages = await sendGroupMessage(groupId, newMessages);

      if (sentMessages && sentMessages.length > 0) {
        // console.log("Group message sent successfully:", sentMessages);
        // Clear reply state after sending
        setReplyingTo(null);
        // Refresh history to show the sent message
        await fetchHistory(false, true);
      } else {
        // console.log("Failed to send group message");
      }
    } catch (err) {
  
      // console.error("SEND ERROR", err);
    } finally {
      setIsSending(false);
    }
  };

  // --------------------
  // Leave group (optional)
  // --------------------
  const leaveGroup = async () => {
    try {
     
      if (!groupId) return;
      await ZIM.getInstance().leaveGroup(groupId || "");
     
     
    } catch (err) {
      
    }
  };

  const scrollToBottom = () => {
    if (!flatListRef.current) return;

    // This scrolls to the very end of the chat
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const handleLoadEarlier = async () => {
    if (isLoadingEarlier || !hasMoreMessages) return;
    await fetchHistory(true);
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const paddingToTop = 100; // because GiftedChat is inverted
    const isCloseToBottom = contentOffset.y <= paddingToTop;
    setIsAtBottom(isCloseToBottom);
    if (isCloseToBottom) setShowNewMessageChip(false);
  };
  const handlePopupClose = () => {
    // Don't close the popup, user needs to set name
    setIsname(true);
  };

  const handleButtonPress = () => {
    // Navigate to settings to set name
    setFlag(true)

    navigation.navigate("SettingPersonalInfoScreen");
  };

  // -------------
  // Render
  // -------------


  // Helper function to get color based on user ID
  const getAvatarColor = (userId: string): string => {
    const colors = [
      "#9b59b6", // Purple
      "#e74c3c", // Red
      "#3498db", // Blue
      "#1abc9c", // Teal
      "#f39c12", // Orange
      "#2ecc71", // Green
      "#e91e63", // Pink
      "#9c27b0", // Deep Purple
      "#00bcd4", // Cyan
      "#ff9800", // Amber
    ];

    // Generate a consistent color based on userId
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // 🔥 PREVENT FIRST RENDER UNTIL MEMBERS ARE AVAILABLE
// if (!membersLoaded) {
//   return (
//     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//       <ActivityIndicator size="large" color="#666" />
//       <Text>Loading group members...</Text>
//     </View>
//   );
// }
  const renderAvatar = (avatarProps: any) => {

    console.log("this is memeber-->", members)
    console.log("i am render avatart here -->")
    const userobject = members[avatarProps.currentMessage?.user?._id]
    
    const userprofile = userobject?.profileImg?.url;
    const name = userobject?.name?.charAt(0).toUpperCase()
   
  

    const { currentMessage } = avatarProps;
    if (!currentMessage) return null;

    const isCurrentUser = currentMessage.user._id === "current_user";
    const senderId = isCurrentUser ? user?.id : currentMessage.user._id;
    const profile = senderId ? memberProfiles?.[senderId] : undefined;

    let displayName =
      profile?.name ||
      currentMessage.user.name ||
      (isCurrentUser ? user?.name : undefined) ||
      "User";

    displayName = displayName?.trim?.() || "User";
    const initials = displayName.charAt(0).toUpperCase();


    const avatarUrl =
      (isCurrentUser ? user?.profileImg?.url : undefined) ||
      profile?.profileImg ||
      (typeof currentMessage.user.avatar === "string"
        ? currentMessage.user.avatar
        : null);


    if (userprofile) {
     console.log("i am render avatart here -->-----------inside the ui")
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate("GroupProfile", {
            id: user?.id })}>
          <Image source={{ uri: userprofile }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
            }}/>
          </TouchableOpacity>); }

          return (
          <TouchableOpacity
            onPress={() => navigation.navigate("GroupProfile", {
              id: senderId
            })}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: getAvatarColor(senderId || "unknown"),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
              {name}
            </Text>
            </TouchableOpacity>
            );
};

const renderVideoMessage = (videoProps: any) => {
  const {currentMessage} = videoProps;
            if (!currentMessage?.video) return null;

            return (
            <Div style={{ marginRight: 6 }}>
              <Video
                source={{ uri: currentMessage.video }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                  backgroundColor: "#000",
                }}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
              />
            </Div>
            );
};

// -----------------------------------------------------------

const Header = () => (
            <View style={styles.header}>
              <View style={styles.headerunder}>

                {
                  userInfo?.organizationProfileImg ?
                    <Image

                      source={{
                        uri:
                          userInfo?.organizationProfileImg?.url || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
                      } }

                      style={styles.avatar} />
                    :
                    <Image
                      source={require("../../../assets/images/userother.png")}
                      style={styles.avatar}/>  }



                <View>
                  <Text style={styles.groupName}>
                    {userInfo?.organizationName || " smoll Group"}
                  </Text>

                  </View>
                  </View>

                  </View>
                  );

                  const currentscreen = navigation.isFocused();
                  return (

                  <Div flex={1}  style={{ width: "100%", position: "relative", backgroundColor: "#FAF8F5", }} >
                    <Header/>
                 
               
                    {
                      !isname && currentscreen && <BottomPopup
                        type={"namesetup"}
                        petName={"activePopup?.data.petName"}
                        onClose={handlePopupClose}
                        onButtonPress={() => {
                          handlePopupClose();
                          handleButtonPress();
                        }}/>
                    }
                    {
                      loading ||!membersLoaded ? (
                        <Div flex={1} justifyContent="center" mt={- 100
                        }>
                          <ActivityIndicator color={colorPrimary} size="large"/>
                        </Div>
                      ) : (
                        <>
                          <GiftedChat
                            inverted={true}
                    
                            messages={messages.sort((a, b) => +b.createdAt - +a.createdAt)}
                            onSend={(msgs) => onSend(msgs)}
                            onLoadEarlier={handleLoadEarlier}
                            isLoadingEarlier={isLoadingEarlier}
                            loadEarlier={hasMoreMessages}
                            isTyping={isTyping}

                            // user={{ _id: "__inverted_user__", name: userName }} // Inverted: use dummy ID so current user messages show on left
                            user={{ _id: user?.id, name: userName || user?.name, avatar: "" }} // ✅ changed to match convertToGifted
                            showAvatarForEveryMessage={false}
                            showUserAvatar={true}
                            renderBubble={(props) => <ChatBubble {...props} onReply={(message) => handleReply(message)} currentUser={user?.id}/>}
                            renderAvatar={renderAvatar}
                            renderMessageVideo={renderVideoMessage}
                           
                          
                           
                            renderInputToolbar={(props) => (
                              <ChatComposer
                                {...props}
                                isSending={isSending}
                                replyingTo={replyingTo}
                                onCancelReply={cancelReply}
                                expertName={groupName}
                                currentUser={user?.id}
                                screen={"groupchat"}/>
                            )}
                            renderChatFooter={() => <Div></Div>}
                            renderChatEmpty={( ) => (
                              <Div flex={1} p={20} justifyContent="flex-end" style={{
                                transform: [
                                       // flip vertically back to normal
                                  { rotate: "180deg" }, // ensure no unwanted rotation
                                ],
                              }} >
                                <Text fontFamily={fontHauoraSemiBold} fontSize={"2xl"} mb={10} >
                                  Welcome to {groupName}
                                </Text>
                                <Text> Start the conversation — everyone in the group will see it.</Text>
                              </Div>
                            )}/>
                        </>
                      
                      
                      
                      )}

                  </Div>
                  );
}

                  const styles = StyleSheet.create({
                    header: {
                    flexDirection: "row",
                  alignItems: "center",
                  justifyContent:"space-between",
                  padding: 12,
                  backgroundColor: "#FAF8F5",
                  elevation: 3,
  },
                  headerunder: {
                    flexDirection: "row",
                  alignItems: "center",
   
  },
                  back: {
                    fontSize: 22,
                  marginRight: 12,
  },
                  avatar: {
                    width: 42,
                  height: 42,
                  borderRadius: 21,
                  marginRight: 12,
 
  },
                  groupName: {
                    fontSize: 18,
                  fontWeight: "bold",
  },
                  notice: {
                    fontSize: 12,
                  color: "#666",
                  marginTop: 2,
  },
});