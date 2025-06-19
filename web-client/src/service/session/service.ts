import { AxiosInstance } from "axios";

import { Session } from "./interface";
import { Result, wrapPromise } from "../service-wrapper";

export class SessionService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getAllSessions(): Promise<Result<Session[]>> {
    return wrapPromise(this.instance.get("/session").then((res) => res.data));
  }

  async createSession(session_name: string): Promise<Result<Session>> {
    return wrapPromise(
      this.instance.post(`/session/${session_name}`).then((res) => res.data)
    );
  }

  async deleteSession(session_id: string): Promise<Result<void>> {
    return wrapPromise(this.instance.delete(`/session/${session_id}`));
  }
}
