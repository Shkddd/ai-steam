import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../constants';
import { api, TokenStorage } from '../services/api';

interface User } from '../services {
  id: string;
  username: string;
  email: string;
}

const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);

  // 加载用户信息
  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const savedToken = await TokenStorage.get();
      if (savedToken) {
        setToken(savedToken);
        const response = await api.auth.me(savedToken);
        if (response.success) {
          setUser(response.user);
          
          // 获取收藏和下载数量
          const favs = await api.user.favorites(savedToken);
          if (favs.success) {
            setFavoritesCount(favs.favorites.length);
          }
          
          const downloads = await api.user.downloads(savedToken);
          if (downloads.success) {
            setDownloadsCount(downloads.downloads.length);
          }
        }
      }
    } catch (error) {
      console.log('Load user info error:', error);
    }
  };

  const handleLogin = () => {
    // TODO: 跳转到登录页面
    Alert.alert('提示', '登录功能开发中');
  };

  const handleLogout = async () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: async () => {
            await TokenStorage.remove();
            setUser(null);
            setToken(null);
            setFavoritesCount(0);
            setDownloadsCount(0);
          }
        },
      ]
    );
  };

  const menuItems = [
    { icon: '⬇️', title: '我的下载', badge: String(downloadsCount), action: () => {} },
    { icon: '❤️', title: '我的收藏', badge: String(favoritesCount), action: () => {} },
    { icon: '⭐', title: '评分记录', badge: '0', action: () => {} },
    { icon: '💬', title: '我的评论', badge: '0', action: () => {} },
    { icon: '👤', title: '账户设置', badge: '', action: () => {} },
    { icon: '🔔', title: '通知设置', badge: '', action: () => {} },
    { icon: '❓', title: '帮助与反馈', badge: '', action: () => {} },
    { icon: 'ℹ️', title: '关于', badge: '', action: () => {} },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 我的</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Card */}
        {user ? (
          <TouchableOpacity style={styles.userCard} onPress={handleLogout}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <Text style={styles.logoutText}>退出</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.userCard} onPress={handleLogin}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>?</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>点击登录</Text>
              <Text style={styles.userEmail}>登录后同步收藏和下载</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{downloadsCount}</Text>
            <Text style={styles.statLabel}>下载</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>收藏</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>评分</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.badge ? (
                <View style={styles.menuBadge}>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#fff',
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
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
  menuBadgeText: {
    color: '#fff',
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.error,
  },
});

export default ProfileScreen;
