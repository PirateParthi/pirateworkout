import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ExerciseCard = ({
  exercise,
  index,
  setsData,
  onUpdateSet,
  onToggleComplete,
}) => {
  return (
    <View style={styles.card}>
      {/* Exercise Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
          <View style={styles.titleArea}>
            <Text style={styles.exerciseName}>{exercise.exerciseName || exercise.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.muscleBadge}>
                <Text style={styles.muscleText}>{exercise.muscleGroup || 'General'}</Text>
              </View>
              <View style={styles.restBadge}>
                <Ionicons name="timer-outline" size={12} color="#06b6d4" />
                <Text style={styles.restBadgeText}>{exercise.restSeconds || 60}s rest</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Target Info */}
      <View style={styles.targetInfoBox}>
        <Text style={styles.targetLabel}>Target:</Text>
        <Text style={styles.targetVal}>
          {exercise.targetSets || 3} sets × {exercise.targetReps || '8-12'} reps
          {exercise.targetWeightKg ? ` @ ${exercise.targetWeightKg} kg` : ''}
        </Text>
      </View>

      {/* Sets Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1 }]}>SET</Text>
        <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>KG</Text>
        <Text style={[styles.th, { flex: 2, textAlign: 'center' }]}>REPS</Text>
        <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>DONE</Text>
      </View>

      {/* Set Rows */}
      {setsData.map((s, sIndex) => {
        const isCompleted = s.completed;
        return (
          <View
            key={sIndex}
            style={[
              styles.setRow,
              isCompleted && styles.setRowCompleted,
            ]}
          >
            <View style={[styles.setNumBox, { flex: 1 }]}>
              <Text style={[styles.setNumText, isCompleted && styles.setNumCompleted]}>
                #{sIndex + 1}
              </Text>
            </View>

            {/* Weight Input */}
            <View style={[styles.inputCell, { flex: 2 }]}>
              <TextInput
                style={[styles.input, isCompleted && styles.inputCompleted]}
                keyboardType="numeric"
                value={s.actualWeightKg !== undefined ? String(s.actualWeightKg) : ''}
                onChangeText={(val) => onUpdateSet(index, sIndex, 'actualWeightKg', val)}
                placeholder="0"
                placeholderTextColor="#475569"
                selectTextOnFocus
              />
            </View>

            {/* Reps Input */}
            <View style={[styles.inputCell, { flex: 2 }]}>
              <TextInput
                style={[styles.input, isCompleted && styles.inputCompleted]}
                keyboardType="numeric"
                value={s.actualReps !== undefined ? String(s.actualReps) : ''}
                onChangeText={(val) => onUpdateSet(index, sIndex, 'actualReps', val)}
                placeholder="0"
                placeholderTextColor="#475569"
                selectTextOnFocus
              />
            </View>

            {/* Done Button */}
            <View style={[styles.checkCell, { flex: 1.5 }]}>
              <TouchableOpacity
                style={[
                  styles.checkBtn,
                  isCompleted ? styles.checkBtnDone : styles.checkBtnPending,
                ]}
                onPress={() => onToggleComplete(index, sIndex, exercise.restSeconds || 60)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isCompleted ? 'checkmark' : 'checkmark-outline'}
                  size={18}
                  color={isCompleted ? '#020617' : '#94a3b8'}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  indexBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    color: '#06b6d4',
    fontWeight: '800',
    fontSize: 14,
  },
  titleArea: {
    flex: 1,
  },
  exerciseName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muscleBadge: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  muscleText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  restBadgeText: {
    color: '#06b6d4',
    fontSize: 11,
    fontWeight: '600',
  },
  targetInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  targetLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  targetVal: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 8,
  },
  th: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  setRowCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  setNumBox: {
    justifyContent: 'center',
  },
  setNumText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 13,
  },
  setNumCompleted: {
    color: '#10b981',
  },
  inputCell: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  input: {
    width: '90%',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    color: '#f8fafc',
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  inputCompleted: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  checkCell: {
    alignItems: 'flex-end',
  },
  checkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnPending: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  checkBtnDone: {
    backgroundColor: '#10b981',
  },
});
