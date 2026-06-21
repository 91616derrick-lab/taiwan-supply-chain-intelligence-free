import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { intelligenceSchema } from "../src/lib/schemas/intelligenceSchema";

async function main() {
  const latestPath = path.join(process.cwd(), "data", "intelligence", "latest.json");
  const raw = await readFile(latestPath, "utf8");
  const payload = JSON.parse(raw) as unknown;
  const parsed = intelligenceSchema.parse(payload);

  const requiredArrays = {
    events: parsed.events,
    companyImpacts: parsed.companyImpacts,
    sources: parsed.sources
  };

  for (const [name, value] of Object.entries(requiredArrays)) {
    if (!Array.isArray(value)) {
      throw new Error(`${name} must be an array`);
    }
  }

  console.log(
    `validation passed: events=${parsed.events.length}, companyImpacts=${parsed.companyImpacts.length}, sources=${parsed.sources.length}`
  );
}

main().catch((error) => {
  if (error instanceof z.ZodError) {
    console.error("validation failed:");
    for (const issue of error.issues) {
      console.error(`- ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
