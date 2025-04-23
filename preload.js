const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendUserToElectron: (user) => ipcRenderer.send("user-logged-in", user),
});


