import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { UserDashboardScreen } from './src/screens/UserDashboardScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ChangePasswordModal } from './src/components/ChangePasswordModal';
import { ServerConfigModal } from './src/components/ServerConfigModal';

const MainNavigator = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login', 'register', 'forgot-password'
  const [currentTab, setCurrentTab] = useState('today'); // 'today' or 'history'
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingScreenText}>Loading PirateWorkout...</Text>
      </View>
    );
  }

  // Unauthenticated Views
  if (!user) {
    if (authView === 'register') {
      return <RegisterScreen onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPasswordScreen onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginScreen
        onSwitchToRegister={() => setAuthView('register')}
        onSwitchToForgotPassword={() => setAuthView('forgot-password')}
      />
    );
  }

  // Authenticated Views (Admin / Client)
  return (
    <SafeAreaView style={styles.appContainer}>
      <ExpoStatusBar style="light" backgroundColor="#090d16" />

      {/* Top Header Bar */}
      <View style={styles.topNavbar}>
        <View style={styles.brandRow}>
          <Text style={styles.brandSkull}>🏴‍☠️</Text>
          <View>
            <Text style={styles.navTitle}>PirateWorkout</Text>
            <Text style={styles.navUserRole}>
              {user.name} ({isAdmin ? 'Coach' : 'Client'})
            </Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={() => setShowServerConfig(true)}
          >
            <Ionicons name="server-outline" size={18} color="#06b6d4" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={() => setShowChangePassword(true)}
          >
            <Ionicons name="key-outline" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {isAdmin ? (
          <AdminDashboardScreen />
        ) : currentTab === 'history' ? (
          <HistoryScreen />
        ) : (
          <UserDashboardScreen onNavigateHistory={() => setCurrentTab('history')} />
        )}
      </View>

      {/* Bottom Navigation for Client */}
      {!isAdmin && (
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'today' && styles.tabItemActive]}
            onPress={() => setCurrentTab('today')}
          >
            <Ionicons
              name={currentTab === 'today' ? 'barbell' : 'barbell-outline'}
              size={22}
              color={currentTab === 'today' ? '#06b6d4' : '#64748b'}
            />
            <Text
              style={[styles.tabItemText, currentTab === 'today' && styles.tabItemTextActive]}
            >
              Today's Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentTab === 'history' && styles.tabItemActive]}
            onPress={() => setCurrentTab('history')}
          >
            <Ionicons
              name={currentTab === 'history' ? 'time' : 'time-outline'}
              size={22}
              color={currentTab === 'history' ? '#06b6d4' : '#64748b'}
            />
            <Text
              style={[styles.tabItemText, currentTab === 'history' && styles.tabItemTextActive]}
            >
              History & Logs
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <ChangePasswordModal
        visible={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <ServerConfigModal
        visible={showServerConfig}
        onClose={() => setShowServerConfig(false)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingScreenText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  topNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandSkull: {
    fontSize: 22,
  },
  navTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  navUserRole: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '600',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabItemActive: {},
  tabItemText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
});
