import { app, shell, BrowserWindow, ipcMain, dialog, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, getDatabase, closeDatabase } from './database'
import * as fs from 'fs'
import * as path from 'path'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Get the primary display's work area (excludes taskbar)
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

  // Calculate window size as 85% of screen, with reasonable limits
  const windowWidth = Math.min(Math.max(Math.floor(screenWidth * 0.85), 1024), 1600)
  const windowHeight = Math.min(Math.max(Math.floor(screenHeight * 0.85), 700), 1000)

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: 'ExamFlow',
    center: true,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Setup IPC handlers for database operations
function setupIpcHandlers(): void {
  // Database query handler
  ipcMain.handle('db:query', async (_event, sql: string, params: unknown[]) => {
    try {
      const db = getDatabase()
      const stmt = db.prepare(sql)
      return stmt.all(...params)
    } catch (error) {
      console.error('Database query error:', error)
      throw error
    }
  })

  // Database run handler (for INSERT, UPDATE, DELETE)
  ipcMain.handle('db:run', async (_event, sql: string, params: unknown[]) => {
    try {
      const db = getDatabase()
      const stmt = db.prepare(sql)
      const result = stmt.run(...params)
      return { changes: result.changes, lastInsertRowid: result.lastInsertRowid }
    } catch (error) {
      console.error('Database run error:', error)
      throw error
    }
  })

  // Database get handler (for single row)
  ipcMain.handle('db:get', async (_event, sql: string, params: unknown[]) => {
    try {
      const db = getDatabase()
      const stmt = db.prepare(sql)
      return stmt.get(...params)
    } catch (error) {
      console.error('Database get error:', error)
      throw error
    }
  })

  // File selection dialog
  ipcMain.handle('files:selectFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    })
    return result
  })

  // Read file content
  ipcMain.handle('files:readFile', async (_event, filePath: string) => {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
      console.error('File read error:', error)
      throw error
    }
  })

  // Export to Excel (CSV format for simplicity)
  ipcMain.handle(
    'files:exportExcel',
    async (_event, data: unknown[][], filename: string) => {
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: filename,
          filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        })

        if (result.canceled || !result.filePath) {
          return { success: false }
        }

        // Convert data to CSV
        const csv = data.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
        fs.writeFileSync(result.filePath, csv, 'utf-8')

        return { success: true, path: result.filePath }
      } catch (error) {
        console.error('Export error:', error)
        return { success: false, error: String(error) }
      }
    }
  )

  // Export to PDF (using HTML approach)
  ipcMain.handle(
    'files:exportPDF',
    async (_event, data: unknown[][], filename: string, title?: string) => {
      try {
        const result = await dialog.showSaveDialog({
          defaultPath: filename.replace('.xlsx', '.pdf'),
          filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
        })

        if (result.canceled || !result.filePath) {
          return { success: false }
        }

        // Create a hidden window to render the PDF
        const pdfWindow = new BrowserWindow({
          width: 800,
          height: 600,
          show: false,
          webPreferences: {
            nodeIntegration: true
          }
        })

        // Create HTML content for the PDF
        const tableRows = data
          .map(
            (row, index) =>
              `<tr style="${index === 0 ? 'background-color: #f0f0f0; font-weight: bold;' : ''}">
            ${row.map((cell) => `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`).join('')}
          </tr>`
          )
          .join('')

        const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; text-align: center; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              td { text-align: left; }
            </style>
          </head>
          <body>
            <h1>${title || 'ExamFlow Schedule Export'}</h1>
            <table>${tableRows}</table>
          </body>
        </html>
      `

        const tempHtmlPath = path.join(app.getPath('temp'), 'examflow-export.html')
        fs.writeFileSync(tempHtmlPath, htmlContent)

        await pdfWindow.loadFile(tempHtmlPath)

        const pdfData = await pdfWindow.webContents.printToPDF({
          pageSize: 'A4',
          printBackground: true,
          landscape: true
        })

        fs.writeFileSync(result.filePath, pdfData)
        pdfWindow.close()

        // Clean up temp file
        fs.unlinkSync(tempHtmlPath)

        return { success: true, path: result.filePath }
      } catch (error) {
        console.error('PDF export error:', error)
        return { success: false, error: String(error) }
      }
    }
  )
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.examflow.app')

  // Initialize database
  initDatabase()

  // Setup IPC handlers
  setupIpcHandlers()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase()
    app.quit()
  }
})

// Close database on app quit
app.on('before-quit', () => {
  closeDatabase()
})
