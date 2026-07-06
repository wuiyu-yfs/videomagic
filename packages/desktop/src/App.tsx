import { useState, useEffect } from 'react';
import {
  VideoInfo,
  VideoFormat,
  VideoCodec,
  AudioCodec,
  Preset,
  ConversionHistoryItem,
  SUPPORTED_FORMATS,
  FORMAT_LABELS,
  PRESET_LABELS,
  COMMON_RESOLUTIONS,
  COMMON_BITRATES,
  getDefaultOutputPath,
  formatFileSize,
  secondsToTime,
  generateId,
  ConversionOptions,
} from '@video-converter/shared';
import FileSelector from './components/FileSelector';
import VideoInfoCard from './components/VideoInfoCard';
import ConversionPanel from './components/ConversionPanel';
import ProgressBar from './components/ProgressBar';
import HistoryList from './components/HistoryList';

function App() {
  const [activeTab, setActiveTab] = useState<'convert' | 'history'>('convert');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [outputPath, setOutputPath] = useState<string>('');
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
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  useEffect(() => {
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onProgress((p) => {
        setProgress(p.percent);
        setCurrentTime(p.currentTime);
      });
      return cleanup;
    }
  }, []);

  const handleFileSelected = async (filePath: string) => {
    if (!window.electronAPI) return;
    const info = await window.electronAPI.getVideoInfo(filePath);
    if (info) {
      setVideoInfo(info);
      setOutputPath(getDefaultOutputPath(filePath, format));
    }
  };

  const handleFormatChange = (newFormat: VideoFormat) => {
    setFormat(newFormat);
    if (videoInfo) {
      setOutputPath(getDefaultOutputPath(videoInfo.path, newFormat));
    }
  };

  const handleSelectOutputPath = async () => {
    if (!window.electronAPI || !videoInfo) return;
    const defaultName = outputPath || getDefaultOutputPath(videoInfo.path, format);
    const path = await window.electronAPI.selectOutputPath(defaultName);
    if (path) {
      setOutputPath(path);
    }
  };

  const startConversion = async () => {
    if (!window.electronAPI || !videoInfo || !outputPath) return;

    const resolution =
      resolutionIndex > 0
        ? {
            width: COMMON_RESOLUTIONS[resolutionIndex].width,
            height: COMMON_RESOLUTIONS[resolutionIndex].height,
          }
        : undefined;

    const options: ConversionOptions = {
      inputPath: videoInfo.path,
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

    const historyItem: ConversionHistoryItem = {
      id: generateId(),
      inputPath: videoInfo.path,
      outputPath,
      inputName: videoInfo.filename,
      outputName: outputPath.split('/').pop() || '',
      options,
      status: 'processing',
      progress: 0,
      createdAt: Date.now(),
    };

    setHistory((prev) => [historyItem, ...prev]);
    setIsConverting(true);
    setProgress(0);
    setCurrentTime('');

    const result = await window.electronAPI.convertVideo(options);

    setIsConverting(false);
    setHistory((prev) =>
      prev.map((item) =>
        item.id === historyItem.id
          ? {
              ...item,
              status: result.success ? 'completed' : 'failed',
              progress: result.success ? 100 : item.progress,
              completedAt: Date.now(),
              error: result.error,
            }
          : item
      )
    );
  };

  const cancelConversion = async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.cancelConversion();
    setIsConverting(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎬 视频转换器</h1>
        <p>基于 FFmpeg 的跨平台视频转换工具</p>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="tabs">
            <div
              className={`tab ${activeTab === 'convert' ? 'active' : ''}`}
              onClick={() => setActiveTab('convert')}
            >
              转换
            </div>
            <div
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              历史
            </div>
          </div>

          {activeTab === 'convert' && (
            <ConversionPanel
              format={format}
              videoCodec={videoCodec}
              audioCodec={audioCodec}
              resolutionIndex={resolutionIndex}
              bitrateIndex={bitrateIndex}
              crf={crf}
              preset={preset}
              fps={fps}
              onFormatChange={handleFormatChange}
              onVideoCodecChange={setVideoCodec}
              onAudioCodecChange={setAudioCodec}
              onResolutionChange={setResolutionIndex}
              onBitrateChange={setBitrateIndex}
              onCrfChange={setCrf}
              onPresetChange={setPreset}
              onFpsChange={setFps}
              disabled={isConverting}
            />
          )}
        </aside>

        <main className="content">
          {activeTab === 'convert' && (
            <>
              {!videoInfo ? (
                <FileSelector onFileSelected={handleFileSelected} />
              ) : (
                <>
                  <VideoInfoCard info={videoInfo} />

                  <div className="form-group">
                    <label className="form-label">输出路径</label>
                    <div className="output-path">
                      <input
                        type="text"
                        className="form-input"
                        value={outputPath}
                        onChange={(e) => setOutputPath(e.target.value)}
                        disabled={isConverting}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={handleSelectOutputPath}
                        disabled={isConverting}
                      >
                        浏览
                      </button>
                    </div>
                  </div>

                  {isConverting && (
                    <div className="progress-section">
                      <ProgressBar
                        percent={progress}
                        currentTime={currentTime}
                        totalTime={secondsToTime(videoInfo.duration)}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    {!isConverting ? (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={startConversion}
                          disabled={!videoInfo || !outputPath}
                        >
                          开始转换
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setVideoInfo(null);
                            setOutputPath('');
                          }}
                        >
                          重新选择
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-secondary" onClick={cancelConversion}>
                        取消转换
                      </button>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'history' && <HistoryList items={history} />}
        </main>
      </div>
    </div>
  );
}

export default App;
