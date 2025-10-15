import {app, BrowserWindow} from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import zicmuAppName, {setupWindowEvents} from "./custom";
import fs from 'fs';

const youtubeMusic = "https://music.youtube.com/"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 880,
    icon: path.join(__dirname, app.isPackaged ? '../renderer/main_window/youtubZicmu.png' : '../../public/youtubZicmu.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    title: zicmuAppName,
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  });
  setupWindowEvents(mainWindow);

  mainWindow.loadURL(youtubeMusic);
  // Open the DevTools.
  if(!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    const titleBarJs = fs.readFileSync(path.join(__dirname, app.isPackaged ? '../renderer/main_window/titlebar.js' : '../../public/titlebar.js'), "utf-8")
    mainWindow.webContents.executeJavaScript(titleBarJs);
    const titleBarCss = fs.readFileSync(path.join(__dirname, app.isPackaged ? '../renderer/main_window/titlebar.css' : '../../public/titlebar.css'), "utf-8")
    mainWindow.webContents.insertCSS(titleBarCss);
  })
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
