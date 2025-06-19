import { useEffect, useRef, useState } from "react";
import {
  CHAT_MESSAGE_TYPE_NORMAL,
  ChatMessage,
  CreateChatMessageDTO,
} from "../../service/chat/interface";

export default function useChatWebSocket(
  sessionID: string,
  onMessageReceived: (message: ChatMessage) => void
) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionID) return;

    const ws = new WebSocket(
      import.meta.env.PROD
        ? `${import.meta.env.VITE_API_WS_URL}/chat/session/ws?sessionID=${sessionID}`
        : `ws://${
            import.meta.env.VITE_API_DOMAIN
          }/v1/chat/session/ws?sessionID=${sessionID}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to WebSocket session: ${sessionID}`);

      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.message_type > CHAT_MESSAGE_TYPE_NORMAL) {
        setIsWaiting(false);
      }

      onMessageReceived(message);
    };

    ws.onerror = (error) => console.error("WebSocket Error:", error);
    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [sessionID]);

  const sendMessage = (messageContent: CreateChatMessageDTO) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        session_id: sessionID,
        role: messageContent.role,
        message: messageContent.message,
        message_type: CHAT_MESSAGE_TYPE_NORMAL,
        linked_tool_ids: [],
      };

      socketRef.current.send(JSON.stringify(message));

      setIsWaiting(true);
    }
  };

  return { sendMessage, isConnected, isWaiting };
}
