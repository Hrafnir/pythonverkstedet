import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/pyodide.mjs";

const pyodideReady = loadPyodide();

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
    const globals = pyodide.globals.get("dict")();
    await pyodide.runPythonAsync(code, { globals });
    let plot = "";
    try {
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
