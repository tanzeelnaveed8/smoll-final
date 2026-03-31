import { useUserStore } from "@/store/modules/user";
import {
  IconArrowBackUp,
  IconLoader,
  IconMicrophone,
  IconPaperclip,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPlay,
  IconVideo,
} from "@tabler/icons-react-native";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

// Optional haptics import - will work if expo-haptics is installed
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch (e) {
  // Haptics not available, will skip haptic feedback
}
import { MessageImage } from "react-native-gifted-chat";
import { Bubble, BubbleProps, IMessage, MessageText, Time } from "react-native-gifted-chat";
import { Div, Text } from "react-native-magnus";

interface Props extends BubbleProps<IMessage> {
  onReply?: (message: IMessage) => void;
  currentUser?: any;
}

const commonWrapperStyles: StyleProp<ViewStyle> = {
  paddingTop: 12,
  paddingBottom: 12,
  paddingRight: 4,
  paddingLeft: 4,
  marginBottom: 14,
};

const rightWrapperStyles: StyleProp<ViewStyle> = {
  ...commonWrapperStyles,
  paddingLeft: 5,
  borderTopRightRadius: 24,
  borderTopLeftRadius: 24,
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: 24,
  backgroundColor: "#222",
};

const leftWrapperStyles: StyleProp<ViewStyle> = {
  ...commonWrapperStyles,
  paddingRight: 2,
  borderTopRightRadius: 24,
  borderTopLeftRadius: 24,
  borderBottomRightRadius: 24,
  borderBottomLeftRadius: 0,
  backgroundColor: "white",
};

const leftTextStyles: StyleProp<TextStyle> = {
  color: "#222",
};

const rightTextStyles: StyleProp<TextStyle> = {
  color: "#fff",
};

const ChatBubble: React.FC<Props> = (props) => {
  // console.log("reply current user ----------------->",props?.currentUser)user?.id
  const current_user=props.currentMessage.user._id === props.currentUser;
  const { user } = useUserStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // INVERTED LAYOUT: Current user's messages on LEFT, others on RIGHT
  const position =
    props.currentMessage?.user._id.toString().toLowerCase() === user?.id.toLowerCase()
      ? "left"  // Current user = left side
      : "right"; // Other users = right side

  const isAudioMessage = !!props.currentMessage?.audio;

  const getWrapperStyle = (position: "left" | "right"): StyleProp<ViewStyle> => {
    const baseStyle = position === "right" ? rightWrapperStyles : leftWrapperStyles;

    return isAudioMessage ? { ...baseStyle, backgroundColor: "transparent" } : baseStyle;
  };

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (!props.currentMessage?.audio) return;

    (async () => {
      try {
        // Set loading state to true
        setIsLoading(true);

        // Load the audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: props.currentMessage?.audio || "" },
          { shouldPlay: false, volume: 1 },
          (status) => {
            if ("error" in status) {
              console.error("Error loading audio:", status.error);
              setLoadError("Failed to load audio. The file may be damaged.");
            }
          }
        );

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
        });

        setSound(newSound);

        const status = await newSound.getStatusAsync();

        if (status.isLoaded) {
          setDuration(status.durationMillis ?? 0);
          setCurrentTime(status.durationMillis ?? 0);
        }

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentTime(status.durationMillis ?? 0);
            } else {
              setCurrentTime(status.durationMillis! - (status.positionMillis ?? 0));
            }
          }
        });

        // Set loading state to false when done
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading audio:", error);
        setLoadError("Failed to load audio. Please try again.");
        setIsLoading(false);
      }
    })();
  }, [props.currentMessage]);

  const renderAttachment = (text: string) => {
    if (!text.startsWith("[ATTACHMENT]")) return null;

    const [, fileName, url] = text.split("|");

    const handlePress = () => {
      Linking.openURL(url).catch((err) => console.error("An error occurred", err));
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <Div
          alignItems="center"
          bg={position === "left" ? "#E0E0E0" : "#333"}
          p={8}
          pr={12}
          rounded={8}
          mb={4}
          flexDir="row"
          minW={"fit-content"}
        >
          <Div mr={8}>
            <IconPaperclip fontSize={24} color={position === "left" ? "#333" : "#FFF"} />
          </Div>
          <Div>
            <Text
              fontSize={14}
              fontWeight="bold"
              color={position === "left" ? "#333" : "#FFF"}
              numberOfLines={1}
            >
              {fileName}
            </Text>
          </Div>
        </Div>
      </TouchableOpacity>
    );
  };

  const handlePlayPause = async () => {
    if (!props.currentMessage?.audio) return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReply = () => {
    if (props.currentMessage && props.onReply) {
      // Add haptic feedback if available
      if (Haptics) {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          // Haptics not available, continue without it
        }
      }
      props.onReply(props.currentMessage);
    }
  };

  const renderReplyButton = (options?: { style?: StyleProp<ViewStyle> }) => {
    if (!props.onReply) return null;

    // Current user (left side messages): button on LEFT side with black background, white icon
    // Other users (right side messages): button on RIGHT side with white background, black icon
    const buttonPosition = position === "left" 
      ? { left: -35 } // Current user: button on left side
      : { right: -32 }; // Other users: button on right side

    // Colors based on position
    const backgroundColor = position === "left" ? "#222" : "white"; // Black for current user, White for others
    const iconColor = position === "left" ? "#f4f6f8" : "black"; // White for current user, Black for others

    return (
      <TouchableOpacity
        onPress={handleReply}
        style={{
          // padding: 6,
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          ...buttonPosition,
          top: "10%",
          transform: [{ translateY: -12 }],
          height: 24,
          width: 24,
          // @ts-ignore
          ...options?.style,
        }}
      >
        <Div
          bg={backgroundColor}
          // p={6}
          rounded="circle"
          w={24}
          h={24}
          justifyContent="center"
          alignItems="center"
        >
          <IconArrowBackUp size={12} color={iconColor} />
        </Div>
      </TouchableOpacity>
    );
  };

  const renderRepliedMessage = () => {
    const replyTo = props.currentMessage?.replyTo;
    console.log("this is usert-->",props?.currentMessage?.user?.name)
    if (!replyTo) return null;

    const renderReplyContent = () => {
      if (replyTo.image) {
        return (
          <Div row alignItems="center">
            <IconPhoto size={16} color={current_user ? "#666" : "#FFF"} />
            <Text ml={4} color={current_user ? "#666" : "#FFF"} fontSize={12}>
              Photo
            </Text>
            <Image
              source={{ uri: replyTo.image }}
              style={{
                height: 40,
                width: 40,
                marginLeft: 8,
                borderRadius: 4,
                resizeMode: "cover",
              }}
            />
          </Div>
        );
      } else if (replyTo.video) {
        return (
          <Div row alignItems="center">
            <IconVideo size={16} color={position === "left" ? "#666" : "#FFF"} />
            <Text ml={4} color={position === "left" ? "#666" : "#FFF"} fontSize={12}>
              Video
            </Text>
            <Image
              source={{ uri: replyTo.video }}
              style={{
                height: 40,
                width: 40,
                marginLeft: 8,
                borderRadius: 4,
                resizeMode: "cover",
              }}
            />
          </Div>
        );
      } else if (replyTo.audio) {
        return (
          <Div row alignItems="center">
            <IconMicrophone size={16} color={position === "left" ? "#666" : "#FFF"} />
            <Text ml={4} color={position === "left" ? "#666" : "#FFF"} fontSize={12}>
              Voice Message
            </Text>
          </Div>
        );
      }

      return (
        <Text color={position === "left" ? "#666" : "#333"} fontSize={12} numberOfLines={1}>
          {replyTo.text}
        </Text>
      );
    };

    return (
      <Div
        bg={position === "left" ? "rgba(0,0,0,0.05)" : "#FFFFFF"}
        px={8}
        py={4}
        rounded={4}
        mb={4}
        right={position === "right" ? 4 : undefined}
        left={position === "left" ? 4 : undefined}
        // borderColor="red"
      >
        <Text color={position === "left" ? "#333" : "#333"} fontSize={10} fontWeight="bold" mb={2}>
          {replyTo.user.name || "You"}
        </Text>
        {renderReplyContent()}
      </Div>
    );
  };

  if (props.currentMessage?.text?.startsWith("[ATTACHMENT]")) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: { backgroundColor: "transparent" },
          right: { backgroundColor: "transparent" },
        }}
        renderMessageText={() => (
          <Div>
            {renderRepliedMessage()}
            {renderAttachment(props.currentMessage?.text || "")}
            <Div row justifyContent="flex-end">
              <Time {...props} timeTextStyle={{ right: { fontSize: 10, color: "#666" } }} />
            </Div>
            {renderReplyButton()}
          </Div>
        )}
      />
    );
  }

  if (props.currentMessage?.image) {
    return (
      <Div style={{ marginRight: 6 }}>
        {renderRepliedMessage()}
        <Div position="relative">
          <MessageImage
            {...props}
            imageStyle={{
              height: 160,
              width: 160,
              borderRadius: 8,
            }}
          />
          {renderReplyButton()}
        </Div>
        <Div row justifyContent="flex-end">
          <Time
            {...props}
            timeTextStyle={{
              right: { fontSize: 10, color: "#666" },
              left: { fontSize: 10, color: "#666" },
            }}
          />
        </Div>
      </Div>
    );
  }

  if (props.currentMessage?.video) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: { backgroundColor: "transparent" },
          right: { backgroundColor: "transparent" },
        }}
        renderMessageText={() => (
          <Div>
            {renderRepliedMessage()}
            <Div position="relative">
              <Image
                source={{ uri: props.currentMessage?.video }}
                style={{
                  height: 200,
                  width: 200,
                  marginLeft: 8,
                  borderRadius: 8,
                }}
                resizeMode="cover"
              />
              {renderReplyButton()}
            </Div>
            <Div row justifyContent="flex-end">
              <Time
                {...props}
                timeTextStyle={{
                  right: { fontSize: 10, color: "#666" },
                  left: { fontSize: 10, color: "#666" },
                }}
              />
            </Div>
          </Div>
        )}
      />
    );
  }

  const renderAudioPlayer = () => {
    const formatDuration = (milliseconds: number | null) => {
      if (!milliseconds) return "00:00";

      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    };

    if (loadError) {
      return (
        <Div
          alignItems="center"
          bg={position === "left" ? "#E0E0E0" : "#333"}
          p={8}
          pr={12}
          rounded={8}
          mb={2}
          flexDir="row"
          minW={"fit-content"}
        >
          <Text fontSize={12} color={position === "left" ? "#666" : "#CCC"}>
            {loadError}
          </Text>
        </Div>
      );
    }

    return (
      <Div position="relative">
        <TouchableOpacity onPress={isLoading ? undefined : handlePlayPause}>
          <Div
            alignItems="center"
            bg={position === "left" ? "#E0E0E0" : "#333"}
            p={8}
            pr={12}
            rounded={8}
            mb={2}
            flexDir="row"
            minW={"fit-content"}
          >
            <Div mr={8}>
              {isLoading ? (
                <ActivityIndicator size={24} color={position === "left" ? "#333" : "#FFF"} />
              ) : isPlaying ? (
                <IconPlayerPause fontSize={24} color={position === "left" ? "#333" : "#FFF"} />
              ) : (
                <IconPlayerPlay fontSize={24} color={position === "left" ? "#333" : "#FFF"} />
              )}
            </Div>
            <Div flexDir="column">
              <Text fontSize={14} fontWeight="bold" color={position === "left" ? "#333" : "#FFF"}>
                {isLoading ? "Loading Audio..." : "Audio Message"}
              </Text>
              <Text fontSize={12} color={position === "left" ? "#666" : "#CCC"}>
                {isLoading ? "Please wait" : formatDuration(isPlaying ? currentTime : duration)}
              </Text>
            </Div>
          </Div>
        </TouchableOpacity>
        {renderReplyButton()}
      </Div>
    );
  };

  return (
    <Bubble
      {...props}
      renderTime={() => null}
      wrapperStyle={{
        left: getWrapperStyle("left"),
        right: getWrapperStyle("right"),
      }}
      renderMessageAudio={renderAudioPlayer}
      renderMessageText={() => (
        <Div>
          {renderRepliedMessage()}
          <MessageText
            {...props}
            textStyle={{
              left: leftTextStyles,
              right: rightTextStyles,
            }}
          />
          <Div row justifyContent="flex-end" alignItems="flex-end">
            <Time
              {...props}
              timeTextStyle={{
                right: {
                  fontSize: 10,
                  color: "#CCC",
                },
                left: {
                  fontSize: 10,
                  color: "#666",
                },
              }}
            />
          </Div>
          {renderReplyButton()}
        </Div>
      )}
    />
  );
};

export default ChatBubble;
