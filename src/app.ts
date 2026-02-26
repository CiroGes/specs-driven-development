import { runHelloWorldFeature } from "./features/hello-world/index.js";

export function main(): void {
  const response = runHelloWorldFeature({ name: "Specs Driven Development" });
  console.log(response.data.message);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
