import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(root, "..");
const outRoot = path.join(repoRoot, "release", "macos-arm64");
const packageRoot = path.join(root, "desktop-package");
const workRoot = await mkdtemp(path.join(os.tmpdir(), "bjornsveen-pythonverksted-"));
const productName = "Bjørnsveen Pythonverksted";
const version = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;

function run(command, args, options = {}) {
  execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });
}

await rm(outRoot, { recursive: true, force: true });
await rm(packageRoot, { recursive: true, force: true });
await mkdir(outRoot, { recursive: true });
await mkdir(packageRoot, { recursive: true });

run(process.execPath, [path.join(root, "scripts", "download-pyodide.mjs")]);
run("npm", ["run", "build"]);

run("ditto", ["--noextattr", "--norsrc", path.join(root, "github-dist"), path.join(packageRoot, "github-dist")]);
run("ditto", ["--noextattr", "--norsrc", path.join(root, "desktop", "pyodide"), path.join(packageRoot, "github-dist", "pyodide")]);
run("ditto", ["--noextattr", "--norsrc", path.join(root, "desktop"), path.join(packageRoot, "desktop")]);
await writeFile(path.join(packageRoot, "package.json"), `${JSON.stringify({
  name: "bjornsveen-pythonverksted-desktop",
  version,
  productName,
  main: "desktop/main.mjs",
  type: "module",
}, null, 2)}\n`);

const appDir = path.join(workRoot, `${productName}-darwin-arm64`);
const appPath = path.join(appDir, `${productName}.app`);
await mkdir(appDir, { recursive: true });
run("ditto", ["--noextattr", "--norsrc", path.join(root, "node_modules", "electron", "dist", "Electron.app"), appPath]);
const resourcesDir = path.join(appPath, "Contents", "Resources");
await rm(path.join(resourcesDir, "default_app.asar"), { force: true });
await cp(packageRoot, path.join(resourcesDir, "app"), { recursive: true });
const plist = path.join(appPath, "Contents", "Info.plist");
for (const [key, value] of [
  ["CFBundleDisplayName", productName],
  ["CFBundleName", productName],
  ["CFBundleIdentifier", "no.bjornsveen.pythonverksted"],
  ["CFBundleShortVersionString", version],
  ["CFBundleVersion", "1"],
]) {
  try { run("/usr/libexec/PlistBuddy", ["-c", `Set :${key} ${value}`, plist]); }
  catch { run("/usr/libexec/PlistBuddy", ["-c", `Add :${key} string ${value}`, plist]); }
}
for (const key of [
  "ElectronAsarIntegrity",
  "NSAppTransportSecurity",
  "NSAudioCaptureUsageDescription",
  "NSBluetoothAlwaysUsageDescription",
  "NSBluetoothPeripheralUsageDescription",
  "NSCameraUsageDescription",
  "NSMicrophoneUsageDescription",
]) {
  try { run("/usr/libexec/PlistBuddy", ["-c", `Delete :${key}`, plist]); } catch { /* Nøkkelen var ikke satt. */ }
}
const signIdentity = process.env.MAC_APP_IDENTITY;
run("xattr", ["-cr", appPath]);
if (signIdentity) {
  run(path.join(root, "node_modules", ".bin", "electron-osx-sign"), [appPath, "--identity", signIdentity, "--platform=darwin"]);
  run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath]);
} else {
  run("codesign", ["--force", "--deep", "--sign", "-", appPath]);
}

const dmgStaging = path.join(workRoot, "dmg-staging");
await mkdir(dmgStaging, { recursive: true });
run("ditto", ["--noextattr", "--norsrc", appPath, path.join(dmgStaging, `${productName}.app`)]);
await cp(path.join(root, "desktop", "IT-README.txt"), path.join(dmgStaging, "LES-MEG-IT.txt"));
const workDmgPath = path.join(workRoot, `${productName}-${version}-arm64.dmg`);
const dmgPath = path.join(outRoot, path.basename(workDmgPath));
run("hdiutil", ["create", "-volname", productName, "-srcfolder", dmgStaging, "-ov", "-format", "UDZO", workDmgPath]);

const componentPkg = path.join(workRoot, "component.pkg");
const workPkgPath = path.join(workRoot, `${productName}-${version}-arm64.pkg`);
const pkgPath = path.join(outRoot, path.basename(workPkgPath));
const pkgArgs = ["--component", appPath, "--install-location", "/Applications", "--identifier", "no.bjornsveen.pythonverksted", "--version", version];
if (process.env.MAC_INSTALLER_IDENTITY) pkgArgs.push("--sign", process.env.MAC_INSTALLER_IDENTITY);
pkgArgs.push(componentPkg);
run("pkgbuild", pkgArgs);
const productArgs = ["--package", componentPkg];
if (process.env.MAC_INSTALLER_IDENTITY) productArgs.push("--sign", process.env.MAC_INSTALLER_IDENTITY);
productArgs.push(workPkgPath);
run("productbuild", productArgs);
const finalAppDir = path.join(outRoot, path.basename(appDir));
run("ditto", [appDir, finalAppDir]);
await cp(workDmgPath, dmgPath);
await cp(workPkgPath, pkgPath);
await rm(packageRoot, { recursive: true, force: true });
await rm(workRoot, { recursive: true, force: true });

process.stdout.write(`\nFerdige filer:\n${path.join(finalAppDir, `${productName}.app`)}\n${dmgPath}\n${pkgPath}\n`);
