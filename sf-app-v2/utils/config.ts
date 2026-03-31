/**
 * App config - reads from react-native-config for merge (bare RN) builds.
 * Same export shape as mine for compatibility.
 */
import Config from "react-native-config";

const DEMO_API = "https://api.example.com";
const DEMO_SOCKET = "https://socket.example.com";

const API_URL = Config.API_URL ?? DEMO_API;
const SOCKET_URL = Config.SOCKET_URL ?? DEMO_SOCKET;

/** Always false: app uses real backend only, no demo/mock data. */
export const DEMO_MODE = false;

export default {
  API_URL,
  SOCKET_URL,
  SENTRY_DSN: Config.SENTRY_DSN ?? "",
  DEV_BYPASS_OTP: Config.DEV_BYPASS_OTP === "true",
};
