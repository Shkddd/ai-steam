import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS, CATEGORIES, MOCK_APPS } from '../constants';
import { AIApp, AppCategory } from '../types';
import { api, AIApp as APIAIApp } from '../services/api';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [apps, setApps] = useState<AIApp[]>(MOCK_APPS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 加载应用列表
  const loadApps = async (category?: string) => {
    try {
      const response = await api.apps.list(category);
      if (response.success && response.apps.length > 0) {
        setApps(response.apps);
      }
    } catch (error) {
      console.log('API Error, using mock data:', error);
      // API 失败时使用模拟数据
      setApps(category === 'all' || !category ? MOCK_APPS : MOCK_APPS.filter(app => app.category === category));
    }
  };

  useEffect(() => {
    loadApps(selectedCategory);
  }, [selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadApps(selectedCategory);
    setRefreshing(false);
  };

  const filteredApps = apps;

  const renderAppItem = ({ item }: { item: AIApp }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => navigation.navigate('AppDetail', { app: item })}
    >
      <View style={styles.appIcon}>
        <Text style={styles.appIconText}>{item.icon}</Text>
      </View>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDesc} numberOfLines={1}>{item.description}</Text>
        <View style={styles.appMeta}>
          <Text style={styles.appRating}>⭐ {item.rating}</Text>
          <Text style={styles.appDownloads}>⬇️ {formatDownloads(item.downloads)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatDownloads = (num: number): string => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Steam</Text>
        <Text style={styles.headerSubtitle}>发现 AI 应用</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryItem,
              selectedCategory === cat.id && styles.categoryItemActive,
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* App List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredApps}
          renderItem={renderAppItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无应用</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  categoryScroll: {
    backgroundColor: COLORS.surface,
    maxHeight: 60,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: COLORS.background,
  },
  categoryItemActive: {
    backgroundColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 12,
  },
  appItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 28,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  appDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appMeta: {
    flexDirection: 'row',
    marginTop: 6,
  },
  appRating: {
    fontSize: 12,
    color: COLORS.star,
    marginRight: 12,
  },
  appDownloads: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});

export default HomeScreen;
