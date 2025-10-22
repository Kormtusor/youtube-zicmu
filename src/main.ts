import { app, BrowserWindow, Menu, Tray, nativeImage, Rectangle } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import zicmuAppName, { setupWindowEvents } from './custom';
import zicmuStore from './store/ZicmuStore';
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
    ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
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
      label: 'Afficher la zicmu',
      click: () => {
        mainWindow.show();
      },
    },
    {
        label: 'C CIAO',
      click: () => {
        isQuiting = true;
        app.quit();
      },
    },
  ]);

  const trayApp = new Tray(
    path.join(
      __dirname,
      app.isPackaged
        ? '../renderer/main_window/youtubZicmu.png'
        : '../../public/youtubZicmu.png',
    ),
  );
  trayApp.setToolTip('Electron.js App');
  trayApp.setContextMenu(contextMenu);
  trayApp.on('double-click', () => {
    mainWindow.show();
  });

  const playIcon = nativeImage.createFromPath(assetsPath + 'play-button.png');
  const pauseIcon = nativeImage.createFromPath(assetsPath + 'pause-button.png');
  let currentPlayStatus = false;

  //TODO: refacto thumbar.ts
  const thumbButtons = [
    {
      tooltip: 'JOUEEEEER',
      icon: playIcon,
      click() { currentPlayStatus=true;}
    }, {
      tooltip: 'STOOOOOOOP',
      icon: pauseIcon,
      //TODO: send ipc message, toggle media
      click() { currentPlayStatus=false;}
    }
  ];

  mainWindow.setThumbarButtons(thumbButtons);

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
