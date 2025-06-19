import { useEffect, useRef, useState } from "react";
import {
  CreateToolMessageDTO,
  ToolMessage,
} from "../../service/tool/interface";

export default function useToolWebSocket(
  sessionID: string,
  onMessageReceived: (message: ToolMessage) => void
) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!sessionID) return;

    const ws = new WebSocket(
      import.meta.env.PROD
        ? `${import.meta.env.VITE_API_WS_URL}/tool/session/ws?sessionID=${sessionID}`
        : `ws://${
            import.meta.env.VITE_API_DOMAIN
          }/v1/tool/session/ws?sessionID=${sessionID}`
    );
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to WebSocket session: ${sessionID}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // Check: Tool message doesn't have message_type
      if (message.message_type === 1) {
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

  const sendMessage = (messageContent: CreateToolMessageDTO) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        session_id: sessionID,
        tool_id: messageContent.tool_id,
        role: messageContent.role,
        data: messageContent.data,
      };

      socketRef.current.send(JSON.stringify(message));

      setIsWaiting(true);
    }
  };

  return { sendMessage, isConnected, isWaiting };
}
