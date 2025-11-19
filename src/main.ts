import {app, BrowserWindow, Rectangle, protocol, net} from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import zicmuStore from './store/ZicmuStore';
import * as url from 'node:url';
import setupAppMenu, {trayStatus} from './menu';
import {youtubeMusic, zicmuAppName} from './constants';
import {setupWindowEvents} from './custom';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}
let mainWindow: Electron.BrowserWindow;

export function getAssetsPath(): string {
  return path.join(__dirname, app.isPackaged ? '/../renderer/main_window/' : '../../public/');
}

const createWindow = () => {
  const mainState = zicmuStore.get('windowBounds') as Rectangle;
  mainWindow = new BrowserWindow({
    width: mainState?.width,
    height: mainState?.height,
    minHeight: 240,
    minWidth: 480,
    resizable: true,
    x: mainState?.x,
    y: mainState?.y,
    fullscreen: zicmuStore.get('isFullScreen') as boolean,
    icon: path.join(getAssetsPath(), "youtubZicmu.png"),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    title: zicmuAppName,
    titleBarStyle: 'hidden',
    ...(process.platform !== 'darwin' ? {
      titleBarOverlay: {
        color: '#000',
        symbolColor: '#FFF',
      },
    } : {}),
  });

  if (zicmuStore.get('isMaximized')) {
    mainWindow.maximize();
  }

  setupWindowEvents(mainWindow);
  setupAppMenu(app, mainWindow);
  mainWindow.loadURL(youtubeMusic);

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!trayStatus.isAppQuiting) {
      trayStatus.isTrayed = true;
      event.preventDefault();
      mainWindow.hide();
    }
    zicmuStore.set('windowBounds', mainWindow.getBounds());
    zicmuStore.set('isMaximized', mainWindow.isMaximized());
    zicmuStore.set('isFullScreen', mainWindow.isFullScreen());
  });

  mainWindow.webContents.on('will-prevent-unload', (event) => {
    if (trayStatus.isAppQuiting) {
      event.preventDefault();
      app.quit();
    }
  });
};

const lockAcquire = app.requestSingleInstanceLock();
if (!lockAcquire) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (trayStatus.isTrayed) mainWindow.show();
      mainWindow.focus();
    }
  })

  app.whenReady().then(() => {
    protocol.handle('localfile', (request) => {
      const filePath = request.url.slice('localfile://'.length);
      return net.fetch(url.pathToFileURL(path.join(getAssetsPath(), filePath)).toString());
    });
    createWindow();
  })
}

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
