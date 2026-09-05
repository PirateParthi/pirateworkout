import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getServerUrl, setServerUrl, DEFAULT_API_BASE_URL } from '../api/client';
import axios from 'axios';

export const ServerConfigModal = ({ visible, onClose }) => {
  const [url, setUrl] = useState(DEFAULT_API_BASE_URL);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (visible) {
      getServerUrl().then((u) => setUrl(u));
      setTestResult(null);
    }
  }, [visible]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const cleanUrl = url.trim().replace(/\/+$/, '');
      const fullUrl = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
      // Check exercise library or auth endpoint
      const res = await axios.get(`${fullUrl}/exercises`, { timeout: 4000 });
      setTestResult({ success: true, message: 'Connected successfully to Spring Boot!' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Could not reach server. Check IP and Wi-Fi.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      const saved = await setServerUrl(url);
      Alert.alert('Saved', `Server URL set to:\n${saved}`);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to save server URL');
    }
  };

  const handleReset = () => {
    setUrl(DEFAULT_API_BASE_URL);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="server" size={20} color="#06b6d4" />
              <Text style={styles.title}>Backend Server IP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Your phone needs your laptop's Wi-Fi IP to communicate with Spring Boot backend:
          </Text>

          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="http://192.168.x.x:8080/api"
            placeholderTextColor="#475569"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.success ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Ionicons
                name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                size={16}
                color={testResult.success ? '#10b981' : '#ef4444'}
              />
              <Text
                style={[
                  styles.resultText,
                  testResult.success ? styles.textSuccess : styles.textError,
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <ActivityIndicator size="small" color="#06b6d4" />
              ) : (
                <Text style={styles.testBtnText}>Test Ping</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Reset Default</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save & Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981',
    borderWidth: 1,
  },
  resultError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  resultText: {
    fontSize: 12,
    flex: 1,
  },
  textSuccess: {
    color: '#10b981',
  },
  textError: {
    color: '#ef4444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  testBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06b6d4',
    justifyContent: 'center',
  },
  testBtnText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  saveBtn: {
    backgroundColor: '#06b6d4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '700',
  },
});
