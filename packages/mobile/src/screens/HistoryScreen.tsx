import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { ConversionHistoryItem } from '@video-converter/shared';

interface HistoryScreenProps {
  navigation: any;
  route: any;
  history: ConversionHistoryItem[];
}

function HistoryScreen({ history }: HistoryScreenProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#67c23a';
      case 'failed':
        return '#f56c6c';
      case 'processing':
        return '#e6a23c';
      default:
        return '#909399';
    }
  };

  const renderItem = ({ item }: { item: ConversionHistoryItem }) => (
    <View style={styles.historyItem}>
      <Text style={styles.itemName}>{item.inputName}</Text>
      <Text style={[styles.itemStatus, { color: getStatusColor(item.status) }]}>
        {getStatusText(item.status)}
      </Text>
      {item.status === 'processing' && (
        <Text style={styles.itemProgress}>进度: {item.progress}%</Text>
      )}
      {item.error && <Text style={styles.itemError}>{item.error}</Text>}
    </View>
  );

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyText}>暂无转换历史</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={history}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 6,
  },
  itemStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemProgress: {
    fontSize: 12,
    color: '#909399',
    marginTop: 4,
  },
  itemError: {
    fontSize: 12,
    color: '#f56c6c',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#909399',
  },
});

export default HistoryScreen;
