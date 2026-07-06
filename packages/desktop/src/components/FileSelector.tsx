interface FileSelectorProps {
  onFileSelected: (filePath: string) => void;
}

function FileSelector({ onFileSelected }: FileSelectorProps) {
  const handleClick = async () => {
    if (window.electronAPI) {
      const filePath = await window.electronAPI.selectFile();
      if (filePath) {
        onFileSelected(filePath);
      }
    }
  };

  return (
    <div className="upload-area" onClick={handleClick}>
      <div className="upload-icon">📁</div>
      <div className="upload-text">点击选择视频文件</div>
      <div className="upload-hint">支持 MP4, AVI, MOV, MKV, WebM 等格式</div>
    </div>
  );
}

export default FileSelector;
