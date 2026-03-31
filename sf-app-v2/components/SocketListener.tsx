import { SocketEventEnum } from "@/socket/events";
import { useSocket } from "@/socket/provider";
import { useExpertStore } from "@/store/modules/expert";
import { useUserStore } from "@/store/modules/user";
import React, { useEffect } from "react";

export default function SocketListener() {
  const socket = useSocket();
  const { updateExpertStatus } = useExpertStore();
  const { user, SET_NAV_NOTIF } = useUserStore();

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEventEnum.VET_ONLINE_STATUS_CHANGE, async (data) => {
      const vetId = data?.vetId;
      const isOnline = data?.isOnline;

      updateExpertStatus(vetId, isOnline);
    });

    socket.on(SocketEventEnum.PARTNER_QUOTATION_SUBMITTED, async (val) => {
      const latestNavNotif = useUserStore.getState().navNotif || 0;
      if (val.memberId === useUserStore.getState().user?.id) {
        SET_NAV_NOTIF(latestNavNotif + 1);
      }
    });

    return () => {
      socket?.off(SocketEventEnum.VET_ONLINE_STATUS_CHANGE);
      socket?.off(SocketEventEnum.PARTNER_QUOTATION_SUBMITTED);
    };
  }, [socket]);

  return <></>;
}
