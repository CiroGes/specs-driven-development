export function toHelloWorldRequest(payload = {}) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  return {
    name: typeof payload.name === "string" ? payload.name : payload.name ?? undefined
  };
}

export function buildHelloWorldResponse(result) {
  return {
    status: "ok",
    data: result
  };
}
