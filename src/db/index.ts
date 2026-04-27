import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export function createDb(d1?: D1Database, sqlite?: any) {
  if (d1) {
    return drizzleD1(d1, { schema });
  }
  if (sqlite) {
    return drizzleSqlite(sqlite, { schema });
  }
  
  console.error("createDb: Neither D1 nor SQLite instance provided");
  throw new Error("Database connection required");
}
