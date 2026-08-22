import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const outputDir = path.join(root, "desktop", "pyodide");
const version = "314.0.2";
const baseUrl = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
const roots = ["numpy", "pandas", "matplotlib", "scipy", "sympy", "scikit-learn", "pillow", "networkx", "shapely", "micropip"];
const runtimeFiles = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];

async function download(fileName, expectedSha) {
  const target = path.join(outputDir, fileName);
  let data;
  try {
    data = await readFile(target);
    if (!expectedSha || createHash("sha256").update(data).digest("hex") === expectedSha) return;
  } catch {
    // Filen mangler og lastes ned under.
  }
  const response = await fetch(`${baseUrl}${fileName}`);
  if (!response.ok) throw new Error(`Kunne ikke laste ned ${fileName}: ${response.status}`);
  data = Buffer.from(await response.arrayBuffer());
  if (expectedSha && createHash("sha256").update(data).digest("hex") !== expectedSha) {
    throw new Error(`Kontrollsummen stemmer ikke for ${fileName}`);
  }
  await writeFile(target, data);
  process.stdout.write(`Lastet ned ${fileName}\n`);
}

await mkdir(outputDir, { recursive: true });
await download("pyodide-lock.json");
const lock = JSON.parse(await readFile(path.join(outputDir, "pyodide-lock.json"), "utf8"));
const selected = new Set();
function includePackage(name) {
  if (selected.has(name)) return;
  const item = lock.packages[name];
  if (!item) throw new Error(`Pakken ${name} finnes ikke i Pyodide-manifestet`);
  selected.add(name);
  item.depends.forEach(includePackage);
}
roots.forEach(includePackage);

for (const fileName of runtimeFiles.filter((name) => name !== "pyodide-lock.json")) {
  await download(fileName);
}
for (const name of [...selected].sort()) {
  const item = lock.packages[name];
  await download(item.file_name, item.sha256);
}

await writeFile(
  path.join(outputDir, "bjornsveen-packages.json"),
  `${JSON.stringify({ pyodide: version, roots, included: [...selected].sort() }, null, 2)}\n`,
);
process.stdout.write(`Offline-pakken inneholder ${selected.size} Python-pakker.\n`);
