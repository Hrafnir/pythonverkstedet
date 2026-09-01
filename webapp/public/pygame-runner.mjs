const canvas = document.getElementById("canvas");
const desktopMode = location.protocol === "file:";
const localIndex = new URL("./pyodide/", location.href).href;
let pyodide = null;
let running = false;

function notify(type, payload = {}) {
  parent.postMessage({ source: "skolepython-pygame", type, ...payload }, "*");
}

async function localFileUrlToDataUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Kunne ikke lese lokal Python-fil: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return `data:application/octet-stream;base64,${btoa(binary)}`;
}

async function prepare() {
  try {
    notify("loading", { message: "Laster Python og Pygame …" });
    const moduleUrl = desktopMode
      ? `${localIndex}pyodide.mjs`
      : "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs";
    const { loadPyodide } = await import(moduleUrl);
    if (desktopMode) {
      const [wasmURL, stdLibURL] = await Promise.all([
        localFileUrlToDataUrl(`${localIndex}pyodide.asm.wasm`),
        localFileUrlToDataUrl(`${localIndex}python_stdlib.zip`),
      ]);
      pyodide = await loadPyodide({
        indexURL: localIndex,
        lockFileURL: `${localIndex}pyodide-lock.json`,
        stdLibURL,
        _wasmBinaryFile: wasmURL,
      });
    } else {
      pyodide = await loadPyodide();
    }
    pyodide._api._skip_unwind_fatal_error = true;
    pyodide.canvas.setCanvas2D(canvas);
    notify("loading", { message: "Laster spillbiblioteket pygame-ce …" });
    await pyodide.loadPackage("pygame-ce");
    pyodide.setStdout({ batched: (text) => notify("stdout", { text }) });
    pyodide.setStderr({ batched: (text) => notify("stdout", { text }) });
    document.body.classList.add("is-ready");
    notify("ready");
  } catch (error) {
    notify("error", { error: `Kunne ikke starte Pygame: ${String(error?.message ?? error)}` });
  }
}

async function run(code, files) {
  if (!pyodide || running) return;
  running = true;
  try {
    pyodide.canvas.setCanvas2D(canvas);
    pyodide.FS.mkdirTree("/home/pyodide");
    pyodide.FS.chdir("/home/pyodide");
    for (const file of files ?? []) {
      const name = String(file?.name ?? "").replace(/\\/g, "/").split("/").at(-1);
      if (!name || !/\.(?:py|txt|csv)$/i.test(name) || typeof file?.content !== "string") continue;
      pyodide.FS.writeFile(name, file.content, { encoding: "utf8" });
    }
    await pyodide.runPythonAsync(String(code ?? ""));
    notify("result");
  } catch (error) {
    notify("error", { error: String(error?.message ?? error) });
  } finally {
    running = false;
  }
}

window.addEventListener("message", (event) => {
  if (event.data?.source !== "skolepython") return;
  if (event.data?.type === "run") void run(event.data.code, event.data.files);
  if (event.data?.type === "save-image") {
    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = "pygame-spill.png";
    anchor.click();
  }
});

canvas.addEventListener("pointerdown", () => canvas.focus());
void prepare();
