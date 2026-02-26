import { buildHelloWorldResponse, toHelloWorldRequest } from "./hello-world.controller.js";
import { createHelloWorldMessage } from "./hello-world.service.js";
import type { HelloWorldInput, HelloWorldResponse } from "../../shared/types/app.js";

export function runHelloWorldFeature(payload: unknown): HelloWorldResponse {
  const safePayload = typeof payload === "object" && payload !== null ? payload : undefined;
  const request = toHelloWorldRequest(safePayload) as HelloWorldInput;
  const result = createHelloWorldMessage(request);
  return buildHelloWorldResponse(result) as HelloWorldResponse;
}
