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
    const usesMatplotlib = /\b(matplotlib|pyplot)\b/.test(code);
    if (usesMatplotlib) {
      await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def _bjornsveen_show(*args, **kwargs):
    # Nettleser-/offline-appen viser figurene i resultatpanelet etter kjøring.
    # Derfor skal plt.show() ikke forsøke å åpne Pyodides DOM-baserte vindu.
    return None

plt.show = _bjornsveen_show
`, { globals });
    }
    await pyodide.runPythonAsync(code, { globals });
    let plots = [];
    if (usesMatplotlib) try {
      const encodedPlots = await pyodide.runPythonAsync(`
import base64
import io
import json

_bjornsveen_plots = []
try:
    import matplotlib.pyplot as plt
    for _bjornsveen_figure_number in plt.get_fignums():
        _bjornsveen_figure = plt.figure(_bjornsveen_figure_number)
        _bjornsveen_buffer = io.BytesIO()
        _bjornsveen_figure.savefig(
            _bjornsveen_buffer,
            format="png",
            dpi=170,
            bbox_inches="tight",
            facecolor="white",
        )
        _bjornsveen_plots.append(base64.b64encode(_bjornsveen_buffer.getvalue()).decode("ascii"))
    plt.close("all")
except ImportError:
    pass

json.dumps(_bjornsveen_plots)
`, { globals });
      plots = JSON.parse(encodedPlots);
    } catch {
      plots = [];
    }
    globals.destroy();
    self.postMessage({ type: "result", output: `${stdout}${stderr}`, plots });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

start();
