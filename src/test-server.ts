import { createServerFn } from "@tanstack/react-start";

console.log("createServerFn type:", typeof createServerFn);
try {
  const fn = createServerFn();
  console.log("createServerFn result keys:", Object.keys(fn));
  console.log("createServerFn result validator type:", typeof (fn as any).validator);
} catch (e) {
  console.error("Error calling createServerFn:", e);
}

export const testFn = createServerFn().handler(() => "ok");
