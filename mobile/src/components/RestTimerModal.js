import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RestTimerModal = ({
  visible,
  initialSeconds = 60,
  onClose,
  onFinish,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setTotalSeconds(initialSeconds);
      setIsRunning(true);
      setIsMinimized(false);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    let interval = null;
    if (visible && isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [visible, isRunning, secondsLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    // Vibrate phone pattern: wait 0, buzz 500ms, pause 200ms, buzz 500ms
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 500, 200, 500]);
    }
    if (onFinish) onFinish();
  };

  const addSeconds = (secs) => {
    setSecondsLeft((prev) => prev + secs);
    setTotalSeconds((prev) => Math.max(prev, secondsLeft + secs));
  };

  const setPreset = (secs) => {
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsRunning(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!visible) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <View style={styles.minimizedContainer}>
        <TouchableOpacity
          style={styles.minimizedPill}
          onPress={() => setIsMinimized(false)}
          activeOpacity={0.8}
        >
          <Ionicons name="timer-outline" size={18} color="#06b6d4" />
          <Text style={styles.minimizedTime}>{formatTime(secondsLeft)}</Text>
          <TouchableOpacity
            onPress={() => setIsRunning(!isRunning)}
            style={styles.miniIconBtn}
          >
            <Ionicons
              name={isRunning ? 'pause' : 'play'}
              size={14}
              color="#f8fafc"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => addSeconds(15)}
            style={styles.miniPlusBtn}
          >
            <Text style={styles.miniPlusText}>+15s</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.miniIconBtn}>
            <Ionicons name="close" size={14} color="#94a3b8" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  }

  // Full Screen Modal Mode
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsMinimized(true)} style={styles.minimizeBtn}>
              <Ionicons name="contract-outline" size={20} color="#94a3b8" />
              <Text style={styles.minimizeBtnText}>Minimize</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text style={styles.timerTitle}>⏱️ REST TIMER</Text>

          <View style={styles.clockCircle}>
            <Text style={[styles.clockText, secondsLeft === 0 && styles.clockFinished]}>
              {formatTime(secondsLeft)}
            </Text>
            <Text style={styles.clockSubtext}>
              {secondsLeft === 0 ? 'READY TO LIFT!' : isRunning ? 'RECOVERING...' : 'PAUSED'}
            </Text>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {[30, 60, 90, 120].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[styles.presetBtn, totalSeconds === sec && styles.presetBtnActive]}
                onPress={() => setPreset(sec)}
              >
                <Text
                  style={[styles.presetText, totalSeconds === sec && styles.presetTextActive]}
                >
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Controls */}
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.addTimeBtn}
              onPress={() => addSeconds(15)}
            >
              <Text style={styles.addTimeText}>+15s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playPauseBtn, isRunning ? styles.pauseBtn : styles.playBtn]}
              onPress={() => setIsRunning(!isRunning)}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={24}
                color={isRunning ? '#f8fafc' : '#020617'}
              />
              <Text
                style={[
                  styles.playPauseText,
                  isRunning ? styles.pauseText : styles.playText,
                ]}
              >
                {isRunning ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                setSecondsLeft(0);
                handleComplete();
                onClose();
              }}
            >
              <Text style={styles.skipBtnText}>Skip</Text>
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
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  minimizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  minimizeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  timerTitle: {
    color: '#06b6d4',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  clockCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#06b6d4',
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  clockText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#f8fafc',
    fontVariant: ['tabular-nums'],
  },
  clockFinished: {
    color: '#10b981',
  },
  clockSubtext: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
    letterSpacing: 1,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetBtnActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
  },
  presetText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  addTimeBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  addTimeText: {
    color: '#06b6d4',
    fontWeight: '700',
    fontSize: 14,
  },
  playPauseBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  playBtn: {
    backgroundColor: '#06b6d4',
  },
  pauseBtn: {
    backgroundColor: '#334155',
  },
  playPauseText: {
    fontWeight: '800',
    fontSize: 15,
  },
  playText: {
    color: '#020617',
  },
  pauseText: {
    color: '#f8fafc',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  skipBtnText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 14,
  },
  minimizedContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 999,
  },
  minimizedPill: {
    backgroundColor: '#0f172a',
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  minimizedTime: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    flex: 1,
  },
  miniIconBtn: {
    padding: 6,
    backgroundColor: '#1e293b',
    borderRadius: 14,
  },
  miniPlusBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  miniPlusText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '700',
  },
});
