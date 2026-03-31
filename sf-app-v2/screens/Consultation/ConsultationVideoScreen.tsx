import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  findNodeHandle,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useUserStore } from "@/store/modules/user";
import { NavigationType } from "@/store/types";
import { requestPermissions } from "@/utils/chat.v2";
import { Button, Div, Icon, Text } from "react-native-magnus";
import ZegoExpressEngine, {
  ZegoAudioSourceType,
  ZegoRoomConfig,
  ZegoRoomState,
  ZegoScenario,
  ZegoUpdateType,
  ZegoVideoMirrorMode,
  ZegoVideoSourceType,
  ZegoViewMode,
} from "zego-express-engine-reactnative";
import { ZegoTextureView } from "zego-express-engine-reactnative";
import { IconVideoOff } from "@tabler/icons-react-native";
import { ZegoRemoteDeviceState } from "zego-express-engine-reactnative";
import { useIsFocused } from "@react-navigation/native";
import { useUIStore } from "@/store/modules/ui";
import { activateKeepAwake, activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import AsyncStorage from "@react-native-async-storage/async-storage";

let zg: ZegoExpressEngine | null = null;
let isInRoom = false; // Add this line to track room status

const ConsultationVideoScreen: React.FC<{ navigation: NavigationType }> = ({ navigation }) => {
  const route = useRoute();
  const { user } = useUserStore();
  const [localStream, setLocalStream] = useState<string | null>(null);
  const [remoteStream, setRemoteStream] = useState<string | null>(null);
  const localViewRef = useRef(null);
  const remoteViewRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(true);
  const [isRemoteAudioEnabled, setIsRemoteAudioEnabled] = useState(true);
  const [isRemoteStreamLoading, setIsRemoteStreamLoading] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const expertId = (route.params as Record<string, string>)?.expertId;
  const caseId = (route.params as Record<string, string>)?.caseId;

  const isFocused = useIsFocused();

  const setBackgroundColor = useUIStore((state) => state.setBackgroundColor);

  // Update event listener setup
  const eventHandler = {
    roomStateUpdate: (
      roomID: string,
      state: ZegoRoomState,
      errorCode: number,
      extendedData: string
    ) => {
      if (state === ZegoRoomState.Disconnected) {
        leaveRoom();
      }
    },
    roomStreamUpdate: (roomID: string, updateType: ZegoUpdateType, streamList: any[]) => {
      if (updateType === ZegoUpdateType.Add) {
        const remoteStream = streamList[0];
        setRemoteStream(remoteStream.streamID);
        startRemoteStream(remoteStream.streamID);
      } else if (updateType === ZegoUpdateType.Delete) {
        setRemoteStream(null);
        endHandler();
      }
    },
    remoteCameraStateUpdate: (streamID: string, state: ZegoRemoteDeviceState) => {
      setIsRemoteVideoEnabled(state === ZegoRemoteDeviceState.Open);
    },
    remoteMicStateUpdate: (streamID: string, state: ZegoRemoteDeviceState) => {
      setIsRemoteAudioEnabled(state === ZegoRemoteDeviceState.Open);
    },
  };

  useEffect(() => {
    if (isFocused) {
      setBackgroundColor("#000");
      activateKeepAwakeAsync();
    } else {
      setBackgroundColor("#FAF8F5");
      deactivateKeepAwake();
    }

    return () => {
      deactivateKeepAwake();
      setBackgroundColor("#FAF8F5");
    };
  }, [isFocused]);

  useEffect(() => {
    const initializeZEGO = async () => {
      await requestPermissions();
      const envs = JSON.parse((await AsyncStorage.getItem("envs")) as string);

      const appID = envs.ZEGO_APP_ID as string;
      const appSign = envs.ZEGO_APP_SIGN as string;

      await ZegoExpressEngine.createEngineWithProfile({
        appID: parseInt(appID),
        appSign,
        scenario: ZegoScenario.StandardVideoCall,
      });

      ZegoExpressEngine.instance().setVideoSource(ZegoVideoSourceType.Camera, undefined);
      ZegoExpressEngine.instance().setAudioSource(ZegoAudioSourceType.Microphone, undefined);

      ZegoExpressEngine.instance().on("roomStateUpdate", eventHandler.roomStateUpdate);
      ZegoExpressEngine.instance().on("roomStreamUpdate", eventHandler.roomStreamUpdate);
      ZegoExpressEngine.instance().on(
        "remoteCameraStateUpdate",
        eventHandler.remoteCameraStateUpdate
      );
      ZegoExpressEngine.instance().on("remoteMicStateUpdate", eventHandler.remoteMicStateUpdate);

      joinRoom();
    };

    initializeZEGO();

    return () => {
      ZegoExpressEngine.destroyEngine();

      leaveRoom();
    };
  }, []);

  const sendPing = () => {
    ZegoExpressEngine.instance().sendCustomCommand(expertId, "ping", []);
  };

  useEffect(() => {
    const pingInterval = setInterval(() => {
      sendPing();
    }, 10000); // Send ping every 10 seconds

    return () => {
      clearInterval(pingInterval); // Clean up on unmount
    };
  }, []);

  const toggleMute = () => {
    ZegoExpressEngine.instance().mutePublishStreamAudio(!isMuted, undefined);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    const _isVideoEnabled = !isVideoEnabled;

    ZegoExpressEngine.instance().mutePublishStreamVideo(!_isVideoEnabled, undefined);

    setIsVideoEnabled(_isVideoEnabled);

    if (_isVideoEnabled) {
      startPreview();
    } else {
      ZegoExpressEngine.instance().stopPreview(undefined);
    }
  };

  const startPreview = useCallback(() => {
    if (localViewRef.current) {
      const localViewHandle = findNodeHandle(localViewRef.current);

      if (localViewHandle) {
        ZegoExpressEngine.instance().startPreview(
          {
            reactTag: localViewHandle,
            viewMode: ZegoViewMode.AspectFill,
            backgroundColor: 0x000000,
          },
          undefined
        );
      }
    }
  }, []);

  const startPublishingStream = useCallback(
    (stream?: string) => {
      if (stream ?? localStream) {
        ZegoExpressEngine.instance().startPublishingStream(
          stream ?? localStream ?? "",
          undefined,
          undefined
        );
      }
    },
    [localStream]
  );

  const startRemoteStream = useCallback(async (streamID: string) => {
    if (remoteViewRef.current) {
      const remoteViewHandle = findNodeHandle(remoteViewRef.current);

      await ZegoExpressEngine.instance().startPlayingStream(
        streamID,
        {
          reactTag: remoteViewHandle as number,
          viewMode: ZegoViewMode.AspectFill,
          backgroundColor: 0x000000,
        },
        undefined
      );

      setIsRemoteStreamLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async () => {
    if (!user || !user.id) {
      console.error("User or user ID is missing");
      return;
    }

    if (isInRoom) {
      console.log("Already in a room, skipping join");
      return;
    }

    try {
      let roomConfig = new ZegoRoomConfig(0, true, "");

      const result = await ZegoExpressEngine.instance().loginRoom(
        expertId,
        { userID: user.id, userName: user.name || "User" },
        roomConfig
      );

      if (result.errorCode !== 0) {
        throw new Error(`Failed to join room: ${result.errorCode}`);
      }

      isInRoom = true;

      const localStreamID = new Date().getTime().toString();

      setLocalStream(localStreamID);

      if (remoteStream) {
        startRemoteStream(remoteStream);
      }
      // Start publishing your own stream
      startPublishingStream(localStreamID);

      startPreview();
      console.log("Stream published successfully");
    } catch (error) {
      console.error("Error in joinRoom:", error);
    }
  }, [user, expertId, startRemoteStream]);

  const leaveRoom = useCallback(async () => {
    if (!isInRoom) {
      console.log("Not in a room, skipping leave");
      return;
    }

    if (localStream) {
      await ZegoExpressEngine.instance().stopPreview(undefined);
      await ZegoExpressEngine.instance().stopPublishingStream(undefined);
    }

    await ZegoExpressEngine.instance().logoutRoom(expertId);

    isInRoom = false; // Reset room status after leaving
  }, [localStream, expertId]);

  const endHandler = useCallback(async () => {
    await leaveRoom();
    navigation.navigate("ConsultationFeedbackScreen", {
      expertId: expertId,
      caseId: caseId,
    });
  }, [leaveRoom, navigation, expertId, caseId]);

  const switchCamera = useCallback(() => {
    ZegoExpressEngine.instance().useFrontCamera(!isFrontCamera, undefined);
    setIsFrontCamera(!isFrontCamera);
  }, [isFrontCamera]);

  return (
    <Div flex={1} bg="#000">
      <Div style={styles.remoteView}>
        <ZegoTextureView
          ref={remoteViewRef}
          style={[
            styles.videoView,
            {
              display: isRemoteStreamLoading || !isRemoteVideoEnabled ? "none" : "flex",
              borderRadius: 12,
              overflow: "hidden",
            },
          ]}
        />

        {(isRemoteStreamLoading || !isRemoteVideoEnabled) && (
          <Div justifyContent="center" alignItems="center" flex={1} w="100%" h="100%" bg="#000">
            {isRemoteStreamLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <IconVideoOff size={40} color="white" />
            )}
          </Div>
        )}

        <Div position="absolute" top={10} left={10}>
          <Icon
            name={isRemoteAudioEnabled ? "mic" : "mic-off"}
            color="white"
            fontFamily="Feather"
            fontSize={"2xl"}
          />
        </Div>
      </Div>

      <Div style={styles.localView}>
        <ZegoTextureView
          ref={localViewRef}
          style={[styles.videoView, { display: isVideoEnabled ? "flex" : "none" }]}
        />
        {!isVideoEnabled && (
          <Div justifyContent="center" alignItems="center" w="100%" h="100%" flex={1} bg="#000">
            <IconVideoOff size={40} color="white" />
          </Div>
        )}
      </Div>

      <Div position="absolute" w="100%" alignItems="center" bottom={20}>
        <Div
          w={"80%"}
          justifyContent="space-between"
          flexDir="row"
          bg="rgba(0,0,0,0.5)"
          p={10}
          px={20}
          rounded={30}
        >
          <Button
            bg={isMuted ? "gray500" : "blue500"}
            h={50}
            w={50}
            rounded="circle"
            onPress={toggleMute}
          >
            <Icon
              name={isMuted ? "mic-off" : "mic"}
              color="white"
              fontFamily="Feather"
              fontSize={"2xl"}
            />
          </Button>
          <Button
            bg={isVideoEnabled ? "blue500" : "gray500"}
            h={50}
            w={50}
            rounded="circle"
            onPress={toggleVideo}
          >
            <Icon
              name={isVideoEnabled ? "video" : "video-off"}
              color="white"
              fontFamily="Feather"
              fontSize={"2xl"}
            />
          </Button>
          <Button bg="blue500" h={50} w={50} rounded="circle" onPress={switchCamera}>
            <Icon name="refresh-cw" color="white" fontFamily="Feather" fontSize={"2xl"} />
          </Button>
          <Button bg="red500" h={50} w={50} rounded="circle" onPress={endHandler}>
            <Icon name="phone-off" color="white" fontFamily="Feather" fontSize={"2xl"} />
          </Button>
        </Div>
      </Div>
    </Div>
  );
};

const styles = StyleSheet.create({
  localView: {
    flex: 1,
  },
  remoteView: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 230,
    height: 150,
    zIndex: 1,
    borderRadius: 12,
  },
  videoView: {
    width: "100%",
    height: "100%",
  },
  endCallButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
});

export default ConsultationVideoScreen;
