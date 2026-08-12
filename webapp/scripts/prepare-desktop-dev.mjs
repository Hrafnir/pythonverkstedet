import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const source = path.join(root, "desktop", "pyodide");
const target = path.join(root, "github-dist", "pyodide");

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
process.stdout.write("Offline-Python er klargjort for lokal Mac-test.\n");
