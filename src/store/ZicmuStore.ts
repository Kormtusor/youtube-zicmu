import Rectangle = Electron.Rectangle;
import ElectronStore from 'electron-store';
interface ZicmuConfig {
  windowBounds: Rectangle;
  isFullScreen: boolean,
  isMaximized: boolean,
}

const zicmuStore = new ElectronStore<ZicmuConfig>({
  defaults: {
    windowBounds: {
      height: 880,
      width: 1280,
    },
    isFullScreen: false,
    isMaximized: false,
  },
});

export default zicmuStore;
