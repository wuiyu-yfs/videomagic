import {
  VideoFormat,
  VideoCodec,
  AudioCodec,
  Preset,
  SUPPORTED_FORMATS,
  FORMAT_LABELS,
  PRESET_LABELS,
  COMMON_RESOLUTIONS,
  COMMON_BITRATES,
} from '@video-converter/shared';

interface ConversionPanelProps {
  format: VideoFormat;
  videoCodec: VideoCodec;
  audioCodec: AudioCodec;
  resolutionIndex: number;
  bitrateIndex: number;
  crf: number;
  preset: Preset;
  fps: number;
  onFormatChange: (format: VideoFormat) => void;
  onVideoCodecChange: (codec: VideoCodec) => void;
  onAudioCodecChange: (codec: AudioCodec) => void;
  onResolutionChange: (index: number) => void;
  onBitrateChange: (index: number) => void;
  onCrfChange: (crf: number) => void;
  onPresetChange: (preset: Preset) => void;
  onFpsChange: (fps: number) => void;
  disabled: boolean;
}

function ConversionPanel({
  format,
  videoCodec,
  audioCodec,
  resolutionIndex,
  bitrateIndex,
  crf,
  preset,
  fps,
  onFormatChange,
  onVideoCodecChange,
  onAudioCodecChange,
  onResolutionChange,
  onBitrateChange,
  onCrfChange,
  onPresetChange,
  onFpsChange,
  disabled,
}: ConversionPanelProps) {
  return (
    <div>
      <h3 className="section-title">输出设置</h3>

      <div className="form-group">
        <label className="form-label">输出格式</label>
        <select
          className="form-select"
          value={format}
          onChange={(e) => onFormatChange(e.target.value as VideoFormat)}
          disabled={disabled}
        >
          {SUPPORTED_FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">视频编码器</label>
        <select
          className="form-select"
          value={videoCodec}
          onChange={(e) => onVideoCodecChange(e.target.value as VideoCodec)}
          disabled={disabled}
        >
          <option value="libx264">H.264 (libx264)</option>
          <option value="libx265">H.265 (libx265)</option>
          <option value="vp9">VP9</option>
          <option value="copy">复制 (不重新编码)</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">音频编码器</label>
        <select
          className="form-select"
          value={audioCodec}
          onChange={(e) => onAudioCodecChange(e.target.value as AudioCodec)}
          disabled={disabled}
        >
          <option value="aac">AAC</option>
          <option value="mp3">MP3</option>
          <option value="opus">Opus</option>
          <option value="vorbis">Vorbis</option>
          <option value="copy">复制 (不重新编码)</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">分辨率</label>
        <select
          className="form-select"
          value={resolutionIndex}
          onChange={(e) => onResolutionChange(parseInt(e.target.value, 10))}
          disabled={disabled}
        >
          {COMMON_RESOLUTIONS.map((r, i) => (
            <option key={i} value={i}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">视频码率</label>
        <select
          className="form-select"
          value={bitrateIndex}
          onChange={(e) => onBitrateChange(parseInt(e.target.value, 10))}
          disabled={disabled}
        >
          {COMMON_BITRATES.map((b, i) => (
            <option key={i} value={i}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {videoCodec === 'libx264' && (
        <>
          <div className="form-group">
            <label className="form-label">CRF 质量 (0-51)</label>
            <div className="slider-container">
              <input
                type="range"
                className="slider"
                min="0"
                max="51"
                value={crf}
                onChange={(e) => onCrfChange(parseInt(e.target.value, 10))}
                disabled={disabled}
              />
              <span className="slider-value">{crf}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">编码预设</label>
            <select
              className="form-select"
              value={preset}
              onChange={(e) => onPresetChange(e.target.value as Preset)}
              disabled={disabled}
            >
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-group">
        <label className="form-label">帧率 (0 表示保持原帧率)</label>
        <input
          type="number"
          className="form-input"
          min="0"
          max="120"
          value={fps || ''}
          placeholder="保持原帧率"
          onChange={(e) => onFpsChange(parseInt(e.target.value, 10) || 0)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export default ConversionPanel;
