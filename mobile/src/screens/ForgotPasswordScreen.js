import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ForgotPasswordScreen = ({ onSwitchToLogin }) => {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [debugOtpHint, setDebugOtpHint] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async () => {
    setError(null);
    setInfoMessage(null);
    setDebugOtpHint(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.requestResetOtp(email.trim().toLowerCase());
      setInfoMessage(res.data?.message || `6-digit OTP code sent to ${email}`);
      if (res.data?.debugOtp) {
        setDebugOtpHint(res.data.debugOtp);
        setOtp(res.data.debugOtp); // Autofill in dev mode for maximum convenience!
      }
      setResendCooldown(60);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Could not send OTP. Verify that the email is registered.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async () => {
    setError(null);
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPasswordWithOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });

      Alert.alert(
        'Password Reset Successful! 🎉',
        'Your password has been updated. You can now sign in with your new password.',
        [
          {
            text: 'Go to Sign In',
            onPress: () => onSwitchToLogin(),
          },
        ]
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to reset password. Please verify the OTP code.'
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
        {/* Top Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={step === 2 ? () => setStep(1) : onSwitchToLogin}
        >
          <Ionicons name="arrow-back" size={20} color="#06b6d4" />
          <Text style={styles.backBtnText}>
            {step === 2 ? 'Change Email' : 'Back to Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="key-outline" size={28} color="#06b6d4" />
          </View>
          <Text style={styles.brandTitle}>Reset Password</Text>
          <Text style={styles.brandSubtitle}>
            {step === 1
              ? 'Enter your registered email to receive an OTP'
              : `Enter the 6-digit OTP sent to ${email}`}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]}>
            <Text style={styles.stepNumActive}>1</Text>
          </View>
          <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step === 2 && styles.stepDotActive]}>
            <Text style={step === 2 ? styles.stepNumActive : styles.stepNum}>2</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {infoMessage && (
            <View style={styles.infoBox}>
              <Ionicons name="mail" size={18} color="#06b6d4" />
              <Text style={styles.infoText}>{infoMessage}</Text>
            </View>
          )}

          {debugOtpHint && (
            <View style={styles.debugBox}>
              <Ionicons name="flash" size={16} color="#10b981" />
              <Text style={styles.debugText}>
                Dev Quick OTP: <Text style={styles.debugOtpCode}>{debugOtpHint}</Text> (Autofilled!)
              </Text>
            </View>
          )}

          {step === 1 ? (
            /* STEP 1: Enter Email */
            <View>
              <Text style={styles.label}>Account Email Address</Text>
              <Text style={styles.sublabel}>
                Works for both Coach/Admin and Client accounts
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="admin@pirate.fit or karthik@pirate.fit"
                  placeholderTextColor="#475569"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRequestOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.submitBtnText}>Send Verification OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: Enter OTP & New Password */
            <View>
              {/* 6-Digit OTP Input */}
              <Text style={styles.label}>6-Digit OTP Code</Text>
              <View style={styles.otpInputWrapper}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor="#334155"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {/* Resend OTP */}
              <View style={styles.resendRow}>
                {resendCooldown > 0 ? (
                  <Text style={styles.resendTimerText}>
                    Resend code in {resendCooldown}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleRequestOtp} disabled={loading}>
                    <Text style={styles.resendLink}>Resend OTP Code</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* New Password */}
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#475569"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              {/* Confirm New Password */}
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color="#64748b"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#475569"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {/* Reset Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#020617" />
                ) : (
                  <Text style={styles.submitBtnText}>Reset & Save Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onSwitchToLogin}
          >
            <Text style={styles.cancelBtnText}>Cancel and return to Sign In</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#f8fafc',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#06b6d4',
  },
  stepNum: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  stepNumActive: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1e293b',
  },
  stepLineActive: {
    backgroundColor: '#06b6d4',
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: '#06b6d4',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  infoText: {
    color: '#06b6d4',
    fontSize: 12,
    flex: 1,
  },
  debugBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  debugText: {
    color: '#10b981',
    fontSize: 12,
  },
  debugOtpCode: {
    fontWeight: '900',
    color: '#f8fafc',
    letterSpacing: 2,
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  sublabel: {
    color: '#64748b',
    fontSize: 11,
    marginBottom: 8,
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
    paddingVertical: 12,
    fontSize: 14,
  },
  otpInputWrapper: {
    backgroundColor: '#020617',
    borderWidth: 1.5,
    borderColor: '#06b6d4',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  otpInput: {
    color: '#06b6d4',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  resendTimerText: {
    color: '#64748b',
    fontSize: 11,
  },
  resendLink: {
    color: '#06b6d4',
    fontSize: 12,
    fontWeight: '600',
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
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 13,
  },
});
