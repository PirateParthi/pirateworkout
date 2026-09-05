import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimerModal } from '../components/RestTimerModal';

export const UserDashboardScreen = ({ onNavigateHistory }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayRoutine, setTodayRoutine] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [routineExercises, setRoutineExercises] = useState([]);
  const [setsData, setSetsData] = useState({}); // { [exerciseIndex]: [{ setNumber, actualReps, actualWeightKg, completed }] }

  // Rest Timer State
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  // Workout Session Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionActive, setSessionActive] = useState(true);

  // Workout Completion form
  const [rpeEffort, setRpeEffort] = useState(7);
  const [friendNotes, setFriendNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTodayWorkout();
  }, []);

  useEffect(() => {
    let timer = null;
    if (sessionActive && !todayStatus?.completedToday) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionActive, todayStatus]);

  const loadTodayWorkout = async () => {
    setLoading(true);
    try {
      const [workoutRes, statusRes] = await Promise.allSettled([
        userApi.getTodayWorkout(),
        userApi.getTodayStatus(),
      ]);

      if (workoutRes.status === 'fulfilled' && workoutRes.value.data) {
        const routine = workoutRes.value.data;
        setTodayRoutine(routine);
        const exercises = routine.exercises || [];
        setRoutineExercises(exercises);

        // Initialize sets data structure
        const initialSets = {};
        exercises.forEach((ex, exIdx) => {
          const numSets = ex.targetSets || 3;
          initialSets[exIdx] = Array.from({ length: numSets }, (_, sIdx) => ({
            setNumber: sIdx + 1,
            targetReps: ex.targetReps || 10,
            targetWeightKg: ex.targetWeightKg || 0,
            actualReps: ex.targetReps || 10,
            actualWeightKg: ex.targetWeightKg || 0,
            completed: false,
          }));
        });
        setSetsData(initialSets);
      }

      if (statusRes.status === 'fulfilled' && statusRes.value.data) {
        setTodayStatus(statusRes.value.data);
      }
    } catch (err) {
      console.error('Error loading today workout:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    setSetsData((prev) => {
      const updated = { ...prev };
      const currentList = [...(updated[exerciseIndex] || [])];
      currentList[setIndex] = {
        ...currentList[setIndex],
        [field]: value,
      };
      updated[exerciseIndex] = currentList;
      return updated;
    });
  };

  const handleToggleComplete = (exerciseIndex, setIndex, restSeconds) => {
    setSetsData((prev) => {
      const updated = { ...prev };
      const currentList = [...(updated[exerciseIndex] || [])];
      const currentlyDone = currentList[setIndex]?.completed;
      currentList[setIndex] = {
        ...currentList[setIndex],
        completed: !currentlyDone,
      };
      updated[exerciseIndex] = currentList;

      // If ticking as completed, trigger Rest Timer!
      if (!currentlyDone) {
        setRestDuration(restSeconds || 60);
        setRestTimerVisible(true);
      }

      return updated;
    });
  };

  const calculateTotalVolume = () => {
    let total = 0;
    Object.values(setsData).forEach((setsList) => {
      setsList.forEach((s) => {
        if (s.completed) {
          const w = parseFloat(s.actualWeightKg) || 0;
          const r = parseInt(s.actualReps, 10) || 0;
          total += w * r;
        }
      });
    });
    return Math.round(total);
  };

  const calculateCompletedSetsCount = () => {
    let count = 0;
    Object.values(setsData).forEach((setsList) => {
      count += setsList.filter((s) => s.completed).length;
    });
    return count;
  };

  const handleSubmitWorkout = async () => {
    const totalSets = Object.values(setsData).reduce((acc, l) => acc + l.length, 0);
    const completedCount = calculateCompletedSetsCount();

    if (completedCount === 0) {
      Alert.alert('No Sets Completed', 'Please check off at least one completed set before logging.');
      return;
    }

    setSubmitting(true);
    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

      // Backend expects ONE FLAT list of sets, each carrying its own
      // exerciseId — not sets grouped/nested under each exercise.
      const flatSets = routineExercises.flatMap((ex, exIdx) => {
        const sets = setsData[exIdx] || [];
        const exerciseId = ex.exerciseId || ex.id;
        return sets.map((s) => ({
          exerciseId,
          setNumber: s.setNumber,
          targetReps: parseInt(s.targetReps, 10) || 0,
          targetWeightKg: parseFloat(s.targetWeightKg) || 0,
          actualReps: parseInt(s.actualReps, 10) || 0,
          actualWeightKg: parseFloat(s.actualWeightKg) || 0,
          isCompleted: !!s.completed,
        }));
      });

      // logDate is @NotNull on the backend — format as YYYY-MM-DD
      const logDate = new Date().toISOString().slice(0, 10);

      const payload = {
        planDayId: todayRoutine?.id,
        logDate,
        workoutTitle: todayRoutine?.title || todayRoutine?.routineName,
        durationMinutes,
        rpeScore: parseInt(rpeEffort, 10),
        userNotes: friendNotes,
        sets: flatSets,
      };

      await userApi.submitLog(payload);
      setSessionActive(false);

      Alert.alert(
        'Workout Completed! 🏆🏴‍☠️',
        `Great job, ${user?.name || 'Pirate'}! ${completedCount} sets completed. Total volume: ${calculateTotalVolume()} kg.\nYour coach will be notified!`,
        [
          {
            text: 'View History',
            onPress: () => onNavigateHistory && onNavigateHistory(),
          },
          {
            text: 'OK',
            onPress: () => loadTodayWorkout(),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        'Submission Failed',
        err.response?.data?.message || err.message || 'Could not submit workout log'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatStopwatch = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading Today's Routine...</Text>
      </View>
    );
  }

  // If already logged today
  if (todayStatus?.completedToday) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.completedCard}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.completedHeading}>Workout Finished for Today!</Text>
          <Text style={styles.completedSub}>
            You crushed today's routine. Rest up, refuel, and check your progression in history!
          </Text>

          <TouchableOpacity
            style={styles.historyBtn}
            onPress={onNavigateHistory}
          >
            <Ionicons name="stats-chart" size={18} color="#020617" />
            <Text style={styles.historyBtnText}>View Past Sessions & Progression</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // If no routine assigned
  if (!todayRoutine || routineExercises.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
        <View style={styles.noWorkoutCard}>
          <Ionicons name="barbell-outline" size={48} color="#475569" />
          <Text style={styles.noWorkoutHeading}>No Routine Scheduled Today</Text>
          <Text style={styles.noWorkoutSub}>
            Your coach hasn't assigned a routine for today, or it's a scheduled rest day!
          </Text>
          <TouchableOpacity
            style={styles.historyBtn}
            onPress={onNavigateHistory}
          >
            <Ionicons name="time-outline" size={18} color="#020617" />
            <Text style={styles.historyBtnText}>Check Past Workouts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Today's Routine Header Banner */}
        <View style={styles.routineBanner}>
          <View style={styles.routineTopRow}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>TODAY'S WORKOUT</Text>
            </View>
            {/* Live Stopwatch */}
            <View style={styles.stopwatchBadge}>
              <Ionicons name="stopwatch-outline" size={14} color="#06b6d4" />
              <Text style={styles.stopwatchText}>{formatStopwatch(elapsedSeconds)}</Text>
            </View>
          </View>

          <Text style={styles.routineTitle}>{todayRoutine.title || todayRoutine.routineName}</Text>
          {todayRoutine.focus && (
            <Text style={styles.routineFocus}>Target: {todayRoutine.focus}</Text>
          )}

          {/* Quick Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{routineExercises.length}</Text>
              <Text style={styles.statLbl}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{calculateCompletedSetsCount()}</Text>
              <Text style={styles.statLbl}>Sets Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statVal}>{calculateTotalVolume()} kg</Text>
              <Text style={styles.statLbl}>Volume</Text>
            </View>
          </View>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionHeader}>SET-BY-SET TRACKER</Text>
          {routineExercises.map((exercise, exIdx) => (
            <ExerciseCard
              key={exercise.id || exIdx}
              exercise={exercise}
              index={exIdx}
              setsData={setsData[exIdx] || []}
              onUpdateSet={handleUpdateSet}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </View>

        {/* Workout Reflection & Submit Card */}
        <View style={styles.submitCard}>
          <Text style={styles.submitCardTitle}>Finish Workout Session</Text>

          {/* RPE Effort Selector (1-10) */}
          <Text style={styles.rpeLabel}>Rate Effort Difficulty (RPE 1-10): {rpeEffort}</Text>
          <View style={styles.rpeRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.rpeBtn,
                  rpeEffort === num && styles.rpeBtnActive,
                ]}
                onPress={() => setRpeEffort(num)}
              >
                <Text
                  style={[
                    styles.rpeBtnText,
                    rpeEffort === num && styles.rpeBtnTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Friend Notes */}
          <Text style={styles.notesLabel}>Session Notes / Feedback for Coach</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={3}
            placeholder="How did the session feel? E.g., Felt strong on squats, shoulder felt fine..."
            placeholderTextColor="#475569"
            value={friendNotes}
            onChangeText={setFriendNotes}
          />

          {/* Finish Button */}
          <TouchableOpacity
            style={styles.finishBtn}
            onPress={handleSubmitWorkout}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <View style={styles.finishBtnContent}>
                <Ionicons name="checkmark-done" size={20} color="#020617" />
                <Text style={styles.finishBtnText}>Submit & Save Workout Log</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Interactive Rest Timer Modal */}
      <RestTimerModal
        visible={restTimerVisible}
        initialSeconds={restDuration}
        onClose={() => setRestTimerVisible(false)}
        onFinish={() => {}}
      />
    </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  centerContent: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80%',
  },
  completedCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  trophyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  completedHeading: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  completedSub: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  noWorkoutCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  noWorkoutHeading: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 8,
  },
  noWorkoutSub: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#06b6d4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  historyBtnText: {
    color: '#020617',
    fontWeight: '700',
    fontSize: 14,
  },
  routineBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  routineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dayBadgeText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stopwatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#020617',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stopwatchText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  routineTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  routineFocus: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 14,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    color: '#06b6d4',
    fontSize: 16,
    fontWeight: '800',
  },
  statLbl: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1e293b',
  },
  exercisesSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  submitCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
    marginBottom: 24,
  },
  submitCardTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  rpeLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  rpeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rpeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rpeBtnActive: {
    backgroundColor: '#06b6d4',
    borderColor: '#06b6d4',
  },
  rpeBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  rpeBtnTextActive: {
    color: '#020617',
    fontWeight: '900',
  },
  notesLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  notesInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 70,
    marginBottom: 16,
  },
  finishBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  finishBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishBtnText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
  },
});
