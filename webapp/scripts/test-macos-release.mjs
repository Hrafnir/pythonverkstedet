import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const webappRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(webappRoot, "..");
const version = JSON.parse(await readFile(path.join(webappRoot, "package.json"), "utf8")).version;
const releaseRoot = path.join(repoRoot, "release", "macos-arm64");
const dmgPath = path.join(releaseRoot, `Skolepython-${version}-arm64.dmg`);
const pkgPath = path.join(releaseRoot, `Skolepython-${version}-arm64.pkg`);
const workRoot = await mkdtemp(path.join(os.tmpdir(), "skolepython-release-test-"));
const mountPoint = path.join(workRoot, "dmg");
let mounted = false;

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: webappRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    timeout: 240_000,
    ...options,
  });
}

async function findApp(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name === "Skolepython.app") return candidate;
    if (entry.isDirectory()) {
      const nested = await findApp(candidate);
      if (nested) return nested;
    }
  }
  return null;
}

function smokeTest(appPath, label) {
  const executable = path.join(appPath, "Contents", "MacOS", "Electron");
  process.stdout.write(`\nOFFLINE_TEST_STAGE: ${label}\n`);
  run(executable, [], { env: { ...process.env, BJORNSVEEN_SMOKE_TEST: "1" } });
}

try {
  run("hdiutil", ["verify", dmgPath]);
  await mkdir(mountPoint);
  run("hdiutil", ["attach", "-nobrowse", "-readonly", "-mountpoint", mountPoint, dmgPath]);
  mounted = true;
  smokeTest(path.join(mountPoint, "Skolepython.app"), "DMG");
  run("hdiutil", ["detach", mountPoint]);
  mounted = false;

  const expandedPkg = path.join(workRoot, "pkg");
  run("pkgutil", ["--expand-full", pkgPath, expandedPkg]);
  const pkgApp = await findApp(expandedPkg);
  if (!pkgApp) throw new Error("Fant ikke Skolepython.app i den utpakkede PKG-filen");
  smokeTest(pkgApp, "PKG");

  process.stdout.write(`\nOFFLINE_RELEASE_OK: ${path.basename(dmgPath)} og ${path.basename(pkgPath)}\n`);
} finally {
  if (mounted) {
    try { run("hdiutil", ["detach", mountPoint, "-force"]); } catch { /* Opprydding etter en mislykket test. */ }
  }
  await rm(workRoot, { recursive: true, force: true });
}
