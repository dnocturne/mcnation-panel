"use client"

import { useEffect } from "react";
import { socket } from "@/lib/websocket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // If the socket is not already connected, initiate connection.
    if (!socket.connected) {
      socket.connect();
    }
    console.log("SocketProvider mounted. Socket connected:", socket.connected);

    // Optionally, you can add additional event listeners here.
    // We're not disconnecting on unmount because we want the connection to persist.
    return () => {
      // Clean up any event listeners if attached in this component.
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return <>{children}</>;
}

export default SocketProvider; 