import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../constants';
import { AIApp } from '../types';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  AppDetail: { app: any };
};

type Props = NativeStackScreenProps<RootStackParamList, 'AppDetail'>;

const AppDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { app } = route.params;

  const formatDownloads = (num: number): string => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Info */}
        <View style={styles.appHeader}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>{app.icon}</Text>
          </View>
          <View style={styles.appBasicInfo}>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appDeveloper}>{app.developer}</Text>
            <Text style={styles.appVersion}>v{app.version}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⭐ {app.rating}</Text>
            <Text style={styles.statLabel}>评分</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⬇️ {formatDownloads(app.downloads)}</Text>
            <Text style={styles.statLabel}>下载</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>💬 {app.reviews}</Text>
            <Text style={styles.statLabel}>评论</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          {app.isFree ? (
            <Text style={styles.freeText}>免费</Text>
          ) : (
            <Text style={styles.priceText}>¥{app.price}</Text>
          )}
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={styles.downloadBtnText}>
              {app.isFree ? '立即下载' : '购买'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用介绍</Text>
          <Text style={styles.description}>{app.description}</Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要功能</Text>
          <View style={styles.features}>
            {app.features.map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureBullet}>✓</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>标签</Text>
          <View style={styles.tags}>
            {app.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  appHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 40,
  },
  appBasicInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appDeveloper: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
  appVersion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginTop: 1,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    marginTop: 1,
    padding: 16,
  },
  freeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  featureBullet: {
    color: COLORS.success,
    marginRight: 8,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default AppDetailScreen;
