import { AxiosInstance } from "axios";
import {
  CreateToolDTO,
  ReadToolDTO,
  ReadToolRequestDTO,
  Tool,
  ToolClientPermissionLevel,
  ToolInteractionElement,
} from "./interface";
import { Result, wrapPromise } from "../service-wrapper";

export class ToolService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getAllToolsByPermissionLevel(permissionLevel: ToolClientPermissionLevel): Promise<Result<ReadToolDTO[]>> {
    return wrapPromise(this.instance.get(`/tool?permission_level=${permissionLevel}`).then((res) => res.data));
  }
   
  async getToolByID(id: number): Promise<Result<ReadToolDTO>> {
    return wrapPromise(this.instance.get(`/tool/${id}`).then((res) => res.data));
  }

  async getToolByUUID(uuid: string): Promise<Result<ReadToolDTO>> {
    return wrapPromise(this.instance.get(`/tool/uuid/${uuid}`).then((res) => res.data));
  }

  async getToolRequestByID(id: number): Promise<Result<ReadToolRequestDTO>> {
    return wrapPromise(this.instance.get(`/tool/requests/${id}`).then((res) => res.data));
  }

  async getAllToolRequests(): Promise<Result<ReadToolRequestDTO[]>> {
    return wrapPromise(this.instance.get(`/tool/requests`).then((res) => res.data));
  }

  // deprecated
  async getTool(id: string): Promise<Result<Tool>> {
    return wrapPromise(
      this.instance.get(`/tool/${id}`).then((res) => res.data)
    );
  }

  // deprecated
  async createTool(data: CreateToolDTO): Promise<Result<Tool>> {
    return wrapPromise(
      this.instance.post("/tool", data).then((res) => res.data)
    );
  }

  // deprecated
  async deleteTool(id: string): Promise<Result<void>> {
    return wrapPromise(this.instance.delete(`/tool/${id}`).then(() => {}));
  }

  // deprecated
  async runTool(
    id: number,
    request: ToolInteractionElement[]
  ): Promise<Result<string>> {
    return wrapPromise(
      this.instance
        .post(`/tool/execute/${id}`, request)
        .then((res) => res.data)
    );
  }

  // TODO: deprecated
  async getToolRequestList(): Promise<Result<ReadToolRequestDTO[]>> {
    return wrapPromise(
      this.instance.get("tool/request-list").then((res) => res.data)
    );
  }
}
