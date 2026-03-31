import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

export const useAppVersion = () => {
  const version = DeviceInfo.getVersion(); // Gets CFBundleShortVersionString (iOS) or versionName (Android)
  const buildNumber = DeviceInfo.getBuildNumber(); // Gets CFBundleVersion (iOS) or versionCode (Android)

  return {
    version,
    buildNumber,
    // Returns version with build number (e.g., "2.0.1 (1)")
    fullVersion: `${version} (${buildNumber})`,
  };
};
