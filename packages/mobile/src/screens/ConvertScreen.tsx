import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import {
  VideoInfo,
  VideoFormat,
  VideoCodec,
  AudioCodec,
  Preset,
  ConversionOptions,
  ConversionHistoryItem,
  SUPPORTED_FORMATS,
  FORMAT_LABELS,
  PRESET_LABELS,
  COMMON_RESOLUTIONS,
  COMMON_BITRATES,
  generateId,
  formatFileSize,
  secondsToTime,
  buildFFmpegArgs,
  timeToSeconds,
} from '@video-converter/shared';
import VideoInfoCard from '../components/VideoInfoCard';
import ConversionSettings from '../components/ConversionSettings';
import ProgressBar from '../components/ProgressBar';

interface ConvertScreenProps {
  navigation: any;
  route: any;
  history: ConversionHistoryItem[];
  addHistoryItem: (item: ConversionHistoryItem) => void;
  updateHistoryItem: (id: string, updates: Partial<ConversionHistoryItem>) => void;
}

function ConvertScreen({ addHistoryItem, updateHistoryItem }: ConvertScreenProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [videoUri, setVideoUri] = useState<string>('');
  const [format, setFormat] = useState<VideoFormat>('mp4');
  const [videoCodec, setVideoCodec] = useState<VideoCodec>('libx264');
  const [audioCodec, setAudioCodec] = useState<AudioCodec>('aac');
  const [resolutionIndex, setResolutionIndex] = useState(0);
  const [bitrateIndex, setBitrateIndex] = useState(0);
  const [crf, setCrf] = useState(23);
  const [preset, setPreset] = useState<Preset>('medium');
  const [fps, setFps] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);

  const pickVideo = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.video],
      });

      if (result && result[0]) {
        const file = result[0];
        const uri = file.uri;
        const fileSize = file.size || 0;

        setVideoUri(uri);

        const duration = await getVideoDuration(uri);

        const info: VideoInfo = {
          path: uri,
          filename: file.name || 'video',
          format: (file.name || '').split('.').pop() || '',
          duration: duration,
          size: fileSize,
        };

        setVideoInfo(info);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('错误', '选择视频文件失败');
      }
    }
  }, []);

  const getVideoDuration = async (uri: string): Promise<number> => {
    return new Promise((resolve) => {
      FFmpegKit.execute(`-i ${uri} 2>&1 | grep Duration`).then(async (session) => {
        const output = await session.getOutput();
        const match = output?.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const seconds = parseFloat(match[3]);
          resolve(hours * 3600 + minutes * 60 + seconds);
        } else {
          resolve(0);
        }
      });
    });
  };

  const getOutputPath = (): string => {
    const timestamp = Date.now();
    const fileName = `converted_${timestamp}.${format}`;
    if (Platform.OS === 'ios') {
      return `${RNFS.DocumentDirectoryPath}/${fileName}`;
    } else {
      return `${RNFS.ExternalDirectoryPath}/${fileName}`;
    }
  };

  const startConversion = async () => {
    if (!videoUri || !videoInfo) return;

    const outputPath = getOutputPath();
    const resolution =
      resolutionIndex > 0
        ? {
            width: COMMON_RESOLUTIONS[resolutionIndex].width,
            height: COMMON_RESOLUTIONS[resolutionIndex].height,
          }
        : undefined;

    const options: ConversionOptions = {
      inputPath: videoUri,
      outputPath,
      format,
      videoCodec,
      audioCodec,
      resolution,
      bitrate: COMMON_BITRATES[bitrateIndex].value || undefined,
      crf: videoCodec === 'libx264' ? crf : undefined,
      preset: videoCodec === 'libx264' ? preset : undefined,
      fps: fps > 0 ? fps : undefined,
    };

    const args = buildFFmpegArgs(options);
    const command = args.filter((arg) => arg !== '-progress' && arg !== 'pipe:1').join(' ');

    const historyItem: ConversionHistoryItem = {
      id: generateId(),
      inputPath: videoUri,
      outputPath,
      inputName: videoInfo.filename,
      outputName: outputPath.split('/').pop() || '',
      options,
      status: 'processing',
      progress: 0,
      createdAt: Date.now(),
    };

    addHistoryItem(historyItem);
    setIsConverting(true);
    setProgress(0);
    setCurrentTime('');

    try {
      const session = await FFmpegKit.executeAsync(
        command,
        async (session) => {
          const returnCode = await session.getReturnCode();
          setIsConverting(false);

          if (ReturnCode.isSuccess(returnCode)) {
            updateHistoryItem(historyItem.id, {
              status: 'completed',
              progress: 100,
              completedAt: Date.now(),
            });
            Alert.alert('成功', `视频转换完成！\n输出路径: ${outputPath}`);
          } else {
            const output = await session.getOutput();
            updateHistoryItem(historyItem.id, {
              status: 'failed',
              completedAt: Date.now(),
              error: '转换失败',
            });
            Alert.alert('错误', '视频转换失败');
          }
        },
        (statistics) => {
          if (videoInfo.duration > 0) {
            const currentSeconds = statistics.getTime() / 1000;
            const percent = Math.min(100, Math.round((currentSeconds / videoInfo.duration) * 100));
            setProgress(percent);
            setCurrentTime(secondsToTime(currentSeconds));
            updateHistoryItem(historyItem.id, { progress: percent });
          }
        }
      );

      const sessionId = await session.getSessionId();
      setCurrentSessionId(sessionId);
    } catch (error) {
      setIsConverting(false);
      updateHistoryItem(historyItem.id, {
        status: 'failed',
        completedAt: Date.now(),
        error: String(error),
      });
      Alert.alert('错误', '启动转换失败');
    }
  };

  const cancelConversion = async () => {
    if (currentSessionId !== null) {
      await FFmpegKit.cancel(currentSessionId);
      setCurrentSessionId(null);
    }
    setIsConverting(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {!videoInfo ? (
        <TouchableOpacity style={styles.uploadArea} onPress={pickVideo}>
          <Text style={styles.uploadIcon}>🎬</Text>
          <Text style={styles.uploadText}>点击选择视频文件</Text>
          <Text style={styles.uploadHint}>支持 MP4, AVI, MOV, MKV 等格式</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flex: 1 }}>
          <VideoInfoCard info={videoInfo} />

          <ConversionSettings
            format={format}
            videoCodec={videoCodec}
            audioCodec={audioCodec}
            resolutionIndex={resolutionIndex}
            bitrateIndex={bitrateIndex}
            crf={crf}
            preset={preset}
            fps={fps}
            onFormatChange={setFormat}
            onVideoCodecChange={setVideoCodec}
            onAudioCodecChange={setAudioCodec}
            onResolutionChange={setResolutionIndex}
            onBitrateChange={setBitrateIndex}
            onCrfChange={setCrf}
            onPresetChange={setPreset}
            onFpsChange={setFps}
            disabled={isConverting}
          />

          {isConverting && (
            <View style={styles.progressSection}>
              <ProgressBar
                percent={progress}
                currentTime={currentTime}
                totalTime={secondsToTime(videoInfo.duration)}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            {!isConverting ? (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={startConversion}>
                  <Text style={styles.primaryButtonText}>开始转换</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setVideoInfo(null);
                    setVideoUri('');
                  }}
                >
                  <Text style={styles.secondaryButtonText}>重新选择</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.secondaryButton} onPress={cancelConversion}>
                <Text style={styles.secondaryButtonText}>取消转换</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#c0c4cc',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    marginTop: 40,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    color: '#606266',
    marginBottom: 8,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 13,
    color: '#909399',
  },
  progressSection: {
    marginTop: 24,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f2f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#606266',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ConvertScreen;
