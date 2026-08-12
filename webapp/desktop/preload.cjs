const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bjornsveenDesktop", {
  isDesktop: true,
  openProject: () => ipcRenderer.invoke("project:open"),
  saveProject: (payload) => ipcRenderer.invoke("project:save", payload),
});
