import type { HelloWorldInput, HelloWorldResult } from "../../shared/types/app.js";

export function createHelloWorldMessage(input: HelloWorldInput): HelloWorldResult {
  const rawName = input.name ?? "";
  const normalized = rawName.trim();
  const normalizedName = normalized.length > 0 ? normalized : "World";

  return {
    normalizedName,
    message: `Hello, ${normalizedName}!`
  };
}
