import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, MOCK_APPS } from '../constants';
import { AIApp } from '../types';
import { api } from '../services/api';

interface SearchScreenProps {
  navigation: any;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<AIApp[]>([]);
  const [loading, setLoading] = useState(false);

  // 搜索应用
  useEffect(() => {
    const searchApps = async () => {
      if (!searchText.trim()) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await api.apps.search(searchText);
        if (response.success) {
          setSearchResults(response.apps);
        }
      } catch (error) {
        console.log('Search API Error:', error);
        // 使用本地搜索
        setSearchResults(
          MOCK_APPS.filter(app =>
            app.name.toLowerCase().includes(searchText.toLowerCase()) ||
            app.description.toLowerCase().includes(searchText.toLowerCase()) ||
            app.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
          )
        );
      }
      setLoading(false);
    };

    // 防抖搜索
    const timeoutId = setTimeout(searchApps, 300);
    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const renderAppItem = ({ item }: { item: AIApp }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => navigation.navigate('AppDetail', { app: item })}
    >
      <Text style={styles.appIcon}>{item.icon}</Text>
      <View style={styles.appInfo}>
        <Text style={styles.appName}>{item.name}</Text>
        <Text style={styles.appDesc} numberOfLines={1}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 搜索</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索应用名称、功能或标签..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoFocus
        />
      </View>

      {/* Results */}
      {searchText ? (
        <FlatList
          data={searchResults}
          renderItem={renderAppItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>未找到相关应用</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.hintContainer}>
          <Text style={styles.hintTitle}>热门搜索</Text>
          <View style={styles.hotTags}>
            {['AI 绘画', '写作助手', '代码工具', '语音合成'].map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.hotTag}
                onPress={() => setSearchText(tag)}
              >
                <Text style={styles.hotTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  listContent: {
    padding: 12,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  appIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  appInfo: {
    flex: 1,
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  hintContainer: {
    padding: 16,
  },
  hintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  hotTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hotTag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hotTagText: {
    fontSize: 14,
    color: COLORS.primary,
  },
});

export default SearchScreen;
