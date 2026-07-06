import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import {
  ConversionOptions,
  ConversionProgress,
  buildFFmpegArgs,
  parseProgress,
  timeToSeconds,
  VideoInfo,
} from '@video-converter/shared';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    title: '视频转换器',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle('select-output-path', async (_event, defaultName: string) => {
  const result = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'],
      },
    ],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  return result.filePath;
});

ipcMain.handle('get-video-info', async (_event, filePath: string): Promise<VideoInfo | null> => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        resolve(null);
        return;
      }

      const videoStream = metadata.streams.find((s) => s.codec_type === 'video');
      const audioStream = metadata.streams.find((s) => s.codec_type === 'audio');

      const info: VideoInfo = {
        path: filePath,
        filename: path.basename(filePath),
        format: metadata.format.format_name || '',
        duration: metadata.format.duration || 0,
        size: parseInt(metadata.format.size || '0', 10),
        videoStream: videoStream
          ? {
              codec: videoStream.codec_name || '',
              width: videoStream.width || 0,
              height: videoStream.height || 0,
              fps: videoStream.avg_frame_rate
                ? parseInt(videoStream.avg_frame_rate.split('/')[0], 10) /
                  parseInt(videoStream.avg_frame_rate.split('/')[1], 10)
                : 0,
              bitrate: videoStream.bit_rate || '',
            }
          : undefined,
        audioStream: audioStream
          ? {
              codec: audioStream.codec_name || '',
              channels: audioStream.channels || 0,
              sampleRate: parseInt(audioStream.sample_rate || '0', 10),
              bitrate: audioStream.bit_rate || '',
            }
          : undefined,
      };

      resolve(info);
    });
  });
});

let currentProcess: ReturnType<typeof spawn> | null = null;

ipcMain.handle(
  'convert-video',
  async (event, options: ConversionOptions): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const args = buildFFmpegArgs(options);
      console.log('FFmpeg args:', args.join(' '));

      currentProcess = spawn('ffmpeg', args);

      let totalDuration = 0;
      ffmpeg.ffprobe(options.inputPath, (err, metadata) => {
        if (!err && metadata.format.duration) {
          totalDuration = metadata.format.duration;
        }
      });

      let stderr = '';

      currentProcess.stderr?.on('data', (data) => {
        const line = data.toString();
        stderr += line;
      });

      currentProcess.stdout?.on('data', (data) => {
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (line.includes('out_time=')) {
            const progress = parseProgress(line, totalDuration);
            if (progress) {
              event.sender.send('conversion-progress', {
                percent: progress.percent,
                currentTime: progress.currentTime,
              });
            }
          }
        }
      });

      currentProcess.on('close', (code) => {
        currentProcess = null;
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: stderr });
        }
      });

      currentProcess.on('error', (err) => {
        currentProcess = null;
        resolve({ success: false, error: err.message });
      });
    });
  }
);

ipcMain.handle('cancel-conversion', async () => {
  if (currentProcess) {
    currentProcess.kill('SIGTERM');
    currentProcess = null;
  }
  return true;
});
