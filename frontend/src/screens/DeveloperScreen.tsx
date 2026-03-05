import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../constants';

const DeveloperScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const myApps = [
    { name: 'AI 绘图大师', downloads: 125000, status: '已发布' },
    { name: '智能写作助手', downloads: 89000, status: '已发布' },
  ];

  const menuItems = [
    { icon: '📱', title: '我的应用', count: 2 },
    { icon: '📊', title: '数据统计', badge: 'new' },
    { icon: '💬', title: '用户反馈', badge: '5' },
    { icon: '⭐', title: '评分管理', badge: '' },
    { icon: '📝', title: '发布新应用', badge: '' },
    { icon: '⚙️', title: '开发者设置', badge: '' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛠️ 开发者中心</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Developer Card */}
        <View style={styles.devCard}>
          <View style={styles.devIcon}>
            <Text style={styles.devIconText}>🚀</Text>
          </View>
          <View style={styles.devInfo}>
            <Text style={styles.devName}>AI Studio</Text>
            <Text style={styles.devStatus}>认证开发者</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>编辑</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>应用</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>21.4万</Text>
            <Text style={styles.statLabel}>总下载</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>4.7</Text>
            <Text style={styles.statLabel}>平均评分</Text>
          </View>
        </View>

        {/* My Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 我的应用</Text>
          {myApps.map((app, index) => (
            <View key={index} style={styles.appItem}>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <Text style={styles.appStats}>⬇️ {app.downloads} 次下载</Text>
              </View>
              <View style={styles.appStatus}>
                <Text style={styles.appStatusText}>{app.status}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.addAppBtn}>
            <Text style={styles.addAppBtnText}>+ 发布新应用</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.badge ? (
                <View style={[styles.menuBadge, item.badge === 'new' && styles.newBadge]}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              ) : (
                <Text style={styles.menuArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  devCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  devIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devIconText: {
    fontSize: 28,
  },
  devInfo: {
    flex: 1,
    marginLeft: 12,
  },
  devName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  devStatus: {
    fontSize: 13,
    color: COLORS.success,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    color: COLORS.primary,
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginBottom: 10,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  appStats: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appStatus: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  appStatusText: {
    color: '#fff',
    fontSize: 11,
  },
  addAppBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addAppBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    marginTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  menuBadge: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadge: {
    backgroundColor: COLORS.warning,
  },
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
});

export default DeveloperScreen;
