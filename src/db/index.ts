import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1: D1Database) {
  if (!d1) {
    console.error("createDb: d1 is undefined or null");
    throw new Error("D1Database binding is required");
  }
  return drizzle(d1, { schema });
}
