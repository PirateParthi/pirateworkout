import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminApi } from '../api/client';

export const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'feed', 'builder'
  const [loading, setLoading] = useState(true);

  // Data states
  const [clients, setClients] = useState([]);
  const [logs, setLogs] = useState([]);

  // Feedback input state: { [logId]: text }
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Plan Builder State
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [planTitle, setPlanTitle] = useState('');
  const [planFocus, setPlanFocus] = useState('');
  const [plannedExercises, setPlannedExercises] = useState([]);
  const [creatingPlan, setCreatingPlan] = useState(false);

  // Which day(s) of the week this routine applies to
  const [dayTarget, setDayTarget] = useState('ALL'); // 'TODAY' or 'ALL'

  // Direct "type any workout name" input form (replaces the old limited picker)
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('10');
  const [customWeight, setCustomWeight] = useState('20');
  const [customRest, setCustomRest] = useState('60');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsRes, logsRes] = await Promise.allSettled([
        adminApi.getClients(),
        adminApi.getAllLogs(),
      ]);

      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data || []);
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (logId) => {
    const text = feedbackInputs[logId];
    if (!text || !text.trim()) {
      Alert.alert('Empty Feedback', 'Please type a coach note before submitting.');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await adminApi.addFeedback(logId, text.trim());
      Alert.alert('Feedback Posted!', 'Your coaching tip has been sent to your client.');
      setFeedbackInputs((prev) => ({ ...prev, [logId]: '' }));
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not post feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getTodayDayName = () => {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[new Date().getDay()];
  };

  const handleStartPlanForClient = (client) => {
    setSelectedClientId(client.id);
    setPlanTitle(`${client.name}'s Custom Split`);
    setPlanFocus('Hypertrophy & Strength');
    setPlannedExercises([]);
    setDayTarget('ALL');
    setActiveTab('builder');
  };

  const handleAddCustomWorkout = () => {
    if (!customName.trim()) {
      Alert.alert('Workout Name Required', 'Type a workout name, e.g. "Incline Dumbbell Press".');
      return;
    }

    setPlannedExercises((prev) => [
      ...prev,
      {
        // No exerciseId — this is a freely-typed name. The backend will look
        // it up by name and auto-create it if it doesn't exist yet.
        exerciseId: null,
        exerciseName: customName.trim(),
        targetSets: customSets,
        targetReps: customReps,
        targetWeightKg: customWeight,
        restSeconds: customRest,
      },
    ]);

    // Reset the form for the next workout, keep sensible defaults
    setCustomName('');
    setCustomSets('3');
    setCustomReps('10');
    setCustomWeight('20');
    setCustomRest('60');
  };

  const handleUpdatePlannedExercise = (index, field, value) => {
    setPlannedExercises((prev) => {
      const list = [...prev];
      list[index] = { ...list[index], [field]: value };
      return list;
    });
  };

  const handleRemovePlannedExercise = (index) => {
    setPlannedExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePlan = async () => {
    if (!selectedClientId) {
      Alert.alert('Select Client', 'Please choose a client to assign this routine.');
      return;
    }
    if (!planTitle.trim()) {
      Alert.alert('Plan Title', 'Please enter a title for this workout routine.');
      return;
    }
    if (plannedExercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to the plan.');
      return;
    }

    setCreatingPlan(true);
    try {
      const exercisesPayload = plannedExercises.map((e, idx) => ({
        // exerciseId stays undefined/null for freely-typed workouts — the
        // backend creates the exercise on the fly when it's new.
        exerciseId: e.exerciseId || undefined,
        exerciseName: e.exerciseName,
        orderIndex: idx + 1,
        targetSets: parseInt(e.targetSets, 10) || 3,
        targetReps: parseInt(e.targetReps, 10) || 10,
        targetWeightKg: parseFloat(e.targetWeightKg) || 0,
        restSeconds: parseInt(e.restSeconds, 10) || 60,
      }));

      const dayNames =
        dayTarget === 'TODAY'
          ? [getTodayDayName()]
          : ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

      const payload = {
        userId: selectedClientId,
        title: planTitle.trim(),
        description: planFocus.trim() || 'Custom workout routine',
        days: dayNames.map((dayOfWeek) => ({
          dayOfWeek,
          title: planTitle.trim(),
          exercises: exercisesPayload,
        })),
      };

      await adminApi.createPlan(payload);
      Alert.alert('Plan Assigned! 🎯', 'The workout plan has been assigned to your client.');
      setPlannedExercises([]);
      setActiveTab('clients');
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Failed to assign plan');
    } finally {
      setCreatingPlan(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading Coach Portal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Admin Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'clients' && styles.tabBtnActive]}
          onPress={() => setActiveTab('clients')}
        >
          <Ionicons
            name="people"
            size={16}
            color={activeTab === 'clients' ? '#06b6d4' : '#64748b'}
          />
          <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
            Clients ({clients.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'feed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="flash"
            size={16}
            color={activeTab === 'feed' ? '#06b6d4' : '#64748b'}
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
            Feed ({logs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'builder' && styles.tabBtnActive]}
          onPress={() => setActiveTab('builder')}
        >
          <Ionicons
            name="construct"
            size={16}
            color={activeTab === 'builder' ? '#06b6d4' : '#64748b'}
          />
          <Text style={[styles.tabText, activeTab === 'builder' && styles.tabTextActive]}>
            Plan Builder
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: CLIENTS */}
      {activeTab === 'clients' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>REGISTERED FRIENDS & CLIENTS</Text>
          {clients.length === 0 ? (
            <Text style={styles.emptyText}>No clients registered yet.</Text>
          ) : (
            clients.map((client) => (
              <View key={client.id} style={styles.clientCard}>
                <View style={styles.clientHeader}>
                  <View style={styles.clientAvatar}>
                    <Text style={styles.avatarText}>{(client.name || 'P')[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientEmail}>{client.email}</Text>
                  </View>
                </View>

                <View style={styles.clientMetaRow}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaLabel}>Goal: </Text>
                    <Text style={styles.metaValue}>{client.targetGoal || 'Fitness'}</Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaLabel}>Weight: </Text>
                    <Text style={styles.metaValue}>
                      {client.bodyWeightKg ? `${client.bodyWeightKg} kg` : 'N/A'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.assignPlanBtn}
                  onPress={() => handleStartPlanForClient(client)}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#020617" />
                  <Text style={styles.assignPlanBtnText}>Assign / Build Plan</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* TAB 2: LIVE FEED */}
      {activeTab === 'feed' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>LIVE CLIENT WORKOUT FEED</Text>
          {logs.length === 0 ? (
            <Text style={styles.emptyText}>No workouts logged yet.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <View>
                    <Text style={styles.feedUser}>{log.userName || 'Friend'}</Text>
                    <Text style={styles.feedRoutine}>{log.routineTitle}</Text>
                  </View>
                  <View style={styles.feedBadge}>
                    <Text style={styles.feedBadgeText}>{log.durationMinutes}m • RPE {log.rpeEffort}</Text>
                  </View>
                </View>

                {log.friendNotes ? (
                  <View style={styles.feedNotes}>
                    <Text style={styles.feedNotesText}>"{log.friendNotes}"</Text>
                  </View>
                ) : null}

                {/* Existing coach feedback */}
                {log.coachFeedback ? (
                  <View style={styles.coachFeedBox}>
                    <Text style={styles.coachFeedLabel}>Your Tip:</Text>
                    <Text style={styles.coachFeedText}>{log.coachFeedback}</Text>
                  </View>
                ) : null}

                {/* Reply / Send Feedback */}
                <View style={styles.feedbackInputRow}>
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Write coaching tip or praise..."
                    placeholderTextColor="#475569"
                    value={feedbackInputs[log.id] || ''}
                    onChangeText={(val) =>
                      setFeedbackInputs((prev) => ({ ...prev, [logId]: val }))
                    }
                  />
                  <TouchableOpacity
                    style={styles.sendFeedbackBtn}
                    onPress={() => handleSendFeedback(log.id)}
                    disabled={submittingFeedback}
                  >
                    <Ionicons name="send" size={16} color="#020617" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* TAB 3: PLAN BUILDER */}
      {activeTab === 'builder' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionHeader}>CUSTOM PLAN BUILDER</Text>

          {/* Client Selector */}
          <Text style={styles.builderLabel}>Select Client:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll}>
            {clients.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.clientPill,
                  selectedClientId === c.id && styles.clientPillActive,
                ]}
                onPress={() => setSelectedClientId(c.id)}
              >
                <Text
                  style={[
                    styles.clientPillText,
                    selectedClientId === c.id && styles.clientPillTextActive,
                  ]}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Routine Title */}
          <Text style={styles.builderLabel}>Routine Title:</Text>
          <TextInput
            style={styles.builderInput}
            value={planTitle}
            onChangeText={setPlanTitle}
            placeholder="e.g. Push Day (Chest & Triceps)"
            placeholderTextColor="#475569"
          />

          {/* Focus */}
          <Text style={styles.builderLabel}>Focus / Target Notes:</Text>
          <TextInput
            style={styles.builderInput}
            value={planFocus}
            onChangeText={setPlanFocus}
            placeholder="e.g. Chest Hypertrophy, Rest 90s on compounds"
            placeholderTextColor="#475569"
          />

          {/* Apply to Today or All Days */}
          <Text style={styles.builderLabel}>Apply Routine To:</Text>
          <View style={styles.dayTargetRow}>
            <TouchableOpacity
              style={[styles.dayTargetPill, dayTarget === 'TODAY' && styles.dayTargetPillActive]}
              onPress={() => setDayTarget('TODAY')}
            >
              <Text style={[styles.dayTargetText, dayTarget === 'TODAY' && styles.dayTargetTextActive]}>
                Today ({getTodayDayName()})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dayTargetPill, dayTarget === 'ALL' && styles.dayTargetPillActive]}
              onPress={() => setDayTarget('ALL')}
            >
              <Text style={[styles.dayTargetText, dayTarget === 'ALL' && styles.dayTargetTextActive]}>
                All 7 Days
              </Text>
            </TouchableOpacity>
          </View>

          {/* Direct "type any workout name" entry form */}
          <Text style={styles.builderLabel}>Add a Workout:</Text>
          <View style={styles.customWorkoutForm}>
            <TextInput
              style={styles.builderInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Type Workout Name: e.g. Incline Bench Press"
              placeholderTextColor="#475569"
            />
            <View style={styles.plannedInputsRow}>
              <View style={styles.plannedInputCol}>
                <Text style={styles.plannedInputLabel}>Sets</Text>
                <TextInput
                  style={styles.plannedNumInput}
                  keyboardType="numeric"
                  value={customSets}
                  onChangeText={setCustomSets}
                  placeholder="3"
                  placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.plannedInputCol}>
                <Text style={styles.plannedInputLabel}>Reps</Text>
                <TextInput
                  style={styles.plannedNumInput}
                  keyboardType="numeric"
                  value={customReps}
                  onChangeText={setCustomReps}
                  placeholder="10"
                  placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.plannedInputCol}>
                <Text style={styles.plannedInputLabel}>Kg</Text>
                <TextInput
                  style={styles.plannedNumInput}
                  keyboardType="numeric"
                  value={customWeight}
                  onChangeText={setCustomWeight}
                  placeholder="25"
                  placeholderTextColor="#475569"
                />
              </View>
              <View style={styles.plannedInputCol}>
                <Text style={styles.plannedInputLabel}>Rest (s)</Text>
                <TextInput
                  style={styles.plannedNumInput}
                  keyboardType="numeric"
                  value={customRest}
                  onChangeText={setCustomRest}
                  placeholder="60"
                  placeholderTextColor="#475569"
                />
              </View>
            </View>
            <TouchableOpacity style={styles.addWorkoutBtn} onPress={handleAddCustomWorkout}>
              <Ionicons name="add-circle" size={18} color="#020617" />
              <Text style={styles.addWorkoutBtnText}>+ Add Workout</Text>
            </TouchableOpacity>
          </View>

          {/* Exercises in Plan */}
          <Text style={styles.builderLabel}>Planned Exercises ({plannedExercises.length})</Text>

          {plannedExercises.map((pe, idx) => (
            <View key={idx} style={styles.plannedExCard}>
              <View style={styles.plannedExTop}>
                <Text style={styles.plannedExName}>{idx + 1}. {pe.exerciseName}</Text>
                <TouchableOpacity onPress={() => handleRemovePlannedExercise(idx)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.plannedInputsRow}>
                <View style={styles.plannedInputCol}>
                  <Text style={styles.plannedInputLabel}>Sets</Text>
                  <TextInput
                    style={styles.plannedNumInput}
                    keyboardType="numeric"
                    value={String(pe.targetSets)}
                    onChangeText={(val) => handleUpdatePlannedExercise(idx, 'targetSets', val)}
                  />
                </View>
                <View style={styles.plannedInputCol}>
                  <Text style={styles.plannedInputLabel}>Reps</Text>
                  <TextInput
                    style={styles.plannedNumInput}
                    keyboardType="numeric"
                    value={String(pe.targetReps)}
                    onChangeText={(val) => handleUpdatePlannedExercise(idx, 'targetReps', val)}
                  />
                </View>
                <View style={styles.plannedInputCol}>
                  <Text style={styles.plannedInputLabel}>Kg</Text>
                  <TextInput
                    style={styles.plannedNumInput}
                    keyboardType="numeric"
                    value={String(pe.targetWeightKg)}
                    onChangeText={(val) => handleUpdatePlannedExercise(idx, 'targetWeightKg', val)}
                  />
                </View>
                <View style={styles.plannedInputCol}>
                  <Text style={styles.plannedInputLabel}>Rest (s)</Text>
                  <TextInput
                    style={styles.plannedNumInput}
                    keyboardType="numeric"
                    value={String(pe.restSeconds)}
                    onChangeText={(val) => handleUpdatePlannedExercise(idx, 'restSeconds', val)}
                  />
                </View>
              </View>
            </View>
          ))}

          {/* Save Plan Button */}
          <TouchableOpacity
            style={styles.savePlanBtn}
            onPress={handleSavePlan}
            disabled={creatingPlan}
          >
            {creatingPlan ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.savePlanBtnText}>Save & Assign Plan</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#06b6d4',
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#06b6d4',
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  clientCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  clientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#06b6d4',
    fontSize: 18,
    fontWeight: '800',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  clientEmail: {
    color: '#64748b',
    fontSize: 12,
  },
  clientMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    backgroundColor: '#020617',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaLabel: {
    color: '#64748b',
    fontSize: 11,
  },
  metaValue: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  assignPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 10,
  },
  assignPlanBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  feedCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedUser: {
    color: '#06b6d4',
    fontSize: 15,
    fontWeight: '700',
  },
  feedRoutine: {
    color: '#94a3b8',
    fontSize: 12,
  },
  feedBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  feedBadgeText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
  },
  feedNotes: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  feedNotesText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
  },
  coachFeedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  coachFeedLabel: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
  },
  coachFeedText: {
    color: '#f8fafc',
    fontSize: 12,
  },
  feedbackInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackInput: {
    flex: 1,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  sendFeedbackBtn: {
    backgroundColor: '#06b6d4',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builderLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  builderInput: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 14,
  },
  clientScroll: {
    marginBottom: 14,
  },
  clientPill: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  clientPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
  },
  clientPillText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  clientPillTextActive: {
    color: '#06b6d4',
    fontWeight: '800',
  },
  dayTargetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  dayTargetPill: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  dayTargetPillActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06b6d4',
  },
  dayTargetText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  dayTargetTextActive: {
    color: '#06b6d4',
    fontWeight: '800',
  },
  customWorkoutForm: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  addWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#06b6d4',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  addWorkoutBtnText: {
    color: '#020617',
    fontSize: 13,
    fontWeight: '800',
  },
  plannedExCard: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginBottom: 8,
  },
  plannedExTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plannedExName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  plannedInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  plannedInputCol: {
    flex: 1,
  },
  plannedInputLabel: {
    color: '#64748b',
    fontSize: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  plannedNumInput: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 6,
    color: '#f8fafc',
    textAlign: 'center',
    paddingVertical: 4,
    fontSize: 13,
  },
  savePlanBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  savePlanBtnText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
  },
});
