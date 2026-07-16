import { promises as fs } from "fs";
import http from "http";
import path from "path";
import { execFile } from "child_process";

const PORT = 4000;
const TEMPLATES_DIR = path.join(process.cwd(), "public", "templates");

async function listIds() {
  const entries = await fs.readdir(TEMPLATES_DIR);
  return entries
    .filter((name) => name.endsWith(".json") && name !== "manifest.json")
    .map((name) => name.replace(/\.json$/, ""))
    .sort();
}

async function nextId() {
  const ids = await listIds();
  const highest = ids.length
    ? Math.max(...ids.map((id) => parseInt(id, 10) || 0))
    : 0;
  return String(highest + 1).padStart(3, "0");
}

function rebuildManifest() {
  return new Promise((resolve, reject) => {
    execFile("node", ["scripts/build-manifest.mjs"], (error) =>
      error ? reject(error) : resolve(),
    );
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }
  if (request.method !== "POST" || request.url !== "/save-template") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const body = JSON.parse((await readBody(request)).toString());
    const { imageBase64, corners } = body;

    if (typeof imageBase64 !== "string" || !Array.isArray(corners) || corners.length !== 4) {
      sendJson(response, 400, { error: "imageBase64 and four corners are required" });
      return;
    }

    const id = await nextId();
    const imageData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    await fs.writeFile(path.join(TEMPLATES_DIR, `${id}.jpg`), Buffer.from(imageData, "base64"));
    await fs.writeFile(
      path.join(TEMPLATES_DIR, `${id}.json`),
      JSON.stringify({ corners }, null, 2),
    );
    await rebuildManifest();
    sendJson(response, 200, { id });
  } catch (error) {
    sendJson(response, 500, { error: String(error) });
  }
});

server.listen(PORT, () => {
  console.log(`Admin template server listening on http://localhost:${PORT}`);
});
