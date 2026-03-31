import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Config from "react-native-config";
import { useUserStore } from "@/store/modules/user";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserStore();

  useEffect(() => {
    const newSocket = io(Config.SOCKET_URL ?? "", { query: { userId: user?.id } });

    newSocket.on("connect", () => {
      console.log("Connected to socket");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};
