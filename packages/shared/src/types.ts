export type VideoFormat = 'mp4' | 'avi' | 'mov' | 'mkv' | 'webm' | 'flv' | 'wmv' | 'm4v';

export type AudioCodec = 'aac' | 'mp3' | 'opus' | 'vorbis' | 'copy';

export type VideoCodec = 'libx264' | 'libx265' | 'vp9' | 'copy';

export type Preset = 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';

export interface VideoResolution {
  width: number;
  height: number;
}

export interface ConversionOptions {
  inputPath: string;
  outputPath: string;
  format: VideoFormat;
  videoCodec?: VideoCodec;
  audioCodec?: AudioCodec;
  resolution?: VideoResolution;
  bitrate?: string;
  crf?: number;
  preset?: Preset;
  fps?: number;
  audioBitrate?: string;
  audioSampleRate?: number;
  startTime?: string;
  duration?: string;
  customArgs?: string[];
}

export interface ConversionProgress {
  percent: number;
  currentTime: string;
  totalTime: string;
  speed: string;
  frame: number;
  fps: number;
  size: string;
}

export interface ConversionResult {
  success: boolean;
  outputPath: string;
  duration?: number;
  size?: number;
  error?: string;
}

export interface VideoInfo {
  path: string;
  filename: string;
  format: string;
  duration: number;
  size: number;
  videoStream?: {
    codec: string;
    width: number;
    height: number;
    fps: number;
    bitrate: string;
  };
  audioStream?: {
    codec: string;
    channels: number;
    sampleRate: number;
    bitrate: string;
  };
}

export interface ConversionHistoryItem {
  id: string;
  inputPath: string;
  outputPath: string;
  inputName: string;
  outputName: string;
  options: ConversionOptions;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}
