import { describe, expect, it } from "vitest";
import { createHelloWorldMessage } from "../../src/features/hello-world/hello-world.service.js";

describe("createHelloWorldMessage", () => {
  it("returns greeting for a provided name", () => {
    const result = createHelloWorldMessage({ name: "Ada" });
    expect(result.message).toBe("Hello, Ada!");
  });

  it("trims name and keeps greeting format", () => {
    const result = createHelloWorldMessage({ name: "  Linus  " });
    expect(result.normalizedName).toBe("Linus");
    expect(result.message).toBe("Hello, Linus!");
  });

  it("defaults to World when name is empty", () => {
    const result = createHelloWorldMessage({ name: "   " });
    expect(result.message).toBe("Hello, World!");
  });
});
