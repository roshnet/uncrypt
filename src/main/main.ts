/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable'
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron'
import log from 'electron-log'
import Store from 'electron-store'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import 'regenerator-runtime/runtime'
import db from './db'
import MenuBuilder from './menu'
import { decryptFile, encryptFile, resolveHtmlPath } from './utils'

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

let mainWindow: BrowserWindow | null = null

const store = new Store()

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`
  console.log(msgTemplate(arg))
  event.reply('ipc-example', msgTemplate('pong'))
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDevelopment) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log)
}

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions()
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  })

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

// Read files for the renderer
ipcMain.handle('OPEN_FILE_SELECT', async () => {
  const { filePaths } = await dialog.showOpenDialog(
    { properties: ['openFile', 'multiSelections'] },
    {
      message: 'Select files to encrypt',
      title: 'Pick files',
      buttonLabel: 'Select',
    },
  )
  return filePaths
})

// Read values in electron-store via renderer
ipcMain.handle('GET_STORE', (e, key) => {
  return store.get(key, '')
})

// Save values to electron-store via renderer
ipcMain.handle('SET_STORE', (e, key: string, value: unknown) => {
  store.set(key, value)
})

// Handle encryption of the specified file
ipcMain.handle(
  'ENCRYPT',
  async (e: Electron.IpcMainInvokeEvent, filePath: string) => {
    try {
      await encryptFile(filePath)
      await db.files.insert({
        path: filePath,
        op: 'enc',
      })
      return true
    } catch {
      return false
    }
  },
)

// Attempt decryption of the specified file
ipcMain.handle(
  'DECRYPT',
  async (e: Electron.IpcMainInvokeEvent, filePath: string) => {
    try {
      await decryptFile(filePath)
      await db.files.insert({
        path: filePath,
        op: 'dec',
      })
      return true
    } catch {
      return false
    }
  },
)

// Return a list of all files in the database
ipcMain.handle('GET_ALL_FILES', async () => {
  const allFiles = await db.files.find({})
  return allFiles
})

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app
  .whenReady()
  .then(() => {
    createWindow()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })
  })
  .catch(console.log)
