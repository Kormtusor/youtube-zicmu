import {Menu, Tray} from 'electron';
import {zicmuAppName} from './constants';
import path from 'path';
import {getAssetsPath} from './main';

export interface TrayConfig {
  isAppQuiting: boolean,
  isTrayed: boolean;
}
export const trayStatus: TrayConfig = {
  isAppQuiting: false,
  isTrayed: false
}

export default function setupAppMenu(app: Electron.App, window: Electron.BrowserWindow) {
  const trayMenu = Menu.buildFromTemplate([
    {
      label: `Afficher ${zicmuAppName}`,
      click: () => {
        trayStatus.isTrayed = false;
        window.show();
      }
    }, {
      label: 'Quitter',
      click: () => {
        trayStatus.isAppQuiting = true;
        app.quit();
      }
    }
  ]);

  const trayApp = new Tray(path.join(getAssetsPath(), "youtubZicmu.png"))
  trayApp.setToolTip(zicmuAppName);
  trayApp.setContextMenu(trayMenu);
  trayApp.on('double-click', () => {
    window.show();
  });
};
