/// <reference types="vite/client" />

declare module '*.png' {
  const value: string
  export default value
}

declare module '*.jpg' {
  const value: string
  export default value
}

declare module '*.svg' {
  const value: string
  export default value
}

interface ElectronAPI {
  db: {
    query: (sql: string, params: unknown[]) => Promise<unknown[]>
    run: (sql: string, params: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>
    get: (sql: string, params: unknown[]) => Promise<unknown | undefined>
  }
  files: {
    selectFile: () => Promise<{ canceled: boolean; filePaths: string[] }>
    readFile: (filePath: string) => Promise<string>
    exportExcel: (data: unknown[][], filename: string) => Promise<{ success: boolean; path?: string; error?: string }>
    exportPDF: (
      data: unknown[][],
      filename: string,
      title?: string
    ) => Promise<{ success: boolean; path?: string; error?: string }>
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

export {}
