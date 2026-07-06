import { ConversionOptions, VideoFormat } from './types';

export const SUPPORTED_FORMATS: VideoFormat[] = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'];

export const FORMAT_LABELS: Record<VideoFormat, string> = {
  mp4: 'MP4 (H.264)',
  avi: 'AVI',
  mov: 'MOV',
  mkv: 'MKV',
  webm: 'WebM',
  flv: 'FLV',
  wmv: 'WMV',
  m4v: 'M4V',
};

export const PRESET_LABELS = {
  ultrafast: '极快',
  superfast: '超快',
  veryfast: '很快',
  faster: '更快',
  fast: '快',
  medium: '中等',
  slow: '慢',
  slower: '更慢',
  veryslow: '极慢',
};

export const COMMON_RESOLUTIONS = [
  { label: '原始', width: 0, height: 0 },
  { label: '4K (3840×2160)', width: 3840, height: 2160 },
  { label: '2K (2560×1440)', width: 2560, height: 1440 },
  { label: '1080p (1920×1080)', width: 1920, height: 1080 },
  { label: '720p (1280×720)', width: 1280, height: 720 },
  { label: '480p (854×480)', width: 854, height: 480 },
  { label: '360p (640×360)', width: 640, height: 360 },
];

export const COMMON_BITRATES = [
  { label: '自动', value: '' },
  { label: '极高 (8 Mbps)', value: '8000k' },
  { label: '高 (5 Mbps)', value: '5000k' },
  { label: '中 (3 Mbps)', value: '3000k' },
  { label: '低 (1.5 Mbps)', value: '1500k' },
  { label: '极低 (800 kbps)', value: '800k' },
];

export function buildFFmpegArgs(options: ConversionOptions): string[] {
  const args: string[] = ['-y', '-i', options.inputPath];

  if (options.videoCodec && options.videoCodec !== 'copy') {
    args.push('-c:v', options.videoCodec);
  }

  if (options.audioCodec && options.audioCodec !== 'copy') {
    args.push('-c:a', options.audioCodec);
  }

  if (options.resolution && options.resolution.width > 0 && options.resolution.height > 0) {
    args.push('-vf', `scale=${options.resolution.width}:${options.resolution.height}`);
  }

  if (options.bitrate) {
    args.push('-b:v', options.bitrate);
  }

  if (options.crf !== undefined && options.videoCodec?.includes('264')) {
    args.push('-crf', options.crf.toString());
  }

  if (options.preset && options.videoCodec?.includes('264')) {
    args.push('-preset', options.preset);
  }

  if (options.fps) {
    args.push('-r', options.fps.toString());
  }

  if (options.audioBitrate) {
    args.push('-b:a', options.audioBitrate);
  }

  if (options.audioSampleRate) {
    args.push('-ar', options.audioSampleRate.toString());
  }

  if (options.startTime) {
    args.push('-ss', options.startTime);
  }

  if (options.duration) {
    args.push('-t', options.duration);
  }

  if (options.customArgs && options.customArgs.length > 0) {
    args.push(...options.customArgs);
  }

  args.push('-progress', 'pipe:1');
  args.push(options.outputPath);

  return args;
}

export function parseProgress(line: string, totalDuration: number): { percent: number; currentTime: string } | null {
  const timeMatch = line.match(/out_time=(\d+:\d+:\d+\.\d+)/);
  if (!timeMatch) return null;

  const currentTime = timeMatch[1];
  const currentSeconds = timeToSeconds(currentTime);
  const percent = totalDuration > 0 ? Math.min(100, Math.round((currentSeconds / totalDuration) * 100)) : 0;

  return { percent, currentTime };
}

export function timeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length !== 3) return 0;
  const [hours, minutes, seconds] = parts;
  return parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
}

export function secondsToTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getDefaultOutputPath(inputPath: string, format: VideoFormat): string {
  const lastDot = inputPath.lastIndexOf('.');
  const baseName = lastDot > 0 ? inputPath.substring(0, lastDot) : inputPath;
  return `${baseName}_converted.${format}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
