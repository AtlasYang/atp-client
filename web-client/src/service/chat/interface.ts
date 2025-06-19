export interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  message: string;
  created_at: string;
  message_type: number;
  linked_tool_id: string;
}

export interface CreateChatMessageDTO {
  session_id: string;
  role: string;
  message: string;
}

export const CHAT_MESSAGE_TYPE_NORMAL = 0;
export const CHAT_MESSAGE_TYPE_TOOL_SELECTION = 1;
export const CHAT_MESSAGE_TYPE_TOOL_SUGGESTIONS = 2;
export const CHAT_MESSAGE_TYPE_TOOL_FURTHER_INFO = 3;
