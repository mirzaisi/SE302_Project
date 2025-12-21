import { ElectronAPI } from '@electron-toolkit/preload'

interface DatabaseAPI {
  db: {
    query: (
      sql: string,
      params?: (string | number | boolean)[]
    ) => Promise<Record<string, unknown>[]>
    run: (sql: string, params?: (string | number | boolean)[]) => Promise<unknown>
    get: (
      sql: string,
      params?: (string | number | boolean)[]
    ) => Promise<Record<string, unknown> | undefined>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: DatabaseAPI
  }
}
