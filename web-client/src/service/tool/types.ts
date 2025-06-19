export type ToolClientElementBaseType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "file";

export type ToolClientHTMLElementType =
  | "input-text"
  | "input-number"
  | "input-image"
  | "input-file"
  | "textarea"
  | "checkbox";

export type ToolClientRequestTarget =
  | "cookie"
  | "header"
  | "query"
  | "params"
  | "body"
  | "formData";

export type ToolClientResponseTarget = "header" | "body";

export type ToolClientAuthStrategy = "none" | "basic" | "bearer" | "cookie";

export type ToolClientMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ToolClientRequestContentType =
  | "application/json"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data";

export type ToolClientResponseContentType =
  | "application/json"
  | "application/xml"
  | "text/html"
  | "text/plain"
  | "text/xml"
  | "application/x-www-form-urlencoded"
  | "multipart/form-data";

// Errors
export class ToolClientPayloadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolClientError";
  }
}
