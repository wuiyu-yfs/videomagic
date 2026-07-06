import { VideoInfo, formatFileSize, secondsToTime } from '@video-converter/shared';

interface VideoInfoCardProps {
  info: VideoInfo;
}

function VideoInfoCard({ info }: VideoInfoCardProps) {
  return (
    <div className="video-info-card">
      <div className="video-info-header">
        <div className="video-thumbnail">🎬</div>
        <div>
          <div className="video-name">{info.filename}</div>
          <div className="video-meta">
            {formatFileSize(info.size)} · {secondsToTime(info.duration)}
          </div>
        </div>
      </div>

      <div className="video-info-grid">
        {info.videoStream && (
          <>
            <div className="info-item">
              <span className="info-label">视频编码</span>
              <span className="info-value">{info.videoStream.codec.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">分辨率</span>
              <span className="info-value">
                {info.videoStream.width} × {info.videoStream.height}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">帧率</span>
              <span className="info-value">{info.videoStream.fps.toFixed(1)} fps</span>
            </div>
            <div className="info-item">
              <span className="info-label">视频码率</span>
              <span className="info-value">
                {info.videoStream.bitrate
                  ? formatFileSize(parseInt(info.videoStream.bitrate, 10)) + '/s'
                  : '-'}
              </span>
            </div>
          </>
        )}

        {info.audioStream && (
          <>
            <div className="info-item">
              <span className="info-label">音频编码</span>
              <span className="info-value">{info.audioStream.codec.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">声道</span>
              <span className="info-value">{info.audioStream.channels} 声道</span>
            </div>
            <div className="info-item">
              <span className="info-label">采样率</span>
              <span className="info-value">{info.audioStream.sampleRate} Hz</span>
            </div>
            <div className="info-item">
              <span className="info-label">音频码率</span>
              <span className="info-value">
                {info.audioStream.bitrate
                  ? formatFileSize(parseInt(info.audioStream.bitrate, 10)) + '/s'
                  : '-'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VideoInfoCard;
