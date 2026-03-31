

import React from "react";
import { Modal, StyleSheet, TouchableOpacity, Image, Dimensions } from "react-native";
import { Div, Text } from "react-native-magnus";
import { Video, ResizeMode } from "expo-av";
import { IconFile, IconX } from "@tabler/icons-react-native";
import { colorPrimary, colorTextPrimary, fontHauoraSemiBold } from "@/constant/constant";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface MediaConfirmationModalProps {
    visible: boolean;
    mediaType: "image" | "video" | "document";
    mediaUri: string;
    mediaInfo?: {
        name?: string;
        size?: number;
        type?: string;
    };
    onConfirm: () => void;
    onCancel: () => void;
}

const MediaConfirmationModal: React.FC<MediaConfirmationModalProps> = ({
    visible,
    mediaType,
    mediaUri,
    mediaInfo,
    onConfirm,
    onCancel,
}) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const renderPreview = () => {
        switch (mediaType) {
            case "image":
                return (
                    <Image
                        source={{ uri: mediaUri }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                    />
                );

            case "video":
                return (
                    <Video
                        source={{ uri: mediaUri }}
                        style={styles.videoPreview}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={false}
                    />
                );

            case "document":
                return (
                    <Div alignItems="center" justifyContent="center" py={40}>
                        <Div
                            bg="#F3F3F3"
                            rounded="circle"
                            w={80}
                            h={80}
                            justifyContent="center"
                            alignItems="center"
                            mb={20}
                        >
                            <IconFile size={48} color={colorPrimary} />
                        </Div>
                        <Text
                            fontSize="lg"
                            fontFamily={fontHauoraSemiBold}
                            color={colorTextPrimary}
                            mb={8}
                            textAlign="center"
                            px={20}
                            numberOfLines={2}
                        >
                            {mediaInfo?.name || "Document"}
                        </Text>
                        {mediaInfo?.size && (
                            <Text fontSize="md" color="#666">
                                {formatFileSize(mediaInfo.size)}
                            </Text>
                        )}
                    </Div>
                );

            default:
                return null;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Div flex={1} bg="rgba(0, 0, 0, 0.85)"  justifyContent="center" alignItems="center">
                {/* Close button */}
                <TouchableOpacity
                    onPress={onCancel}
                    style={styles.closeButton}
                >
                    <Div
                        bg="rgba(255, 255, 255, 0.2)"
                        rounded="circle"
                        w={40}
                        h={40}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <IconX size={24} color="#fff" />
                    </Div>
                </TouchableOpacity>

                {/* Content container */}
                <Div
                    bg="#fff"
                    rounded={16}
                    w={SCREEN_WIDTH - 40}
                    maxH={SCREEN_HEIGHT - 200}
                    overflow="hidden"
                >
                    {/* Preview area */}
                    <Div  bg="#000" minH={200}>
                        {renderPreview()}
                    </Div>

                    {/* Action buttons */}
                  
                </Div>
                  <Div p={20} flexDir="row" justifyContent="space-between">
                        <TouchableOpacity
                            onPress={onCancel}
                            style={{ flex: 1, marginRight: 10 }}
                        >
                            <Div
                                bg="#F3F3F3"
                                py={14}
                                px={20}
                                rounded={8}
                                alignItems="center"
                            >
                                <Text
                                    fontSize="lg"
                                    fontFamily={fontHauoraSemiBold}
                                    color={colorTextPrimary}
                                >
                                    Cancel
                                </Text>
                            </Div>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={onConfirm}
                            style={{ flex: 1, marginLeft: 10 }}
                        >
                            <Div
                                bg={colorPrimary}
                                py={14}
                                px={20}
                                rounded={8}
                                alignItems="center"
                            >
                                <Text
                                    fontSize="lg"
                                    fontFamily={fontHauoraSemiBold}
                                    color="#fff"
                                >
                                    Send
                                </Text>
                            </Div>
                        </TouchableOpacity>
                    </Div>
            </Div>
        </Modal>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        minHeight: 300,
    },
    videoPreview: {
        width: "100%",
        height: 300,
    },
});

export default MediaConfirmationModal;
