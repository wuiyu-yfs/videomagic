import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
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

interface ConversionSettingsProps {
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

interface PickerOption<T> {
  label: string;
  value: T;
}

function ConversionSettings({
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
}: ConversionSettingsProps) {
  const [activePicker, setActivePicker] = useState<string | null>(null);
  const [pickerOptions, setPickerOptions] = useState<PickerOption<any>[]>([]);
  const [pickerTitle, setPickerTitle] = useState('');
  const [currentValue, setCurrentValue] = useState<any>(null);

  const openPicker = <T,>(
    title: string,
    options: PickerOption<T>[],
    value: T,
    onSelect: (value: T) => void
  ) => {
    if (disabled) return;
    setPickerTitle(title);
    setPickerOptions(options);
    setCurrentValue(value);
    setActivePicker(title);
  };

  const selectOption = (value: any) => {
    if (activePicker === '输出格式') {
      onFormatChange(value);
    } else if (activePicker === '视频编码器') {
      onVideoCodecChange(value);
    } else if (activePicker === '音频编码器') {
      onAudioCodecChange(value);
    } else if (activePicker === '分辨率') {
      onResolutionChange(value);
    } else if (activePicker === '视频码率') {
      onBitrateChange(value);
    } else if (activePicker === '编码预设') {
      onPresetChange(value);
    }
    setActivePicker(null);
  };

  const formatOptions = SUPPORTED_FORMATS.map((f) => ({
    label: FORMAT_LABELS[f],
    value: f,
  }));

  const videoCodecOptions: PickerOption<VideoCodec>[] = [
    { label: 'H.264 (libx264)', value: 'libx264' },
    { label: 'H.265 (libx265)', value: 'libx265' },
    { label: 'VP9', value: 'vp9' },
    { label: '复制 (不重新编码)', value: 'copy' },
  ];

  const audioCodecOptions: PickerOption<AudioCodec>[] = [
    { label: 'AAC', value: 'aac' },
    { label: 'MP3', value: 'mp3' },
    { label: 'Opus', value: 'opus' },
    { label: 'Vorbis', value: 'vorbis' },
    { label: '复制 (不重新编码)', value: 'copy' },
  ];

  const resolutionOptions = COMMON_RESOLUTIONS.map((r, i) => ({
    label: r.label,
    value: i,
  }));

  const bitrateOptions = COMMON_BITRATES.map((b, i) => ({
    label: b.label,
    value: i,
  }));

  const presetOptions = Object.entries(PRESET_LABELS).map(([key, label]) => ({
    label,
    value: key as Preset,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>输出设置</Text>

      <TouchableOpacity
        style={[styles.settingItem, disabled && styles.disabled]}
        onPress={() => openPicker('输出格式', formatOptions, format, onFormatChange)}
      >
        <Text style={styles.settingLabel}>输出格式</Text>
        <Text style={styles.settingValue}>{FORMAT_LABELS[format]}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, disabled && styles.disabled]}
        onPress={() =>
          openPicker('视频编码器', videoCodecOptions, videoCodec, onVideoCodecChange)
        }
      >
        <Text style={styles.settingLabel}>视频编码器</Text>
        <Text style={styles.settingValue}>
          {videoCodecOptions.find((o) => o.value === videoCodec)?.label}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, disabled && styles.disabled]}
        onPress={() =>
          openPicker('音频编码器', audioCodecOptions, audioCodec, onAudioCodecChange)
        }
      >
        <Text style={styles.settingLabel}>音频编码器</Text>
        <Text style={styles.settingValue}>
          {audioCodecOptions.find((o) => o.value === audioCodec)?.label}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, disabled && styles.disabled]}
        onPress={() =>
          openPicker('分辨率', resolutionOptions, resolutionIndex, onResolutionChange)
        }
      >
        <Text style={styles.settingLabel}>分辨率</Text>
        <Text style={styles.settingValue}>{COMMON_RESOLUTIONS[resolutionIndex].label}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingItem, disabled && styles.disabled]}
        onPress={() => openPicker('视频码率', bitrateOptions, bitrateIndex, onBitrateChange)}
      >
        <Text style={styles.settingLabel}>视频码率</Text>
        <Text style={styles.settingValue}>{COMMON_BITRATES[bitrateIndex].label}</Text>
      </TouchableOpacity>

      {videoCodec === 'libx264' && (
        <>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>CRF 质量 ({crf})</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0</Text>
              <View style={styles.sliderTrack}>
                <View
                  style={[styles.sliderFill, { width: `${(crf / 51) * 100}%` }]}
                />
                <View
                  style={[styles.sliderThumb, { left: `${(crf / 51) * 100}%` }]}
                />
              </View>
              <Text style={styles.sliderLabel}>51</Text>
            </View>
            <View style={styles.crfButtons}>
              {[18, 23, 28, 35].map((v) => (
                <TouchableOpacity
                  key={v}
                  style={[styles.crfButton, crf === v && styles.crfButtonActive]}
                  onPress={() => !disabled && onCrfChange(v)}
                >
                  <Text
                    style={[
                      styles.crfButtonText,
                      crf === v && styles.crfButtonTextActive,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.settingItem, disabled && styles.disabled]}
            onPress={() => openPicker('编码预设', presetOptions, preset, onPresetChange)}
          >
            <Text style={styles.settingLabel}>编码预设</Text>
            <Text style={styles.settingValue}>{PRESET_LABELS[preset]}</Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>帧率 (0=保持原帧率)</Text>
        <View style={styles.fpsRow}>
          {[0, 24, 30, 60].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.fpsButton, fps === v && styles.fpsButtonActive]}
              onPress={() => !disabled && onFpsChange(v)}
            >
              <Text style={[styles.fpsButtonText, fps === v && styles.fpsButtonTextActive]}>
                {v === 0 ? '原始' : `${v}fps`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Modal
        visible={activePicker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActivePicker(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setActivePicker(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{pickerTitle}</Text>
            <ScrollView style={styles.modalList}>
              {pickerOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    currentValue === option.value && styles.modalOptionActive,
                  ]}
                  onPress={() => selectOption(option.value)}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      currentValue === option.value && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#909399',
    width: 20,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e8ecf1',
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#667eea',
    borderRadius: 8,
    marginLeft: -8,
  },
  crfButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  crfButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  crfButtonActive: {
    backgroundColor: '#667eea',
  },
  crfButtonText: {
    fontSize: 12,
    color: '#606266',
  },
  crfButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  fpsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  fpsButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
  },
  fpsButtonActive: {
    backgroundColor: '#667eea',
  },
  fpsButtonText: {
    fontSize: 12,
    color: '#606266',
  },
  fpsButtonTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8ecf1',
    color: '#2c3e50',
  },
  modalList: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  modalOptionActive: {
    backgroundColor: '#f0f4ff',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#333',
  },
  modalOptionTextActive: {
    color: '#667eea',
    fontWeight: '500',
  },
});

export default ConversionSettings;
