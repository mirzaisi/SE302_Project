import { ElectronAPI } from '@electron-toolkit/preload'

interface DatabaseAPI {
  query: (sql: string, params: unknown[]) => Promise<unknown[]>
  run: (sql: string, params: unknown[]) => Promise<unknown>
  get: (sql: string, params: unknown[]) => Promise<unknown>
}

interface API {
  db: DatabaseAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
