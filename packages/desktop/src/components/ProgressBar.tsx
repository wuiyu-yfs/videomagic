interface ProgressBarProps {
  percent: number;
  currentTime: string;
  totalTime: string;
}

function ProgressBar({ percent, currentTime, totalTime }: ProgressBarProps) {
  return (
    <div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-text">
        <span>{percent}% 完成</span>
        <span>
          {currentTime} / {totalTime}
        </span>
      </div>
    </div>
  );
}

export default ProgressBar;
