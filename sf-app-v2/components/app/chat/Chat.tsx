import { colorPrimary, fontHauoraSemiBold } from "@/constant/constant";
import { useSound } from "@/functions/useSound";
import { useExpertStore } from "@/store/modules/expert";
import { useUserStore } from "@/store/modules/user";
import { getMessages, initializeChat, sendMessage, zim } from "@/utils/chat.v2";
import { transformMessages } from "@/utils/helpers";
import { useIsFocused } from "@react-navigation/native";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, TouchableOpacity, View } from "react-native";
import { Avatar, GiftedChat, GiftedChatProps, IMessage } from "react-native-gifted-chat";
import { Badge, Div, Image, Text } from "react-native-magnus";
import {
  ZIMConversationType,
  ZIMMessage,
  ZIMMessageQueryConfig,
  ZIMMessageType,
} from "zego-zim-react-native";
import ChatBubble from "./ChatBubble";
import ChatComposer from "./ChatComposer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";

interface Props {
  initialMessages: IMessage[];
  recipientId: string;
  chatFor: "experts" | "counsellors";
  chatWithName?: string;
  expertIsOnline: boolean;
}

const Chat: React.FC<Props> = (props) => {
  const { play } = useSound();
  const { user } = useUserStore();

  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);

  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false);
  const [loading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [channelUrl, setChannelUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessage, setLastMessage] = useState<ZIMMessage | null>(null);
  const [showNewMessageChip, setShowNewMessageChip] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const isFocused = useIsFocused();
  const listViewRef = useRef<GiftedChatProps<IMessage>["listViewProps"]>(null);
  const { unreadMessages, setUnreadMessage, conversations, setConversations, setActiveConvo } =
    useExpertStore();
  const [noNewMessage, setNoNewMessage] = useState(true);
  const { expertDetailMap } = useExpertStore();

  useEffect(() => {
    setLastMessage(null);

    setActiveConvo(props.recipientId);

    fetchMessages();
  }, [props.recipientId]);

  useEffect(() => {
    return () => {
      (async () => {
        await zim.clearConversationUnreadMessageCount(props.recipientId, 0);
      })();

      const udpatedUnreadMessages = unreadMessages;
      udpatedUnreadMessages.delete(props.recipientId);
      setUnreadMessage(udpatedUnreadMessages);

      setActiveConvo(null);
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
  }, [isFocused]);

  const scrollToBottom = () => {
    if (listViewRef.current) {
      // @ts-ignore
      listViewRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      });
      setShowNewMessageChip(false);
    }
  };

  const lastMessageKey = conversations.get(props.recipientId)?.[0]?.createdAt;

  useEffect(() => {
    const messages = conversations.get(props.recipientId) || [];
    const lastMessage = messages[0];

    // If no message yet, skip
    if (!lastMessage) return;

    const isIncoming = lastMessage.user._id === props.recipientId;

    if (!noNewMessage && isIncoming) {
      play("messageReceived");

      setTimeout(() => {
        if (isAtBottom) {
          setShowNewMessageChip(false);
          scrollToBottom();
        } else {
          setShowNewMessageChip(true);
        }
      }, 50);
    }

    if (noNewMessage) {
      setNoNewMessage(false);
    }
  }, [lastMessageKey]);

  // fetch messages
  const fetchMessages = async (isLoadingEarlier = false) => {
    if (!user) return;

    try {
      if (!isLoadingEarlier) {
        setIsLoading(true);
      } else {
        setIsLoadingEarlier(true);
      }

      const config: ZIMMessageQueryConfig = {
        count: 20,
        reverse: true,
      };

      if (lastMessage?.timestamp && isLoadingEarlier) {
        config.nextMessage = lastMessage as ZIMMessage;
      }

      if (!zim) {
        const storedEnvs = await AsyncStorage.getItem("envs");
        if (!storedEnvs) throw new Error("Missing envs");

        const parsedEnvs = JSON.parse(storedEnvs);
        await initializeChat(
          parsedEnvs?.ZEGO_APP_ID as string,
          parsedEnvs?.ZEGO_APP_SIGN as string,
          user.id,
          user.playerId,
          user.name || "",
          user?.profileImg?.url ?? ""
        );
      }

      const messageList = await getMessages(props.recipientId, ZIMConversationType.Peer, config);
  console.log("mesage history ",messageList)
      //  console.log(messageList,"TESTING")
      if (messageList.length === 0) {
        setHasMoreMessages(false);
        setLastMessage(null);
      } else {
        setLastMessage(messageList[0]);
      }

      const transformedMessages = transformMessages(messageList, {
        recipientId: props.recipientId,
        chatWithName: props.chatWithName || "",
      });

      const updatedConversations = conversations;

      if (isLoadingEarlier) {
        const prevMessages = conversations.get(props.recipientId) as [];
        updatedConversations.set(props.recipientId, [...prevMessages, ...transformedMessages]);
      } else {
        updatedConversations.set(props.recipientId, transformedMessages);
      }
      setConversations(updatedConversations);
    } catch (error) {
      console.log("-->",error);
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingEarlier(false);
    }
  };

  const handleLoadEarlier = async () => {
    if (isLoadingEarlier || !hasMoreMessages) return;
    setNoNewMessage(true);
    await fetchMessages(true);
  };

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;

    const paddingToTop = 100; // because GiftedChat is inverted
    const isCloseToBottom = contentOffset.y <= paddingToTop;

    setIsAtBottom(isCloseToBottom);

    if (isCloseToBottom) {
      setShowNewMessageChip(false); // hide chip when user scrolls down (to bottom)
    }
  };

  const handleSend = async (newMessages: IMessage[] = []) => {
    
    try {
      if (newMessages[0].image) {
        setIsSending(true);
      }

      // Add reply metadata
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

        newMessages[0].extendedData = JSON.stringify({
          repliedInfo: {
            senderUserID: replyingTo?.user?._id?.toString(),
            state: 0,
            messageID: replyingTo?._id?.toString(),
            sentTime: new Date(replyingTo?.createdAt).getTime(),
            messageInfo: {
              message: messageContent,
              type: messageType,
              fileDownloadUrl: fileDownloadUrl,
            },
            messageSeq: parseInt(replyingTo?._id?.toString()?.slice(-3)),
          },
        });
      }

      const response = await sendMessage(props.recipientId, newMessages);

      if (!response) return;

      const transformedMessages = transformMessages(response, {
        recipientId: props.recipientId,
        chatWithName: props.chatWithName || "",
      });
      const updatedConversations = conversations;
      const prevMessages = conversations.get(props.recipientId) as [];
      updatedConversations.set(props.recipientId, [...prevMessages, ...transformedMessages]);
      setConversations(updatedConversations);

      // Clear reply state after sending
      setReplyingTo(null);

      // Auto scroll to bottom if user is already at bottom
      await new Promise((resolve) => setTimeout(resolve, 50));
      scrollToBottom();
    } finally {
      setIsSending(false);
    }

    return;
  };

  const handleReply = (message: IMessage) => {
    setReplyingTo(message);
    console.log("this is check message replyyyy->",message)
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <Div flex={1} justifyContent="center" mt={-100}>
        <ActivityIndicator color={colorPrimary} size="large" />
      </Div>
    );
  }

  const showAvatar = (msg?: IMessage) => msg?.user.avatar;

  const emptyViewImgs = {
    cat: require("../../../assets/images/chat-screen-img.png"),
    dog: require("../../../assets/images/chat-screen-img-2.png"),
  };

  const imgTypes = ["cat", "dog"];
  const randomImgType = imgTypes[Math.floor(Math.random() * imgTypes.length)];

  const randomEmptyViewImg = emptyViewImgs[randomImgType as keyof typeof emptyViewImgs];

  const style = () => {
    if (randomImgType === "cat") {
      return Platform.OS === "android"
        ? { transform: [{ translateX: -70 }] }
        : { transform: [{ translateX: -50 }] };
    }

    return {};
  };

  const chatWithName = props.chatWithName;
  const renderVideoMessage = (videoProps: any) => {
  const {currentMessage} = videoProps;
              if (!currentMessage?.video) return null;

              return (
              <Div style={{ marginRight: 6 }
              }>
                <Video
                  source={{ uri: currentMessage.video }}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 8,
                    backgroundColor: "#000",
                  }}
                  useNativeControls
                  resizeMode='cover'
                  isLooping={false}
                />
              </Div>
              );
};

  const ChatEmptyView = () => {
    return (
      <Div flex={1}>
        <Div
          style={
            Platform.OS === "android"
              ? { transform: [{ rotate: "180deg" }] }
              : { transform: [{ rotate: "180deg" }, { rotateY: "180deg" }] }
          }
          flex={1}
          mt={20}
          justifyContent="space-between"
        >
          <Div px={20} pt={5} flex={1}>
            <Image
              source={randomEmptyViewImg}
              resizeMode="contain"
              h={200}
              style={style()}
              mb={15}
            />

            <Text fontFamily={fontHauoraSemiBold} fontSize={"2xl"} maxW={"70%"} mb={10}>
              Hi! Welcome to your messaging room.
            </Text>
            <Text maxW={"90%"}>
              It's just <Text fontFamily={fontHauoraSemiBold}>you and {props.chatWithName}</Text> in
              here. Feel free to chat, send pictures, files, or even voice notes.
            </Text>
          </Div>
        </Div>
      </Div>
    );
  };

  return (
    <Div
      flex={1}
      style={{
        width: "111%",
        position: "relative",
        left: -20,
        
      }}
      mb={2}
    >
      <GiftedChat
        messages={(conversations.get(props.recipientId) as IMessage[]).sort(
          (a, b) => +b.createdAt - +a.createdAt
        )}
        onSend={(messages) => handleSend(messages)}
        onLoadEarlier={handleLoadEarlier}
        isLoadingEarlier={isLoadingEarlier}
        loadEarlier={hasMoreMessages}
           renderMessageVideo={renderVideoMessage}
        isTyping={isTyping}
        user={{
          _id: user!.id,
          name: user?.name || "",
        }}
        showAvatarForEveryMessage={false}
        showUserAvatar={true}
        renderBubble={(props) => (
          <ChatBubble {...props} onReply={(message) => handleReply(message)} />
        )}
        renderAvatar={(avatarProps) => {
          const isUserMessage = user?.id === avatarProps.currentMessage.user._id;
          const avatar = isUserMessage
            ? { name: user?.name || "", avatar: user?.profileImg?.url ?? "" }
            : {
                avatar: expertDetailMap.get(props.recipientId)?.profileImg?.url,
                name: expertDetailMap.get(props.recipientId)?.name,
              };

          return (
            <View
              style={{
                marginBottom: 14,
                marginLeft: isUserMessage ? -10 : 4,
                marginRight: isUserMessage ? 4 : -10,
                position: "relative",
              }}
            >
              <Avatar
                {...avatarProps}
                currentMessage={{
                  ...avatarProps.currentMessage,
                  user: {
                    ...avatarProps.currentMessage.user,
                    ...avatar,
                  },
                }}
              />
              {props.expertIsOnline && !isUserMessage && (
                <Div position="absolute" top={-2} right={-2}>
                  <Badge h={1} w={1} bg="#00ff28" position="absolute" />
                </Div>
              )}
            </View>
          );
        }}
        renderMessageImage={(props) => null}
        listViewProps={{
          showsVerticalScrollIndicator: false,
          ref: listViewRef,
          onScroll: handleScroll,
          scrollEventThrottle: 16,
          onLayout: () => {
            if (listViewRef.current) {
              // @ts-ignore
              listViewRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          },
          maintainVisibleContentPosition: {
            minIndexForVisible: 0,
          },
        }}
        renderInputToolbar={(props) => (
          <ChatComposer
            {...props}
            isSending={isSending}
            channelUrl={channelUrl || ""}
            replyingTo={replyingTo}
            onCancelReply={cancelReply}
            expertName={chatWithName}
             screen={"oneTOonechat"}
          />
        )}
        renderChatFooter={() => <Div></Div>}
        renderChatEmpty={ChatEmptyView}
      />
      {showNewMessageChip && (
        <TouchableOpacity
          onPress={scrollToBottom}
          style={{
            position: "absolute",
            bottom: 80,
            right: 16,
            backgroundColor: colorPrimary,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text color="white" fontSize="sm" fontWeight="bold">
            New Message
          </Text>
        </TouchableOpacity>
      )}
    </Div>
  );
};

export default Chat; 