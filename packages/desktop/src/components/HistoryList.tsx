import { ConversionHistoryItem, formatFileSize } from '@video-converter/shared';

interface HistoryListProps {
  items: ConversionHistoryItem[];
}

function HistoryList({ items }: HistoryListProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ 已完成';
      case 'failed':
        return '✕ 失败';
      case 'processing':
        return '⏳ 转换中';
      case 'pending':
        return '⏸ 等待中';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'processing':
        return 'status-processing';
      default:
        return '';
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <div>暂无转换历史</div>
      </div>
    );
  }

  return (
    <div className="history-list">
      {items.map((item) => (
        <div key={item.id} className="history-item">
          <div className="history-item-name">{item.inputName}</div>
          <div className={`history-item-status ${getStatusClass(item.status)}`}>
            {getStatusText(item.status)}
          </div>
          {item.error && <div style={{ fontSize: '12px', color: '#f56c6c', marginTop: '4px' }}>{item.error}</div>}
        </div>
      ))}
    </div>
  );
}

export default HistoryList;
