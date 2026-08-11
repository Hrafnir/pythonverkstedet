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
    globals.destroy();
    self.postMessage({ type: "result", output: `${stdout}${stderr}` });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};

start();
