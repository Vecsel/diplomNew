import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";

async function initDb() {
  const fileDir = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(fileDir, "../../sql/schema.sql");
  const schemaSql = await readFile(schemaPath, "utf8");

  await pool.query(schemaSql);
  console.log("Database schema initialized");
}

void initDb()
  .catch((error) => {
    console.error("Failed to initialize schema", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
