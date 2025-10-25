import {BrowserWindow} from 'electron';
import {youtubeDefaultTitle, zicmuAppName} from './constants';

export function setupWindowEvents(mainWindow: BrowserWindow) {
  mainWindow.on('page-title-updated', async (event) => {
    const title =
      await mainWindow.webContents.executeJavaScript('document.title');
    event.preventDefault();
    const splited = title.split(youtubeDefaultTitle);
    const newTilte = splited.length === 1 ? zicmuAppName : zicmuAppName + ' - ' + splited[0];
    mainWindow.setTitle(newTilte);
  });
}