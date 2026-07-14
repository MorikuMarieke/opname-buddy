import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Loads .env.local and .env from the project root into process.env.
 * Existing environment variables are not overwritten.
 */
export function loadProjectEnv(): void {
  const root = resolve(import.meta.dirname, "../..");

  for (const filename of [".env.local", ".env"]) {
    const filePath = resolve(root, filename);

    if (!existsSync(filePath)) {
      continue;
    }

    const content = readFileSync(filePath, "utf8");

    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      let value = line.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}
