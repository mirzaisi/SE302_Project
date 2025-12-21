import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  db: {
    query: (sql: string, params: unknown[]): Promise<unknown[]> =>
      ipcRenderer.invoke('db:query', sql, params),
    run: (
      sql: string,
      params: unknown[]
    ): Promise<{ changes: number; lastInsertRowid: number }> =>
      ipcRenderer.invoke('db:run', sql, params),
    get: (sql: string, params: unknown[]): Promise<unknown | undefined> =>
      ipcRenderer.invoke('db:get', sql, params)
  },
  files: {
    selectFile: (): Promise<{ canceled: boolean; filePaths: string[] }> =>
      ipcRenderer.invoke('files:selectFile'),
    readFile: (filePath: string): Promise<string> =>
      ipcRenderer.invoke('files:readFile', filePath),
    exportExcel: (
      data: unknown[][],
      filename: string
    ): Promise<{ success: boolean; path?: string; error?: string }> =>
      ipcRenderer.invoke('files:exportExcel', data, filename),
    exportPDF: (
      data: unknown[][],
      filename: string,
      title?: string
    ): Promise<{ success: boolean; path?: string; error?: string }> =>
      ipcRenderer.invoke('files:exportPDF', data, filename, title)
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
