import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi } from '../api/client';

export const HistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await userApi.getHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading Workout History...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.centerContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />
        }
      >
        <Ionicons name="barbell-outline" size={48} color="#475569" />
        <Text style={styles.emptyTitle}>No Completed Workouts Yet</Text>
        <Text style={styles.emptySub}>
          Log your first workout session to see your performance history and coach feedback!
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#06b6d4" />
      }
    >
      <View style={styles.titleRow}>
        <Text style={styles.screenHeading}>Workout Log Archive</Text>
        <Text style={styles.sessionCount}>{history.length} Sessions</Text>
      </View>

      {history.map((log) => {
        const totalSets = (log.exerciseLogs || []).reduce(
          (acc, ex) => acc + (ex.sets || []).length,
          0
        );

        return (
          <View key={log.id} style={styles.logCard}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.routineTitle}>{log.routineTitle || 'Workout Session'}</Text>
                <Text style={styles.dateText}>
                  {log.createdAt ? new Date(log.createdAt).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Recently'}
                </Text>
              </View>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={13} color="#06b6d4" />
                <Text style={styles.durationText}>{log.durationMinutes || 0} min</Text>
              </View>
            </View>

            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sets Done</Text>
                <Text style={styles.metricValue}>{totalSets}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>RPE Effort</Text>
                <Text style={styles.metricValue}>{log.rpeEffort || 'N/A'}/10</Text>
              </View>
            </View>

            {/* Friend Notes */}
            {log.friendNotes ? (
              <View style={styles.notesBox}>
                <Text style={styles.notesLabel}>Your Notes:</Text>
                <Text style={styles.notesText}>{log.friendNotes}</Text>
              </View>
            ) : null}

            {/* Coach Feedback Box */}
            {log.coachFeedback ? (
              <View style={styles.coachBox}>
                <View style={styles.coachHeader}>
                  <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                  <Text style={styles.coachTitle}>COACH FEEDBACK</Text>
                </View>
                <Text style={styles.coachText}>{log.coachFeedback}</Text>
              </View>
            ) : (
              <View style={styles.noCoachBox}>
                <Text style={styles.noCoachText}>Awaiting Coach Review</Text>
              </View>
            )}

            {/* Exercise Details Accordion Summary */}
            <View style={styles.exercisesList}>
              {(log.exerciseLogs || []).map((ex, exIdx) => (
                <View key={exIdx} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                  <View style={styles.setTags}>
                    {(ex.sets || []).map((s, sIdx) => (
                      <View key={sIdx} style={styles.setTag}>
                        <Text style={styles.setTagText}>
                          {s.actualWeightKg}kg × {s.actualReps}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenHeading: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  sessionCount: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routineTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateText: {
    color: '#64748b',
    fontSize: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  notesLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  notesText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  coachBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  coachTitle: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  coachText: {
    color: '#f8fafc',
    fontSize: 13,
    fontStyle: 'italic',
  },
  noCoachBox: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  noCoachText: {
    color: '#475569',
    fontSize: 11,
    fontStyle: 'italic',
  },
  exercisesList: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
    gap: 8,
  },
  exerciseItem: {
    gap: 4,
  },
  exerciseName: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  setTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setTag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  setTagText: {
    color: '#94a3b8',
    fontSize: 11,
  },
});
