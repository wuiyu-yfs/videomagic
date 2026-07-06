import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  percent: number;
  currentTime: string;
  totalTime: string;
}

function ProgressBar({ percent, currentTime, totalTime }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
      <View style={styles.textRow}>
        <Text style={styles.text}>{percent}% 完成</Text>
        <Text style={styles.text}>
          {currentTime} / {totalTime}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: '#e8ecf1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 13,
    color: '#606266',
  },
});

export default ProgressBar;
