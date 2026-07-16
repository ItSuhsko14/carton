import { promises as fs } from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");
const MANIFEST_PATH = path.join(TEMPLATES_DIR, "manifest.json");

async function buildManifest() {
  const entries = await fs.readdir(TEMPLATES_DIR);
  const ids = entries
    .filter((name) => name.endsWith(".json") && name !== "manifest.json")
    .map((name) => name.replace(/\.json$/, ""))
    .sort();

  const templates = [];
  for (const id of ids) {
    const raw = await fs.readFile(path.join(TEMPLATES_DIR, `${id}.json`), "utf-8");
    const { corners } = JSON.parse(raw);
    templates.push({
      id,
      imageUrl: `/templates/${id}.jpg`,
      corners,
    });
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(templates, null, 2));
  console.log(`Wrote ${templates.length} templates to manifest.json`);
}

buildManifest();
