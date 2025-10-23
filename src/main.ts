import { app, BrowserWindow, Menu, Tray, Rectangle, protocol, net } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import zicmuAppName, { setupWindowEvents } from './custom';
import zicmuStore from './store/ZicmuStore';
import * as url from 'node:url';

const youtubeMusic = 'https://music.youtube.com/';
let isQuiting = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const assetsPath = path.join(__dirname, app.isPackaged ? '/../renderer/main_window/' : '../../public/');

const createWindow = () => {
  const mainState = zicmuStore.get('windowBounds') as Rectangle;
  const mainWindow = new BrowserWindow({
    width: mainState?.width,
    height: mainState?.height,
    minHeight: 240,
    minWidth: 480,
    resizable: true,
    x: mainState?.x,
    y: mainState?.y,
    fullscreen: zicmuStore.get('isFullScreen') as boolean,
    icon: path.join(__dirname, app.isPackaged ? '../renderer/main_window/youtubZicmu.png' : '../../public/youtubZicmu.png'),
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

  mainWindow.loadURL(youtubeMusic);

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    zicmuStore.set('windowBounds', mainWindow.getBounds());
    zicmuStore.set('isMaximized', mainWindow.isMaximized());
    zicmuStore.set('isFullScreen', mainWindow.isFullScreen());
  });

  //TODO: refacto tray.ts
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Afficher ${zicmuAppName}`,
      click: () => {
        mainWindow.show();
      },
    },
    {
      label: 'Quitter',
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  const trayApp = new Tray(path.join(assetsPath, 'youtubZicmu.png'));
  trayApp.setToolTip(zicmuAppName);
  trayApp.setContextMenu(contextMenu);
  trayApp.on('double-click', () => {
    mainWindow.show();
  });

  mainWindow.webContents.on('will-prevent-unload', (event) => {
    if (isQuiting) {
      event.preventDefault();
      app.quit();
    }
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  protocol.handle('localfile', (request) => {
    const filePath = request.url.slice('localfile://'.length);
    return net.fetch(url.pathToFileURL(path.join(assetsPath, filePath)).toString());
  });
  createWindow();
});
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
