import axios from "axios";
import { ChatService } from "./chat/service";
import { SessionService } from "./session/service";
import { ToolService } from "./tool/service";
import { ClientService } from "./client/service";

export const useService = () => {
  const instance = axios.create({
    baseURL: import.meta.env.PROD
      ? import.meta.env.VITE_API_URL
      : `http://${import.meta.env.VITE_API_DOMAIN}/v1`,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    clientService: new ClientService(instance),
    sessionService: new SessionService(instance),
    chatService: new ChatService(instance),
    toolService: new ToolService(instance),
  };
};
