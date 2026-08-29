import { app, BrowserWindow, dialog, ipcMain, session, shell } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const desktopDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(desktopDir, "..");
const webRoot = path.join(appRoot, "github-dist");
const legacyUserDataPath = path.join(app.getPath("appData"), "Bjørnsveen Pythonverksted");
app.setPath("userData", legacyUserDataPath);

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 920,
    minWidth: 900,
    minHeight: 650,
    title: "Skolepython · Bjørnsveen",
    backgroundColor: "#fffdf8",
    webPreferences: {
      preload: path.join(desktopDir, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("mailto:") || url.startsWith("https://")) void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("file://")) return;
    event.preventDefault();
    if (url.startsWith("mailto:") || url.startsWith("https://")) void shell.openExternal(url);
  });
  await mainWindow.loadFile(path.join(webRoot, "index.html"));

  if (process.env.BJORNSVEEN_SMOKE_TEST === "1") {
    mainWindow.webContents.on("console-message", (_event, level, message, line, sourceId) => {
      process.stdout.write(`BJORNSVEEN_CONSOLE[${level}]: ${message} (${sourceId}:${line})\n`);
    });
    const waitFor = async (check, timeout = 120000) => {
      const started = Date.now();
      while (Date.now() - started < timeout) {
        const result = await mainWindow.webContents.executeJavaScript(check);
        if (result) return result;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      throw new Error("Røyketesten brukte for lang tid");
    };
    try {
      await waitFor("Boolean(document.querySelector('#module-select'))", 15000);
      process.stdout.write("BJORNSVEEN_SMOKE_STAGE: app-loaded\n");
      await mainWindow.webContents.executeJavaScript(`
        const select = document.querySelector('#module-select');
        select.value = 'playground';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      `);
      await waitFor("Boolean(document.querySelector('#playground-code'))", 15000);
      process.stdout.write("BJORNSVEEN_SMOKE_STAGE: playground-loaded\n");
      await mainWindow.webContents.executeJavaScript(`
        const editor = document.querySelector('#playground-code');
        const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
        setter.call(editor, 'import numpy as np\\nimport matplotlib.pyplot as plt\\n\\nprint(int(np.array([2, 3, 5]).sum()))\\nx = np.linspace(-5, 5, 100)\\nplt.plot(x, x ** 2)\\nplt.title("Offline Matplotlib-test")\\nplt.grid()\\nplt.show()');
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      `);
      await new Promise((resolve) => setTimeout(resolve, 100));
      await mainWindow.webContents.executeJavaScript("document.querySelector('.run-button').click()");
      process.stdout.write(`BJORNSVEEN_SMOKE_STAGE: ${await mainWindow.webContents.executeJavaScript(`
        (() => {
          const button = document.querySelector('.run-button');
          const editor = document.querySelector('#playground-code');
          return JSON.stringify({ button: button?.textContent, disabled: button?.disabled, code: editor?.value });
        })()
      `)}\n`);
      const result = await waitFor(`
        (() => {
          const value = document.querySelector('.output-panel pre')?.textContent || '';
          const plot = document.querySelector('.plot-card img');
          const complete = value.trim().startsWith('10') && plot?.complete && plot?.naturalWidth > 0;
          return complete
            ? JSON.stringify({ value, plotWidth: plot.naturalWidth })
            : value.includes('Kunne ikke')
            || value.includes('stoppet')
            || value.includes('for lang tid')
            ? JSON.stringify({ value, error: true })
            : '';
        })()
      `);
      const smokeResult = JSON.parse(result);
      if (smokeResult.error || !smokeResult.plotWidth) throw new Error(smokeResult.value.trim());
      process.stdout.write(`BJORNSVEEN_SMOKE_OK: 10 + matplotlib (${smokeResult.plotWidth}px)\n`);
      app.exit(0);
    } catch (error) {
      process.stderr.write(`BJORNSVEEN_SMOKE_FAILED: ${error.message}\n`);
      app.exit(1);
    }
  }
}

app.whenReady().then(async () => {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const allowed = ["file://", "devtools://", "data:", "blob:"].some((prefix) =>
      details.url.startsWith(prefix),
    );
    callback({ cancel: !allowed });
  });

  ipcMain.handle("project:open", async () => {
    const result = await dialog.showOpenDialog({
      title: "Åpne Python-prosjekt",
      properties: ["openFile"],
      filters: [{ name: "Python", extensions: ["py"] }],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    return { filePath, name: path.basename(filePath, ".py"), code: await fs.readFile(filePath, "utf8") };
  });

  ipcMain.handle("project:save", async (_event, payload) => {
    let filePath = payload.filePath;
    if (!filePath) {
      const result = await dialog.showSaveDialog({
        title: "Lagre Python-prosjekt",
        defaultPath: `${payload.name || "python-prosjekt"}.py`,
        filters: [{ name: "Python", extensions: ["py"] }],
      });
      if (result.canceled || !result.filePath) return null;
      filePath = result.filePath;
    }
    await fs.writeFile(filePath, payload.code, "utf8");
    return { filePath, name: path.basename(filePath, ".py") };
  });

  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
