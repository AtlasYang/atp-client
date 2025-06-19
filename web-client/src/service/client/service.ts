import { AxiosInstance } from "axios";

import { Client } from "./interface";
import { Result, wrapPromise } from "../service-wrapper";

export class ClientService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getCurrentClient(): Promise<Result<Client>> {
    return wrapPromise(this.instance.get("/clients/current").then((res) => res.data));
  }
}
