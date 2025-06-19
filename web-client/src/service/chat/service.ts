import { AxiosInstance } from "axios";

import { ChatMessage, CreateChatMessageDTO } from "./interface";
import { Result, wrapPromise } from "../service-wrapper";

export class ChatService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getChatMesssageBySessionId(
    sessionId: string
  ): Promise<Result<ChatMessage[]>> {
    return wrapPromise(
      this.instance.get(`/chat/message/${sessionId}`).then((res) => res.data)
    );
  }

  async createChatMessage(
    chatMessage: CreateChatMessageDTO
  ): Promise<Result<void>> {
    return wrapPromise(
      this.instance.post(`/chat/message`, chatMessage).then((res) => res.data)
    );
  }
}
