# 🎬 视频转换器 (Video Converter)

基于 FFmpeg 的跨平台视频转换工具，支持桌面端 (Windows/macOS/Linux) 和移动端 (iOS/Android)。

## 📦 项目结构

```
video-converter/
├── packages/
│   ├── shared/          # 共享核心模块
│   │   ├── src/
│   │   │   ├── types.ts     # 类型定义
│   │   │   ├── utils.ts     # 工具函数 & FFmpeg命令构建
│   │   │   └── index.ts     # 导出入口
│   │   └── package.json
│   │
│   ├── desktop/         # 桌面端 (Electron + React)
│   │   ├── electron/
│   │   │   ├── main.ts      # Electron 主进程
│   │   │   └── preload.ts   # 预加载脚本
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── App.tsx      # 主应用
│   │   │   └── styles.css   # 样式
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── mobile/          # 移动端 (React Native)
│       ├── src/
│       │   ├── screens/     # 页面
│       │   ├── components/  # 组件
│       │   └── App.tsx      # 主应用
│       ├── index.ts
│       └── package.json
│
├── package.json          # Monorepo 根配置
└── tsconfig.base.json    # TypeScript 基础配置
```

## ✨ 功能特性

### 核心功能
- 🎯 **多格式支持** - MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V
- 🎥 **视频编码** - H.264, H.265, VP9, 直接复制
- 🔊 **音频编码** - AAC, MP3, Opus, Vorbis, 直接复制
- 📐 **分辨率调整** - 4K, 2K, 1080p, 720p, 480p, 360p 及自定义
- 📊 **码率控制** - CRF 质量控制 / 固定码率
- ⚡ **编码预设** - 从超快到极慢的 9 档速度/质量权衡
- 🎞️ **帧率调整** - 24/30/60fps 及自定义
- ⏱️ **视频截取** - 指定开始时间和时长
- 📈 **实时进度** - 转换进度实时显示
- 📋 **历史记录** - 转换历史保存与查看

### 平台特性
**桌面端**
- 🖥️ Electron 跨平台支持
- 📁 文件选择对话框
- 💾 输出路径自定义
- 🎨 现代化 UI 界面

**移动端**
- 📱 iOS / Android 双平台
- 📂 文档选择器选择视频
- 💾 保存到应用沙盒目录
- 👆 触控友好的界面设计

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm >= 7 (支持 workspace)
- 桌面端：系统需安装 FFmpeg
- 移动端：
  - iOS: Xcode 14+
  - Android: Android Studio + Android SDK

### 安装依赖

```bash
# 在项目根目录
npm install
```

### 桌面端开发

```bash
# 启动开发模式
npm run dev:desktop
```

### 移动端开发

```bash
# 启动 Metro 打包服务
npm run dev:mobile

# 运行 Android
cd packages/mobile
npm run android

# 运行 iOS (需 macOS)
cd packages/mobile
npm run ios
```

### 构建发布

```bash
# 构建共享模块
npm run build:shared

# 构建桌面端
npm run build:desktop
```

## 📖 使用说明

### 桌面端
1. 点击上传区域选择视频文件
2. 在左侧面板设置输出参数（格式、编码、分辨率等）
3. 确认输出路径
4. 点击「开始转换」按钮
5. 等待转换完成，查看进度条

### 移动端
1. 点击「选择视频」从设备中选择视频
2. 调整转换参数
3. 点击「开始转换」
4. 转换完成后视频保存到应用目录

## 🔧 技术栈

| 分类 | 技术 |
|------|------|
| 核心 | FFmpeg / FFmpeg Kit |
| 共享 | TypeScript |
| 桌面端 | Electron + React + Vite |
| 移动端 | React Native + Navigation |
| 状态管理 | React Hooks |
| 构建工具 | Vite / Metro |

## 📚 共享模块 API

### 类型
```typescript
import { ConversionOptions, VideoFormat, VideoInfo } from '@video-converter/shared';
```

### 工具函数
```typescript
// 构建 FFmpeg 命令参数
buildFFmpegArgs(options: ConversionOptions): string[]

// 解析进度输出
parseProgress(line: string, totalDuration: number): { percent, currentTime }

// 时间转换
timeToSeconds(time: string): number
secondsToTime(seconds: number): string

// 文件大小格式化
formatFileSize(bytes: number): string

// 获取默认输出路径
getDefaultOutputPath(inputPath: string, format: VideoFormat): string
```

## ⚙️ FFmpeg 依赖

### 桌面端
需确保系统已安装 FFmpeg 并在 PATH 中：
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt install ffmpeg`
- **Windows**: 从 [ffmpeg.org](https://ffmpeg.org/download.html) 下载

### 移动端
通过 `ffmpeg-kit-react-native` 库自动集成，无需手动安装 FFmpeg。

## 🎨 界面预览

### 桌面端
- 顶部：标题栏 + 渐变背景
- 左侧：设置面板（Tab 切换 转换/历史）
- 右侧：文件选择 + 视频信息 + 进度条

### 移动端
- 底部 Tab 导航（转换/历史）
- 视频信息卡片
- 设置项列表 + 底部弹窗选择器
- 进度条 + 操作按钮

## 📝 开发说明

### 添加新的视频格式
1. 在 `packages/shared/src/types.ts` 的 `VideoFormat` 类型中添加
2. 在 `SUPPORTED_FORMATS` 数组和 `FORMAT_LABELS` 对象中添加对应项
3. 如需要特殊编码参数，在 `buildFFmpegArgs` 函数中处理

### 添加新的转换功能
1. 在 `ConversionOptions` 接口中添加新选项
2. 在 `buildFFmpegArgs` 中添加对应 FFmpeg 参数
3. 在桌面端和移动端的设置界面中添加对应控件

## 📄 License

MIT
