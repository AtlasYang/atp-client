import {
  ToolClientAuthStrategy,
  ToolClientElementBaseType,
  ToolClientHTMLElementType,
  ToolClientMethod,
  ToolClientRequestContentType,
  ToolClientRequestTarget,
  ToolClientResponseContentType,
  ToolClientResponseTarget,
} from "./types";

export enum ToolClientPermissionLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2
}

export interface ReadToolDTO {
  id: number;
  uuid: string;
  name: string;
  version: string;
  description: string;
  provider_interface: ToolProviderInterface;
}

export interface ToolClientElement {
  label: string;
  description?: string;
  htmlElementType: ToolClientHTMLElementType;
  valueType: ToolClientElementBaseType;
}

export interface ToolClientRequest {
  id: string;
  type: ToolClientRequestTarget;
  required: boolean;
  key: string;
  valueType: ToolClientElementBaseType;
  bindedElementType: ToolClientElement;
}

export interface ToolClientResponse {
  id: string;
  type: ToolClientResponseTarget;
  key: string;
  valueType: ToolClientElementBaseType;
  bindedElementType: ToolClientElement;
}

export interface ToolProviderInterface {
  url: string;
  authStrategy: ToolClientAuthStrategy;
  requestMethod: ToolClientMethod;
  requestContentType: ToolClientRequestContentType;
  responseContentType: ToolClientResponseContentType;
  requestInterface: ToolClientRequest[];
  responseInterface: ToolClientResponse[];
}

export interface Tool {
  id: string;
  name: string;
  version: string;
  description: string;
  created_at: string;
  provider_interface: ToolProviderInterface;
}

export interface CreateToolDTO {
  id: string;
  name: string;
  version: string;
  description: string;
  provider_interface: ToolProviderInterface;
}

export interface ToolMessage {
  id: string;
  session_id: string;
  tool_id: string;
  role: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface CreateToolMessageDTO {
  session_id: string;
  tool_id: string;
  role: string;
  data: Record<string, unknown>;
}

export interface ToolInteractionElement {
  content:
    | string
    | number
    | boolean
    | object
    | File
    | File[]
    | string[]
    | number[]
    | boolean[]
    | object[];
  interface_id: string;
}

export interface ReadToolRequestDTO {
  id: number;
  tool_id: number;
  tool_name: string;
  status: "pending" | "success" | "failed";
  created_at: string;
  updated_at: string;
  request_data: ToolInteractionElement[];
  response_data: ToolInteractionElement[];
}