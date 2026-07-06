import { contextBridge, ipcRenderer } from 'electron';
import { ConversionOptions, VideoInfo } from '../packages/shared/src';

export interface ElectronAPI {
  selectFile: () => Promise<string | null>;
  selectOutputPath: (defaultName: string) => Promise<string | null>;
  getVideoInfo: (filePath: string) => Promise<VideoInfo | null>;
  convertVideo: (options: ConversionOptions) => Promise<{ success: boolean; error?: string }>;
  cancelConversion: () => Promise<boolean>;
  onProgress: (callback: (progress: { percent: number; currentTime: string }) => void) => () => void;
}

const electronAPI: ElectronAPI = {
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectOutputPath: (defaultName: string) => ipcRenderer.invoke('select-output-path', defaultName),
  getVideoInfo: (filePath: string) => ipcRenderer.invoke('get-video-info', filePath),
  convertVideo: (options: ConversionOptions) => ipcRenderer.invoke('convert-video', options),
  cancelConversion: () => ipcRenderer.invoke('cancel-conversion'),
  onProgress: (callback) => {
    const listener = (_event: unknown, progress: { percent: number; currentTime: string }) => {
      callback(progress);
    };
    ipcRenderer.on('conversion-progress', listener);
    return () => {
      ipcRenderer.removeListener('conversion-progress', listener);
    };
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
