const desktopMode = self.location.protocol === "file:";
const localIndex = new URL("./pyodide/", self.location.href).href;
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
const moduleUrl = desktopMode
  ? `${localIndex}pyodide.mjs`
  : "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs";
const { loadPyodide } = await import(moduleUrl);

const pyodideReady = desktopMode
  ? Promise.all([
      localFileUrlToDataUrl(`${localIndex}pyodide.asm.wasm`),
      localFileUrlToDataUrl(`${localIndex}python_stdlib.zip`),
    ]).then(([wasmURL, stdLibURL]) => loadPyodide({
      indexURL: localIndex,
      lockFileURL: `${localIndex}pyodide-lock.json`,
      stdLibURL,
      _wasmBinaryFile: wasmURL,
    }))
  : loadPyodide();

async function start() {
  try {
    await pyodideReady;
    self.postMessage({ type: "ready" });
  } catch (error) {
    self.postMessage({ type: "error", error: `Kunne ikke starte Python: ${error.message}` });
  }
}

self.onmessage = async (event) => {
  const pyodide = await pyodideReady;
  const code = event.data.code;
  let stdout = "";
  let stderr = "";

  pyodide.setStdout({ batched: (text) => { stdout += `${text}\n`; } });
  pyodide.setStderr({ batched: (text) => { stderr += `${text}\n`; } });

  try {
    await pyodide.loadPackagesFromImports(code);
    stdout = "";
    stderr = "";
    const globals = pyodide.globals.get("dict")();
    await pyodide.runPythonAsync(code, { globals });
    let plot = "";
    if (/\b(matplotlib|pyplot)\b/.test(code)) try {
      plot = await pyodide.runPythonAsync(`
import base64
import io

_bjornsveen_plot = ""
try:
    import matplotlib.pyplot as plt
    if plt.get_fignums():
        _bjornsveen_buffer = io.BytesIO()
        plt.gcf().savefig(_bjornsveen_buffer, format="png", dpi=150, bbox_inches="tight")
        _bjornsveen_plot = base64.b64encode(_bjornsveen_buffer.getvalue()).decode("ascii")
        plt.close("all")
except ImportError:
    pass

_bjornsveen_plot
`, { globals });
    } catch {
      plot = "";
    }
    globals.destroy();
    self.postMessage({ type: "result", output: `${stdout}${stderr}`, plot });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

start();
