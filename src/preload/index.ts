import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  db: {
    query: (sql: string, params?: (string | number | boolean)[]) =>
      ipcRenderer.invoke('db:query', sql, params),
    run: (sql: string, params?: (string | number | boolean)[]) =>
      ipcRenderer.invoke('db:run', sql, params),
    get: (sql: string, params?: (string | number | boolean)[]) =>
      ipcRenderer.invoke('db:get', sql, params)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
