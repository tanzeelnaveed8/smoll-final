import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { showMessage } from "react-native-flash-message";
import Config from "react-native-config";

const api = axios.create({
  baseURL: Config.API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const storedToken = await AsyncStorage.getItem("accessToken");
    console.log("token",storedToken)
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the request path is "/members/me?skiperrr"
    const message = error.response?.data?.message;
    let msgStr = message;

    if (Array.isArray(message)) {
      msgStr = message[0];
    }

    console.log(msgStr);

    if (msgStr === "You've used your free consulatation call.") {
      throw { error, msgStr };
    } else {
      if (!error.config.url.includes("skiperr")) {
        if (msgStr) {
          console.log("this is mssg->",msgStr)
          if (!msgStr.toLowerCase().includes("not found")) {
               console.log("this is mssg->////////////////",msgStr)
            showMessage({
              message: msgStr,
              type: "danger",
            });
          } 
        }
      }

      throw error;
    }
  }
);

export default api;
