import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export const RegisterScreen = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetGoal, setTargetGoal] = useState('Muscle Gain');
  const [bodyWeightKg, setBodyWeightKg] = useState('');
  const [role, setRole] = useState('ROLE_CLIENT'); // ROLE_CLIENT or ROLE_ADMIN
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const GOALS = ['Muscle Gain', 'Fat Loss', 'Strength & Power', 'General Fitness'];

  const handleRegister = async () => {
    setError(null);
    if (!name || !email || !password) {
      setError('Name, email, and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        targetGoal,
        bodyWeightKg: bodyWeightKg ? parseFloat(bodyWeightKg) : null,
        role,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Try a different email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🏴‍☠️</Text>
          </View>
          <Text style={styles.brandTitle}>Join PirateWorkout</Text>
          <Text style={styles.brandSubtitle}>Create your client or coach profile</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Account Role Selector */}
          <Text style={styles.label}>Account Role</Text>
          <View style={styles.roleToggleRow}>
            <TouchableOpacity
              style={[
                styles.roleToggleBtn,
                role === 'ROLE_CLIENT' && styles.roleToggleActive,
              ]}
              onPress={() => setRole('ROLE_CLIENT')}
            >
              <Ionicons
                name="barbell"
                size={16}
                color={role === 'ROLE_CLIENT' ? '#06b6d4' : '#64748b'}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  role === 'ROLE_CLIENT' && styles.roleToggleTextActive,
                ]}
              >
                Friend / Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleToggleBtn,
                role === 'ROLE_ADMIN' && styles.roleToggleActive,
              ]}
              onPress={() => setRole('ROLE_ADMIN')}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={role === 'ROLE_ADMIN' ? '#06b6d4' : '#64748b'}
              />
              <Text
                style={[
                  styles.roleToggleText,
                  role === 'ROLE_ADMIN' && styles.roleToggleTextActive,
                ]}
              >
                Coach / Admin
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Karthik Raja"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="karthik@example.com"
              placeholderTextColor="#475569"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password (min 6 characters)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Target Goal Selector */}
          <Text style={styles.label}>Fitness Goal</Text>
          <View style={styles.goalPillsRow}>
            {GOALS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.goalPill,
                  targetGoal === g && styles.goalPillActive,
                ]}
                onPress={() => setTargetGoal(g)}
              >
                <Text
                  style={[
                    styles.goalPillText,
                    targetGoal === g && styles.goalPillTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Body Weight */}
          <Text style={styles.label}>Current Body Weight (kg, optional)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="scale-outline" size={18} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="72.5"
              placeholderTextColor="#475569"
              value={bodyWeightKg}
              onChangeText={setBodyWeightKg}
              keyboardType="numeric"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#020617" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already registered? </Text>
            <TouchableOpacity onPress={onSwitchToLogin}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoEmoji: {
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
  },
  roleToggleActive: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  roleToggleText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  roleToggleTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    paddingVertical: 10,
    fontSize: 14,
  },
  goalPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  goalPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#334155',
  },
  goalPillActive: {
    borderColor: '#06b6d4',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  goalPillText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  goalPillTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#020617',
    fontSize: 15,
    fontWeight: '800',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    color: '#64748b',
    fontSize: 13,
  },
  switchLink: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '700',
  },
});
