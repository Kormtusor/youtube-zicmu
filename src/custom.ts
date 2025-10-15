import {BrowserWindow} from "electron";

const zicmuAppName = "Youtube Zicmu";
const youtubeDefaultTile = " - YouTube Music";

export default zicmuAppName;

export function setupWindowEvents(mainWindow: BrowserWindow) {
    mainWindow.on('page-title-updated', async (event) => {
        const title = await mainWindow.webContents.executeJavaScript('document.title');
        event.preventDefault();
        const splited = title.split(youtubeDefaultTile);
        const newTilte = splited.length === 1 ? zicmuAppName : zicmuAppName + " - " + splited[0];
        mainWindow.setTitle(newTilte);
    });
}