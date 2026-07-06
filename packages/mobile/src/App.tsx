import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, Text, View } from 'react-native';
import ConvertScreen from './screens/ConvertScreen';
import HistoryScreen from './screens/HistoryScreen';
import { ConversionHistoryItem } from '@video-converter/shared';

const Tab = createBottomTabNavigator();

function App() {
  const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

  const addHistoryItem = (item: ConversionHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const updateHistoryItem = (id: string, updates: Partial<ConversionHistoryItem>) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#667eea',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: styles.tabBar,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
          }}
        >
          <Tab.Screen
            name="Convert"
            options={{ title: '视频转换', tabBarLabel: '转换' }}
          >
            {(props) => (
              <ConvertScreen
                {...props}
                history={history}
                addHistoryItem={addHistoryItem}
                updateHistoryItem={updateHistoryItem}
              />
            )}
          </Tab.Screen>
          <Tab.Screen
            name="History"
            options={{ title: '转换历史', tabBarLabel: '历史' }}
          >
            {(props) => <HistoryScreen {...props} history={history} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  header: {
    backgroundColor: '#667eea',
  },
  headerTitle: {
    color: 'white',
    fontWeight: '600',
  },
});

export default App;
