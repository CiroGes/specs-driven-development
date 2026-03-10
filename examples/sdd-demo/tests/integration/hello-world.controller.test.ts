import { describe, expect, it } from "vitest";
import { runHelloWorldFeature } from "../../src/features/hello-world/index.js";

describe("runHelloWorldFeature", () => {
  it("returns status ok and greeting payload", () => {
    const response = runHelloWorldFeature({ name: "Grace" });
    expect(response.status).toBe("ok");
    expect(response.data.message).toBe("Hello, Grace!");
  });

  it("defaults to World for missing name", () => {
    const response = runHelloWorldFeature({});
    expect(response.data.message).toBe("Hello, World!");
  });
});
