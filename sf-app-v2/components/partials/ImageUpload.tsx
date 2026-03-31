import React, { useCallback, useEffect, useRef, useState } from "react";

import * as ImagePicker from "expo-image-picker";
import {
  IconClick,
  IconDownload,
  IconEditCircle,
  IconPaperclip,
  IconPlus,
  IconProps,
  IconStarFilled,
  IconUser,
  IconVideo,
  IconX,
} from "@tabler/icons-react-native";
import { Button, Div, DropdownRef, Image, Modal, Text } from "react-native-magnus";
import { colorPrimary, fontHauoraMedium, fontHauoraSemiBold } from "@/constant/constant";
import { useFileStore } from "@/store/modules/file";
import { UploadedFile } from "@/store/types/file";
import DocumentPicker from "react-native-document-picker";

import RNFetchBlob from "react-native-blob-util";

import {
  ActivityIndicator,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import DocumentTypeDropdown from "./DocumentTypeDropdown";
import { showMessage } from "react-native-flash-message";
import Video from "react-native-video";
import { truncateFileName } from "@/utils/helpers";
import Pdf from "react-native-pdf";

interface Props {
  isPrimary?: boolean;
  onChange?: (files: UploadedFile[]) => void;
  uri?: string;
  plusIcon?: boolean;
  userIcon?: boolean;
  w?: number;
  h?: number;
  editIcon?: boolean;
  onUnSelect?: (e: string) => void;
  hideUnselectBtn?: boolean;
  mr?: number;
  noImage?: boolean;
  disabled?: boolean;
  openImageOnTab?: boolean;
  rounded?: number;
  bg?: string;
  document?: boolean;
  docType?: string;
  documentName?: string;
  onLoading?: (isLoading: boolean) => void;
  disableDownload?: boolean;
  singleImage?: boolean;
  aspectRatio?: number[] | "auto";
  disableCropping?: boolean;
  mediaType?: "Images" | "Videos";
}

const ImageUpload: React.FC<Props> = ({
  isPrimary = false,
  onChange,
  uri,
  plusIcon = true,
  w = 102,
  h = 100,
  editIcon,
  onUnSelect,
  hideUnselectBtn,
  noImage,
  mr,
  disabled,
  rounded,
  bg,
  userIcon,
  openImageOnTab,
  document,
  docType,
  documentName,
  onLoading,
  disableDownload,
  singleImage,
  aspectRatio,
  disableCropping = false,
  mediaType,
}) => {
  const { uploadFile } = useFileStore();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<null | string>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<null | string>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const optionMenuRef = useRef<DropdownRef>(null);
  const [newAspectRatio, setNewAspectRatio] = useState<any>();
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(false);

  useEffect(() => {
    if (!aspectRatio) {
      setNewAspectRatio([4, 3]);
      return;
    }
    setNewAspectRatio(aspectRatio === "auto" ? undefined : aspectRatio);
  }, []);

  const pickImage = async () => {
    if (disabled) return;

    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        // If permission is denied, show an alert and ask to open settings
        Alert.alert(
          "Permission Required",
          "We need access to your media library to upload images. Please open settings and grant permission",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: (mediaType as ImagePicker.MediaTypeOptions) || ImagePicker.MediaTypeOptions.All,
        allowsEditing: !disableCropping,
        aspect: disableCropping ? undefined : newAspectRatio,
        quality: 1,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;

        const fileSize = result.assets[0].fileSize;
        const maxFileSize = 36 * 1024 * 1024; // 36MB in bytes

        if (fileSize && fileSize > maxFileSize) {
          toast.show("File size exceeds 36MB. Please select a smaller file.");
          return;
        }
        console.log("image upload result", result);

        if (singleImage) {
          setImage(localUri);
        }

        const filename = localUri.split("/").pop() as string;
        const match = /\.(\w+)$/.exec(filename);
        let type = "application/octet-stream"; // Default type

        if (match) {
          const ext = match[1].toLowerCase();
          if (ext === "jpg" || ext === "jpeg" || ext === "png") {
            type = `image/${ext}`;
          } else if (ext === "mp4" || ext === "mov") {
            type = `video/${ext}`;
          } else if (ext === "mp3" || ext === "wav") {
            type = `audio/${ext}`;
          }
        }
        const file = { uri: localUri, name: filename, type } as unknown as File;

        setLoading(true);
        if (onLoading) {
          onLoading(true);
        }

        const uploadedFile = await uploadFile([file]);

        setUploadedFileUrl(uploadedFile[0].url);
        if (onChange) {
          onChange(uploadedFile);
        }
      }
    } catch (error) {
      showMessage({
        message: "An error occurred while picking the image",
        type: "danger",
      });
    } finally {
      setLoading(false);
      if (onLoading) {
        onLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!uri) return;
    setImage(uri);
  }, [uri]);

  const handleUnSelect = () => {
    if (onUnSelect && (uploadedFileUrl || uri)) {
      if (uri) {
        onUnSelect(uri);
      } else if (uploadedFileUrl) {
        onUnSelect(uploadedFileUrl);
      }
      setUploadedFileUrl(null);
      setImage(null);
    }
  };

  const handleOpenImage = () => {
    setModalVisible(true);
  };

  const handleDocumentSelection = useCallback(async () => {
    if (disabled) return;

    try {
      const response = await DocumentPicker.pick({
        presentationStyle: "fullScreen",
        type: [DocumentPicker.types.pdf, DocumentPicker.types.video],
      });

      const fileSize = response[0].size;
      const maxFileSize = 36 * 1024 * 1024; // 36MB in bytes

      if (fileSize && fileSize > maxFileSize) {
        toast.show("File size exceeds 36MB. Please select a smaller file.");
        return;
      }

      if (response[0].type?.includes("image")) {
        setImage(response[0].uri);
      }

      setLoading(true);
      if (onLoading) {
        onLoading(true);
      }

      console.log("image upload document response", response);

      const file = {
        uri: response[0].uri,
        name: response[0].name,
        type: response[0].type,
      } as unknown as File;

      const uploadedFile = await uploadFile([file]);

      setUploadedFileUrl(uploadedFile[0].url);
      if (onChange) {
        onChange(uploadedFile);
      }
      if (noImage) {
        setImage(null);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.warn("Error selecting document:", err);
        toast.show("Failed to select document. Please try again.");
      }
    } finally {
      setLoading(false);
      if (onLoading) {
        onLoading(false);
      }
    }
  }, [disabled, onLoading, onChange, uploadFile]);

  // download file

  const actualDownload = () => {
    if (!uri) return;

    const { dirs } = RNFetchBlob.fs;
    const dirToSave = Platform.OS === "ios" ? dirs.DocumentDir : dirs.DownloadDir;
    const configfb = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        mediaScannable: true,
        title: uri.split("/").pop(),
        path: `${dirs.DownloadDir}/${uri.split("/").pop()}`,
      },
      useDownloadManager: true,
      notification: true,
      mediaScannable: true,
      title: uri.split("/").pop(),
      path: `${dirToSave}/${uri.split("/").pop()}`,
    };
    const configOptions = Platform.select({
      ios: configfb,
      android: configfb,
    });

    RNFetchBlob.config(configOptions || {})
      .fetch("GET", uri, {})
      .then((res) => {
        console.log("file res_-", configfb);

        if (Platform.OS === "ios") {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, "base64");
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
        if (Platform.OS === "android") {
          console.log("file downloaded");
          Linking.openURL(configfb.path);
        }

        toast.show("File downloaded successfully");
      })
      .catch((e) => {
        console.log("file Download==>", e);
      });
  };

  const handleDownload = async () => {
    if (downloadLoading) return;
    try {
      setDownloadLoading(true);

      if (Platform.OS === "ios") {
        actualDownload();
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            actualDownload();
          } else {
            console.log("please grant permission");
          }
        } catch (err) {
          console.log("display error", err);
        }
      }
    } finally {
      setDownloadLoading(false);
    }
  };

  const isVideo = (mimetype: string) => mimetype.startsWith("video/");
  const isImage = (mimetype: string) => mimetype.startsWith("image/");
  const isDoc = (docType: string) => !isVideo(docType) && !isImage(docType);

  return (
    <Div alignItems="flex-start">
      <Div position="relative" mr={mr ? mr : 0}>
        {image ? (
          <Button
            bg="transparent"
            px={0}
            rounded={rounded ? rounded : 0}
            py={0}
            onPress={() => {
              if (openImageOnTab) {
                handleOpenImage();
              } else {
                document ? handleDocumentSelection() : pickImage();
              }
            }}
            disabled={loading}
          >
            <Div
              w={w}
              h={h}
              rounded={8}
              bgImg={{
                uri: image,
              }}
              position="relative"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              {documentName && docType && !isImage(docType) && (
                <Div
                  position="absolute"
                  top={0}
                  left={0}
                  w={"100%"}
                  h={"100%"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  bg="#ddd"
                  p={10}
                >
                  <Div justifyContent="center" alignItems="center">
                    {isVideo(docType) ? (
                      <IconVideo size={44} color="#fff" />
                    ) : (
                      <IconPaperclip size={44} color="#fff" />
                    )}
                    {documentName && (
                      <Text
                        fontFamily={fontHauoraSemiBold}
                        textAlign="center"
                        lineHeight={16}
                        fontSize={"sm"}
                        px={2}
                      >
                        {truncateFileName(documentName, 10)}
                      </Text>
                    )}
                  </Div>
                </Div>
              )}
              {!hideUnselectBtn && (
                <Button
                  position="absolute"
                  zIndex={50}
                  top={2}
                  right={2}
                  p={2}
                  onPress={handleUnSelect}
                  bg="#00000061"
                >
                  <IconX width={24} height={24} color={"#fff"} />
                </Button>
              )}
              {!disableDownload && (
                <Button
                  position="absolute"
                  zIndex={50}
                  top={2}
                  right={40}
                  p={2}
                  onPress={handleDownload}
                  bg="#00000061"
                >
                  {downloadLoading ? (
                    <ActivityIndicator
                      size="small"
                      style={{ width: 24, height: 24 }}
                      color={"#fff"}
                    />
                  ) : (
                    <IconDownload width={24} height={24} color={"#fff"} />
                  )}
                </Button>
              )}

              {isPrimary && (
                <IconStarFilled
                  size={21}
                  fill="#68a6d4"
                  color={"#68a6d4"}
                  style={{ position: "absolute", right: 8, bottom: 8 }}
                />
              )}

              {loading && <ActivityIndicator size="large" color={colorPrimary} />}
            </Div>
          </Button>
        ) : (
          <Button
            w={w}
            h={h}
            bg={bg ? bg : "#ddd"}
            rounded={rounded ? rounded : 8}
            position="relative"
            disabled={loading}
            onPress={() => {
              if (document) {
                if ("current" in optionMenuRef && optionMenuRef.current) {
                  optionMenuRef.current.open();
                }
              } else {
                pickImage();
              }
              // document ? handleDocumentSelection() : pickImage();
            }}
          >
            {loading && <ActivityIndicator size="large" color={colorPrimary} />}
            {!loading && (
              <React.Fragment>
                {plusIcon ? (
                  <IconPlus size={32} color="#222222" strokeWidth={1.5} />
                ) : userIcon ? (
                  <IconUser size={64} color="#222222" strokeWidth={1.5} />
                ) : (
                  <Text fontFamily={fontHauoraSemiBold} fontSize="xl" lineHeight={24}>
                    Upload
                  </Text>
                )}
              </React.Fragment>
            )}

            {isPrimary && (
              <IconStarFilled
                size={21}
                fill="#68a6d4"
                color={"#68a6d4"}
                style={{ position: "absolute", left: 38, top: 38 }}
              />
            )}
          </Button>
        )}

        {editIcon && image && (
          <Button
            w={32}
            h={32}
            rounded={49}
            bg="#E4E9EC"
            justifyContent="center"
            alignItems="center"
            position="absolute"
            bottom={-7}
            right={-8}
            p={0}
            onPress={() => {
              if (document) {
                if ("current" in optionMenuRef && optionMenuRef.current) {
                  optionMenuRef.current.open();
                }
              } else {
                pickImage();
              }
              // document ? handleDocumentSelection() : pickImage();
            }}
          >
            <IconEditCircle width={24} height={24} color={"#222"} />
          </Button>
        )}
      </Div>

      <DocumentTypeDropdown
        ref={optionMenuRef}
        onSelect={(value) => {
          setTimeout(() => {
            if (value === "Browse") {
              handleDocumentSelection();
            } else {
              pickImage();
            }
          }, 500);
        }}
      />

      <Modal
        isVisible={modalVisible}
        // h={"100%"}
        bg="transparent"
        onSwipeCancel={isDoc(docType || "") ? undefined : () => setModalVisible(false)}
        onSwipeMove={isDoc(docType || "") ? undefined : () => setModalVisible(false)}
        swipeDirection={isDoc(docType || "") ? undefined : "down"}
      >
        <>
          {(docError || docLoading) && (
            <Div flex={1} justifyContent="center" alignItems="center">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 10,
                  backgroundColor: "#00000061",
                  borderRadius: 10,
                  padding: 6,
                }}
              >
                <IconX width={24} height={24} color={"#fff"} />
              </TouchableOpacity>
              {docLoading && <ActivityIndicator size="large" color="#888" />}
              {docError && <Text style={{ color: "red" }}>Failed to load content.</Text>}
            </Div>
          )}

          {!docLoading && !docError && (
            <Div flex={1}>
              {docType && isImage(docType) && (
                <Div
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      backgroundColor: "#00000061",
                      borderRadius: 10,
                      padding: 6,
                    }}
                  >
                    <IconX width={24} height={24} color={"#fff"} />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: image as string }} // Display the selected image
                    style={{
                      width: "100%",
                      height: "100%",
                      resizeMode: "contain",
                    }}
                    onLoadEnd={() => setDocLoading(false)}
                    onError={() => {
                      setDocLoading(false);
                      setDocError(true);
                    }}
                  />
                </Div>
              )}
              {docType && isVideo(docType) && (
                <View style={{ flex: 1, position: "relative" }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      backgroundColor: "#00000061",
                      borderRadius: 10,
                      padding: 6,
                    }}
                  >
                    <IconX width={24} height={24} color={"#fff"} />
                  </TouchableOpacity>

                  <Video
                    source={{ uri: uri }}
                    style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
                    resizeMode="contain"
                    controls={true} // adds play/pause controls
                    paused={false}
                    onLoadEnd={() => setDocLoading(false)}
                    onError={() => {
                      setDocLoading(false);
                      setDocError(true);
                    }}
                  />
                </View>
              )}

              {docType && isDoc(docType) && (
                <View style={{ flex: 1, position: "relative" }}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      backgroundColor: "#00000061",
                      borderRadius: 10,
                      padding: 6,
                    }}
                  >
                    <IconX width={24} height={24} color={"#fff"} />
                  </TouchableOpacity>

                  <Pdf
                    source={{ uri, cache: true }}
                    style={{ flex: 1 }}
                    onLoadComplete={() => setDocLoading(false)}
                    onError={() => {
                      setDocLoading(false);
                      setDocError(true);
                    }}
                  />
                </View>
              )}
            </Div>
          )}
        </>
      </Modal>
    </Div>
  );
};

export default ImageUpload;
