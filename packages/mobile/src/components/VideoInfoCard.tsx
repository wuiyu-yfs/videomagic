import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoInfo, formatFileSize, secondsToTime } from '@video-converter/shared';

interface VideoInfoCardProps {
  info: VideoInfo;
}

function VideoInfoCard({ info }: VideoInfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailIcon}>🎬</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{info.filename}</Text>
          <Text style={styles.meta}>
            {formatFileSize(info.size)} · {secondsToTime(info.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {info.videoStream && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>视频编码</Text>
              <Text style={styles.infoValue}>{info.videoStream.codec.toUpperCase()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>分辨率</Text>
              <Text style={styles.infoValue}>
                {info.videoStream.width} × {info.videoStream.height}
              </Text>
            </View>
          </>
        )}
        {info.audioStream && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>音频编码</Text>
              <Text style={styles.infoValue}>{info.audioStream.codec.toUpperCase()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>声道</Text>
              <Text style={styles.infoValue}>{info.audioStream.channels} 声道</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: 56,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbnailIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#909399',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#909399',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
});

export default VideoInfoCard;
