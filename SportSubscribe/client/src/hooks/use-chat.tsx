import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@shared/schema";
import { useAuth } from "./use-auth";

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      socket.close();
    };
  }, [user]);

  const sendMessage = (text: string) => {
    if (!socketRef.current || !user) return;
    socketRef.current.send(
      JSON.stringify({
        type: "chat",
        userId: user.id,
        text,
        isAdmin: user.isAdmin,
      })
    );
  };

  return {
    messages,
    connected,
    sendMessage,
  };
}
