import React, { useEffect, useState } from "react";
import { Avatar, Badge, Button, Div, Image, Tag, Text } from "react-native-magnus";
import { IconChevronRight, IconUser } from "@tabler/icons-react-native";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { colorPrimary, fontHauoraMedium } from "@/constant/constant";
import VerifiedIcon from "@/components/icons/VerifiedIcon";
import { useExpertStore } from "@/store/modules/expert";

interface Props {
  onPress: () => void;
  title: string;
  subtitle: string;
  image: string;
  loading?: string;
  expertId: string;
  verified?: boolean;
  about?: string;
  unreadMessageCount?: number;
  isOnline?: boolean;
}

const ChatInboxItem: React.FC<Props> = (props) => {
  const [showNotification, setShowNotification] = useState(true);
  const { unreadMessages } = useExpertStore();

  const handlePress = () => {
    setShowNotification(false);
    props.onPress();
  };

  useEffect(() => {
    setShowNotification(true);
  }, [unreadMessages.size]);

  return (
    <TouchableOpacity disabled={props.loading ? true : false} onPress={handlePress}>
      <Button
        bg="transparent"
        p={0}
        flexDir={"row"}
        alignItems="center"
        py={15}
        style={{ gap: 24 }}
        pointerEvents="none"
      >
        {/* <Image w={72} h={72} rounded={100} source={{ uri: props.image }} /> */}
        {props.isOnline ? (
          <Div mr={24}>
            <Badge
              right={4}
              top={1}
              h={15}
              w={15}
              style={{ backgroundColor: "#00ff28" }}
              borderWidth={2}
              borderColor="#fff"
            >
              {props.image ? (
                <Image source={{ uri: props.image }} w={72} h={72} rounded={100} bg="#eeeeee" />
              ) : (
                <IconUser size={24} />
              )}
            </Badge>
          </Div>
        ) : props.image ? (
          <Image source={{ uri: props.image }} w={72} h={72} rounded={100} bg="#eeeeee" mr={24} />
        ) : (
          <Avatar size={72} bg="#eeeeee" mr={24}>
            <IconUser size={30} color="#666" />
          </Avatar>
        )}

        <Div flexDir="row" alignItems="center" flex={1} position="relative">
          <Div>
            <Div row style={{ gap: 7 }}>
              <Text fontSize={"xl"} mb={4} lineHeight={24}>
                {props.title}
              </Text>
              {true && (
                <Div mt={4}>
                  <VerifiedIcon />
                </Div>
              )}
            </Div>
            <Text mb={4} fontSize={"md"} color="darkGreyText">
              {props.subtitle}
            </Text>

            {props.about && (
              <Text
                fontSize="md"
                // fontFamily={fontHauoraMedium}
                color="darkGreyText"
                lineHeight={20}
                maxW={"90%"}
              >
                {props.about.length > 60 ? props.about.slice(0, 60) + "..." : props.about}
              </Text>
            )}
          </Div>

          <Div ml="auto">
            {props.loading === props.expertId ? (
              <ActivityIndicator size="small" color={colorPrimary} />
            ) : (
              <>
                <IconChevronRight width={24} height={24} color={"#222222"} />
              </>
            )}
          </Div>

          {props.loading !== props.expertId &&
            Boolean(props.unreadMessageCount) &&
            !props.loading &&
            showNotification && (
              <Div
                h={24}
                w={24}
                bg={"#f52c11"}
                rounded={100}
                position="absolute"
                top={1}
                right={0}
                justifyContent="center"
                alignItems="center"
              >
                <Text color="#fff" fontWeight={"600"}>
                  {props.unreadMessageCount}
                </Text>
              </Div>
            )}
        </Div>
      </Button>

      <Div style={{ borderBottomColor: "#E0E0E0", borderBottomWidth: 1 }}></Div>
    </TouchableOpacity>
  );
};

export default ChatInboxItem;


































// // GroupChat.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { ActivityIndicator, Alert, Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
// import { GiftedChat, IMessage, GiftedChatProps } from "react-native-gifted-chat";
// import { Avatar } from "react-native-gifted-chat";
// import { Badge, Div, Text } from "react-native-magnus";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import ZIM, {
//   ZIMConversationType,
//   ZIMMessage,
//   ZIMMessageQueryConfig,
//   ZIMMessagePriority,
// } from "zego-zim-react-native";

// import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
// import { getGroupID } from "@/utils/groupId";
// import ChatBubble from "./ChatBubble";
// import ChatComposer from "./ChatComposer";
// import { zim } from "@/utils/chat.v2";
// import { useNavigation } from '@react-navigation/native';
// import { useUserStore } from '@/store/modules/user';

// // NOTE: This component expects that ChatBubble and ChatComposer are compatible
// // with GiftedChat props (same as your 1-1 implementation). If minor prop names differ,
// // adapt accordingly.

// export default function GroupChat({ route,props }: any) {
// // console.log("props",props)
// const navigation =useNavigation()
// const { user } = useUserStore();
// console.log("this is current user ----->",user?.id,"user name->",user?.name)

//   const groupName = route?.params?.groupName || "Support Group";
//   const userId = route?.params?.userId || "user_" + Math.floor(Math.random() * 10000);
//   const userName = route?.params?.userName || "User " + Math.floor(Math.random() * 10000);

//   // UI & pagination state
//   const [messages, setMessages] = useState<IMessage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
//   const [hasMoreMessages, setHasMoreMessages] = useState(true);
//   const [lastMessage, setLastMessage] = useState<ZIMMessage | null>(null);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//     const [groupInfo, setGroupInfo] = useState(null);
//     const [isMember, setIsMember] = useState(true);

//   const [showNewMessageChip, setShowNewMessageChip] = useState(false);
//   const [isAtBottom, setIsAtBottom] = useState(true);

//   const listViewRef = useRef<GiftedChatProps<IMessage>["listViewProps"]>(null);
//  const groupiddd="#AFWY9nyb9"
//   // --------------------
//   // Lifecycle: join + listeners
//   // --------------------
//   console.log("ccccccccccccccccc->")
//     // Keep reference to listener so we can remove it
//   let currentUserListener: any = null;
//   useEffect(() => {
//     (async () => {
//       // removeListeners(); // ensure no dupes
//         checkMembership(); 
//       await joinGroupAndInit();
//       addListeners();
//       fetchGroupInfo();
     
//       // initial fetch is done by joinGroupAndInit -> fetchHistory
//     })();

//     return () => {
//       // cleanup listeners on unmount
//       removeListeners();
//       // optionally leave group (uncomment if desired)
//       // leaveGroup();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user?.id]);

//   const checkMembership = async () => {
//     // console.log("abhinandan====")
//     try {
//       // const groupId = await getGroupID();
//       if (!groupiddd) {
//         console.log("⚠️ No group ID found for membership check");
//         return;
//       }

//       console.log("🔍 Checking membership for user:", user?.id, "in group:", groupiddd);

//       const res = await ZIM.getInstance().queryGroupMemberList(groupiddd, {
//         count: 200, // Increased from 50 to ensure we check all members
//         nextFlag: 0,
//       });
//         console.log("this is memeber info ->>>>",res)
//       console.log(`👥 Group has ${res.userList.length} members`);
//       console.log("👥 Member list:", res.userList.map(u => u.userID));
      
//       const found = res.userList.some((u) => u.userID === user?.id);

//       console.log(found ? "✅ User IS a member" : "❌ User is NOT a member");

//       setIsMember(found);
//     } catch (err) {
//       console.log("❌ MEMBERSHIP CHECK ERROR", err);
//       setIsMember(false);
//     }
//   };
//   // --------------------
//   // Join / Create group
//   // --------------------
//   const joinGroups = async (groupId: string) => {
//     try {
//       console.log("🚀 Attempting to join group:", groupId);
      
//       await ZIM.getInstance().joinGroup(groupId || "support_group_01");
      
//       console.log("✅ Successfully joined group:", groupId);
//       console.log("📥 Fetching all chat history...");
      
//       // load ALL history after join
//       await fetchHistory();
      
//       console.log("✅ History fetched successfully");
//     } catch (err: any) {
//       console.log("❌ JOIN ERROR", err?.code, err?.message);
      
//       // If already member (code 6000522), still fetch history
//       if (err?.code === 6000522) {
//         console.log("ℹ️ Already a member, fetching history...");
//         await fetchHistory();
//       }
//       // If group not exist -> create
//       else if (err?.code === 6000523) {
//         console.log("ℹ️ Group doesn't exist, creating...");
//         await createGroup();
//       }
//     }
//   };

//   const joinGroupAndInit = async () => {
//     try {
//       // const groupId = await getGroupID();
//       if (!groupiddd) {
//         // fallback — create group
//         await createGroup();
//         return;
//       }
//       await joinGroups(groupiddd);
     

//     } catch (e) {
//       console.log("joinGroupAndInit error", e);
//     }
//   };

//   const createGroup = async () => {
//     try {
//       const groupInfo = {
//         groupName,
//         groupNotice: "This is company chat room.",
//         groupAvatarUrl: "https://i.ibb.co/4pDNDk1/group-avatar.png",
//       };

//       const res = await ZIM.getInstance().createGroup(groupInfo, []);
//       const realID = res.groupInfo.baseInfo.groupID;
    
//       // save & reuse 
//       await AsyncStorage.setItem("GROUP_ID", realID);

//       console.log("Group created with id:", realID);

//       // join new group
//       await joinGroups(groupiddd);
//     } catch (err) {
//       console.log("CREATE GROUP ERROR", err);
//     }
//   };

//     // -----------------------------------------------------------
//   // 2️⃣ FETCH GROUP INFO
//   // -----------------------------------------------------------
//   const fetchGroupInfo = async () => {
//     try {
//       // const group=await getGroupID();
//       const res = await ZIM.getInstance().queryGroupInfo(groupiddd||"");
//       console.log("GROUP INFO:", res);
//       setGroupInfo(res.groupInfo);
//     } catch (err) {
//       console.log("GROUP INFO ERROR", err);
//     }
//   };
//   // --------------------
//   // History (pagination)
//   // --------------------
//   const fetchHistory = async (isEarlier = false, suppressLoader = false) => {
//     try {
//       if (!isEarlier && !suppressLoader) setLoading(true);
//       else if(isEarlier) setIsLoadingEarlier(true);

//       const config: ZIMMessageQueryConfig = {
//         count: 100, // Increased from 50 to 100 to fetch more messages
//         nextMessage: null,
//         reverse: true, // fetch from latest backwards
//       };

//       if (isEarlier && lastMessage?.timestamp) {
//         config.nextMessage = lastMessage as ZIMMessage;
//       }

//       // const groupId = await getGroupID();
//       if (!groupiddd) {
//         console.warn("⚠️ No groupId found for fetchHistory");
//        if (!isEarlier) setLoading(false);
//         else setIsLoadingEarlier(false);
//         return;
//       }

//       console.log("📥 Fetching messages from group:", groupiddd, "Count:", config.count);

//       const res = await ZIM.getInstance().queryHistoryMessage(
//         groupiddd,
//         ZIMConversationType.Group,
//         config
//       );

//       // res.messageList is array of ZIMMessage
//       const list = res?.messageList ?? [];
//        console.log("--------------->",res)
//       console.log(`📊 Fetched ${list.length} messages from group history`);
      
//       if (!list || list.length === 0) {
//         console.log("ℹ️ No messages found in group history");
//         setHasMoreMessages(false);
//         if (!isEarlier) setLoading(false);
//       else setIsLoadingEarlier(false);
//       return;
//       }

//       // Check if there are more messages to load
//       if (list.length < config.count) {
//         setHasMoreMessages(false);
//         console.log("✅ All messages loaded (no more to fetch)");
//       } else {
//         setHasMoreMessages(true);
//         console.log("⏳ More messages available, can load earlier");
//       }

//       // save lastMessage for pagination (oldest fetched item)
//       setLastMessage(list[0]);

//       // convert to GiftedChat format and reverse so newest on top for GiftedChat inverted
//       const formatted = list.map(convertToGifted).reverse();
      
//       console.log("✅ Converted messages:", formatted.length);

//       if (isEarlier) {
//         // append older messages to existing bottom (because GiftedChat is inverted)
//         setMessages((prev) => [...prev, ...formatted]);
//       } else {
//         setMessages(formatted);
//       }
//     } catch (err) {
//       console.log("❌ HISTORY ERROR", err);
//     } finally {
//       setLoading(false);
//       setIsLoadingEarlier(false);
//     }
//   };

//   // --------------------
//   // ZIM listeners
//   // --------------------
//   const onGroupMsg = (_zim: any, data: any) => {
//     try {
//       data.messageList.forEach((m: ZIMMessage) => {
//         pushIncomingMessage(m);
//       });
//     } catch (e) {
//       console.warn("onGroupMsg parse error", e);
//     }
//   };

//   const addListeners = () => {
//     // ZIM.getInstance().on("receiveGroupMessage", onGroupMsg);
//      // Remove previous listener first
//     if (currentUserListener) {
//       ZIM.getInstance().off("receiveGroupMessage", currentUserListener);
//       currentUserListener = null;
//     }

//     currentUserListener = (zim: any, data: any) => onGroupMsg(zim, data);
//     ZIM.getInstance().on("receiveGroupMessage", currentUserListener);
//   };

//   const removeListeners = () => {
//     try {
//       // ZIM.getInstance().off("receiveGroupMessage", onGroupMsg);
//        if (currentUserListener) {
//       ZIM.getInstance().off("receiveGroupMessage", currentUserListener);
//       currentUserListener = null;
//     }
//     } catch (e) {
//       console.warn("removeListeners error", e);
//     }
//   };

//   const pushIncomingMessage = (msg: ZIMMessage) => {
//     // Convert and append to GiftedChat
//     const g = convertToGifted(msg);
//     setMessages((prev) => GiftedChat.append(prev, [g]));

//     // If user not at bottom, show chip
//     if (!isAtBottom) {
//       setShowNewMessageChip(true);
//     } else {
//       // if at bottom, scroll after slight delay
//       setTimeout(() => scrollToBottom(), 50);
//     }
//   };

//   // --------------------
//   // Convert ZIM -> GiftedChat IMessage
//   // --------------------
//   const convertToGifted = (m: ZIMMessage): IMessage => {
//     // ZIM doesn't provide senderUserName by default - it only has sender UserID
//     // We'll use the senderUserID to create a display name
//     const senderName = (m as any).senderUserName || m.senderUserID;
     
     
//       // 🔹 NEW: determine if this message is from current user
//   const isCurrentUserMessage = m.senderUserID === user?.id; // ✅ added
//     // Debug: Log to see what username data we're getting
//     console.log("📩 ZIM Message conversion:", {
//       senderUserID: m.senderUserID,
//       senderName: senderName,
//       hasUserName: !!(m as any).senderUserName,
//     });

//     // Some message types may have different shapes. We handle text here; extend for image/file if needed.
//     return {
//       _id: `${m.messageID}_${m.timestamp}`,
//       text: m.message || "",
//       createdAt: new Date(m.timestamp),
//       user: {
//         // _id: m.senderUserID,
//         _id: isCurrentUserMessage ? "current_user" : m.senderUserID, // 🔹 use dummy ID for current user
//         // name: senderName, // Use senderUserID as fallback
//         name:  isCurrentUserMessage 
//             ? user?.name || "You"       // Use actual current user name
//             : senderName,
//         avatar: (m as any).senderAvatar || "", // if you store avatar in message ext, use that
//       },
//     };
//   };

//   // --------------------
//   // Send message
//   // --------------------
//   const onSend = async (newMessages: IMessage[] = []) => {
//     if (!newMessages || newMessages.length === 0) return;
// // checkMembership();
//     // setMessages((prev) => GiftedChat.append(prev, newMessages)); // optimistic UI

//     const text = newMessages[0]?.text;
//     if (!text) return;

//     // setIsSending(true);

//     const messagePayload = {
//       type: 1, // text
//       message: text,
//     };

//     const config = {
//       priority: ZIMMessagePriority.Low,
//     };

//     try {
//       // const groupId = await getGroupID();
//       if (!groupiddd) throw new Error("Missing group id");

//       const res = await ZIM.getInstance().sendMessage(
//         messagePayload,
//         groupiddd,
//         ZIMConversationType.Group,
//         config
//       );

//       console.log("Group message sent:", res); 
// await fetchHistory(false, true);
//       // If you prefer to reload history on send, call fetchHistory() — but that may cause duplicates.
//     } catch (err) {
//       console.log("SEND ERROR", err);
//     } finally {
//       // setIsSending(false);
//     }
//   };

//   // --------------------
//   // Leave group (optional)
//   // --------------------
//   const leaveGroup = async () => {
//     try {
// // navigation.navigate("HomeScreen")
// console.log("first------------------")
//       // const groupId = await getGroupID();
//       await ZIM.getInstance().leaveGroup(groupiddd || "");
//       console.log("LEFT GROUP:", groupiddd);
//         //  navigation.navigate("HomeScreen", {
//         //     isNewUser: String("isNewUser"),
//         //   });
//         Alert.alert("Now you are not the member of bhis group")
//     } catch (err) {
//       console.log("LEAVE ERROR", err);
//     }
//   };












//   // --------------------
//   // UI helpers: scroll, load earlier, handlers
//   // --------------------
//   const scrollToBottom = () => {
//     if (listViewRef.current) {
//       // @ts-ignore
//       listViewRef.current.scrollToOffset({ offset: 0, animated: true });
//       setShowNewMessageChip(false);
//     }
//   };

//   const handleLoadEarlier = async () => {
//     if (isLoadingEarlier || !hasMoreMessages) return;
//     await fetchHistory(true);
//   };

//   const handleScroll = (event: any) => {
//     const { contentOffset } = event.nativeEvent;
//     const paddingToTop = 100; // because GiftedChat is inverted
//     const isCloseToBottom = contentOffset.y <= paddingToTop;
//     setIsAtBottom(isCloseToBottom);
//     if (isCloseToBottom) setShowNewMessageChip(false);
//   };

//   // -------------
//   // Render
//   // -------------
//   if (loading) {
//     return (
//       <Div flex={1} justifyContent="center" mt={-100}>
//         <ActivityIndicator color={colorPrimary} size="large" />
//       </Div>
//     );
//   }

//   // Helper function to get color based on user ID
//   const getAvatarColor = (userId: string): string => {
//     const colors = [
//       "#9b59b6", // Purple
//       "#e74c3c", // Red
//       "#3498db", // Blue
//       "#1abc9c", // Teal
//       "#f39c12", // Orange
//       "#2ecc71", // Green
//       "#e91e63", // Pink
//       "#9c27b0", // Deep Purple
//       "#00bcd4", // Cyan
//       "#ff9800", // Amber
//     ];
    
//     // Generate a consistent color based on userId
//     const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     return colors[hash % colors.length];
//   };

//   // // Avatar render: show initials in colored circle
//   // const renderAvatar = (avatarProps: any) => {
//   //   // In inverted layout: current user is on LEFT, others are on RIGHT
//   //   const isCurrentUserMessage = avatarProps.currentMessage.user._id === user?.id;
//   //   const messageUser = avatarProps.currentMessage.user;
    
//   //   // Try to get the actual username
//   //   let displayName = messageUser.name;
    
//   //   // If no name is available, create a unique name from user ID
//   //   if (!displayName || displayName === "Unknown") {
//   //     if (isCurrentUserMessage) {
//   //       displayName = userName || user?.name || "You";
//   //     } else {
//   //       // Extract a readable part from user ID (e.g., "user_123" -> "User 123")
//   //       const userId = messageUser._id.toString();
//   //       // Try to extract number or use last few chars
//   //       const match = userId.match(/\d+$/);
//   //       if (match) {
//   //         displayName = `User ${match[0]}`;
//   //       } else {
//   //         // Use last 2 characters of ID for uniqueness
//   //         displayName = `U${userId.slice(-2)}`;
//   //       }
//   //     }
//   //   }
    
//   //   const avatarImageUrl = messageUser.avatar || "";

//   //   // Get first character of name for initials (or first 2 chars if it's like "U1")
//   //   let initials = displayName.charAt(0).toUpperCase();
    
//   //   // If displayName starts with "User " or "U" followed by digit, show both chars
//   //   if (displayName.match(/^U\d/) || displayName.match(/^User \d/)) {
//   //     // For "U5" show "U5", for "User 123" show "U1"
//   //     const match = displayName.match(/^U(\d+)/i);
//   //     if (match) {
//   //       initials = `U${match[1].charAt(0)}`;
//   //     }
//   //   }
    
//   //   const avatarColor = getAvatarColor(messageUser._id);

//   //   return (
//   //     <View
//   //       style={{
//   //         marginBottom: 14,
//   //         marginLeft: isCurrentUserMessage ? 10 : -6,  // Current user on left = margin left 4
//   //         marginRight: isCurrentUserMessage ? -6 : 4, // Others on right = margin right 4
//   //         position: "relative",
//   //       }}
//   //     >
      
     
 

//   //       {avatarImageUrl ? (
//   //         // If user has an avatar image, show it
//   //         <Image
//   //           source={{ uri: avatarImageUrl }}
//   //           style={{
//   //             width: 40,
//   //             height: 40,
//   //             borderRadius: 20,
//   //           }}
//   //         />
//   //       ) : (
//   //         // Show initials in colored circle
//   //         <View
//   //           style={{
//   //             width: 40,
//   //             height: 40,
//   //             borderRadius: 20,
//   //             backgroundColor: avatarColor,
//   //             justifyContent: "center",
//   //             alignItems: "center",
//   //           }}
//   //         >
//   //           <Text
//   //             style={{
//   //               color: "#fff",
//   //               fontSize: initials.length > 1 ? 14 : 18,  // Smaller font for 2 chars
//   //               fontWeight: "bold",
//   //             }}
//   //           >
//   //             {initials}
//   //           </Text>
//   //         </View>
//   //       )}
//   //     </View>
//   //   );
//   // };
//   // Avatar render: show static image for others, keep current user logic
// const renderAvatar = (avatarProps: any) => {
//   // In inverted layout: current user is on LEFT, others are on RIGHT
//   const isCurrentUserMessage = avatarProps.currentMessage.user._id === "current_user";
//   const messageUser = avatarProps.currentMessage.user;
  
//   // Try to get the actual username
//   let displayName = messageUser.name;
  
//   // If no name is available, create a unique name from user ID
//   if (!displayName || displayName === "Unknown") {
//     if (isCurrentUserMessage) {
//       displayName = userName || user?.name || "You";
//     } else {
//       // Extract a readable part from user ID (e.g., "user_123" -> "User 123")
//       const userId = messageUser._id.toString();
//       // Try to extract number or use last few chars
//       const match = userId.match(/\d+$/);
//       if (match) {
//         displayName = `User ${match[0]}`;
//       } else {
//         // Use last 2 characters of ID for uniqueness
//         displayName = `U${userId.slice(-2)}`;
//       }
//     }
//   }

//   const avatarImageUrl = messageUser.avatar || "";

//   // Get first character of name for initials (or first 2 chars if it's like "U1")
//   let initials = displayName.charAt(0).toUpperCase();
  
//   // If displayName starts with "User " or "U" followed by digit, show both chars
//   if (displayName.match(/^U\d/) || displayName.match(/^User \d/)) {
//     // For "U5" show "U5", for "User 123" show "U1"
//     const match = displayName.match(/^U(\d+)/i);
//     if (match) {
//       initials = `U${match[1].charAt(0)}`;
//     }
//   }
  
//   const avatarColor = getAvatarColor(messageUser._id);

//   // 🔥 IMPORTANT CHANGE: Static image URL for other members (left side)
//   const staticImageUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"; // Replace with your desired static image URL

//   return (
//     <View
//       style={{
//         marginBottom: 14,
//         marginLeft: isCurrentUserMessage ? 0 : -6,  // Current user on left = margin left 4
//         marginRight: isCurrentUserMessage ? -1 : 4, // Others on right = margin right 4
//         position: "relative",
//       }}
//     >
//       {/* For CURRENT USER (right side) - Keep existing logic */}
//       {isCurrentUserMessage ? (
//         avatarImageUrl ? (
//           // If current user has an avatar image, show it
//           <Image
//             source={{ uri: avatarImageUrl }}
//             style={{
//               width: 40,
//               height: 40,
//               borderRadius: 20,
//             }}
//           />
//         ) : (
//           // Show initials in colored circle for current user
//           <View
//             style={{
//               width: 40,
//               height: 40,
//               borderRadius: 20,
//               backgroundColor: avatarColor,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Text
//               style={{
//                 color: "#fff",
//                 fontSize: initials.length > 1 ? 14 : 18,  // Smaller font for 2 chars
//                 fontWeight: "bold",
//               }}
//             >
//               {initials}
//             </Text>
//           </View>
//         )
//       ) : (
//         // 🔥 FOR OTHER MEMBERS (left side) - Always show static image
//         <Image
//           // source={require('@/assets/splash.png')}
//           source={require('../../../assets/images/userother.png')}
//           style={{
//             width: 40,
//             height: 40,
//             borderRadius: 20,
//           }}
//         />
//       )}
//     </View>
//   );
// };



//     // -----------------------------------------------------------
//   // 6️⃣ CUSTOM HEADER UI
//   // -----------------------------------------------------------
//   const Header = () => (
//     <View style={styles.header}>
//     <View style={styles.headerunder}>
//       <TouchableOpacity >
//         <Text style={styles.back}>◀</Text>
//       </TouchableOpacity>

//       <Image
//         source={{
//           uri:
//             groupInfo?.groupAvatarUrl ||
        
//             "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
//         }}
//         style={styles.avatar}
//       />

//       <View>
//         <Text style={styles.groupName}>
//           {groupInfo?.baseInfo?.groupName || "Group"}
//         </Text>
//         <Text style={styles.notice}>
//           {groupInfo?.groupNotice || "No notice available"}
//         </Text>
//       </View>
//       </View>
    
//     </View>
//   );
//   return (
//     <Div flex={1} style={{ width: "100%", position: "relative" ,backgroundColor:"white",}}>
//         <Header />
//       <GiftedChat
//        inverted={false}  
//         messages={messages.sort((a, b) => +a.createdAt - +b.createdAt)}
//         onSend={(msgs) => onSend(msgs)}
//         onLoadEarlier={handleLoadEarlier}
//         isLoadingEarlier={isLoadingEarlier}
//         loadEarlier={hasMoreMessages}
//         isTyping={isTyping}
//         // user={{ _id: "__inverted_user__", name: userName }} // Inverted: use dummy ID so current user messages show on left
//          user={{ _id: "current_user", name: userName || user?.name , avatar: ""}} // ✅ changed to match convertToGifted
//         showAvatarForEveryMessage={false}
//         showUserAvatar={true}
//         renderBubble={(props) => <ChatBubble {...props}  />}
//         renderAvatar={renderAvatar}
//         listViewProps={{
//           showsVerticalScrollIndicator: false,
//           ref: listViewRef,
//           onScroll: handleScroll,
//           scrollEventThrottle: 16,
//           onLayout: () => {
//             if (listViewRef.current) {
//               // @ts-ignore
//               listViewRef.current.scrollToOffset({ offset: 0, animated: true });
//             }
//           },
//           maintainVisibleContentPosition: { minIndexForVisible: 0 },
//         }}
//         renderInputToolbar={(props) => (
//           <ChatComposer
//             {...props}
//             isSending={isSending}
//             replyingTo={null /* you can implement reply state for group */}
//             onCancelReply={() => {}}
//             expertName={groupName}
//           />
//         )}
//         renderChatFooter={() => <Div></Div>}
//         renderChatEmpty={() => (
//           <Div flex={1} p={20}    justifyContent="flex-end"   style={{
//   transform: [
//     { scaleY: -1 },     // flip vertically back to normal
//     { rotate: "0deg" }, // ensure no unwanted rotation
//   ],
// }} >
//             <Text fontFamily={fontHauoraSemiBold} fontSize={"2xl"} mb={10}>
//               Welcome to {groupName}
//             </Text>
//             <Text>Start the conversation — everyone in the group will see it.</Text>
//           </Div>
//         )}
//       />

//       {showNewMessageChip && (
//         <TouchableOpacity
//           onPress={scrollToBottom}
//           style={{
//             position: "absolute",
//             bottom: 80,
//             right: 16,
//             backgroundColor: colorPrimary,
//             paddingHorizontal: 16,
//             paddingVertical: 8,
//             borderRadius: 20,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.25,
//             shadowRadius: 3.84,
//             elevation: 5,
//           }}
//         >
//           <Text color="white" fontSize="sm" fontWeight="bold">
//             New Message
//           </Text>
//         </TouchableOpacity>
//       )}
//     </Div>
//   );
// }


// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:"space-between",
//     padding: 12,
//     backgroundColor: "#fff",
//     elevation: 3,
//   },
//     headerunder: {
//     flexDirection: "row",
//     // alignItems: "center",
//     // padding: 12,
//     // backgroundColor: "#fff",
//     // elevation: 3,
//   },
//   back: {
//     fontSize: 22,
//     marginRight: 12,
//   },
//   avatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     marginRight: 12,
//   },
//   groupName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   notice: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 2,
//   },
// });

