import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { useNavigation } from '../hooks/useNavigation';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';

export const LoginScreen: React.FC = () => {
  const { params, navigate, goBack } = useNavigation();
  const role = params.role || 'admin';
  const isAdmin = role === 'admin';

  const [username, setUsername] = useState(isAdmin ? 'admin@resortos.com' : 'manager@resortos.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username or email address is required';
    } else if (username.length < 3) {
      newErrors.username = 'Please enter a valid username or email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setLoading(true);
    // UI Preview simulation
    setTimeout(() => {
      setLoading(false);
      if (isAdmin) {
        navigate('admin-dashboard', { role: 'admin' });
      } else {
        navigate('manager-dashboard', { role: 'manager' });
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={isAdmin ? 'Administrator Login' : 'Manager Login'}
        subtitle="Secure Portal Authentication"
        showBack
        onBack={goBack}
        rightAction={
          <Badge
            label={isAdmin ? 'ADMIN' : 'MANAGER'}
            variant={isAdmin ? 'primary' : 'success'}
            size="sm"
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Preview Info Banner */}
          <View style={styles.previewBanner}>
            <Icon name="check-circle" size={16} color={colors.accentBlue} style={styles.bannerIcon} />
            <Text style={styles.bannerText}>
              UI Preview Mode: Credentials are pre-filled for rapid inspection. Tap Sign In to preview.
            </Text>
          </View>

          {/* Form Card */}
          <Card padding="lg" variant="elevated" style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.roleIconCircle,
                  { backgroundColor: isAdmin ? colors.primaryTint : '#F0FDF4' },
                ]}
              >
                <Icon
                  name={isAdmin ? 'shield' : 'user'}
                  size={26}
                  color={isAdmin ? colors.primaryNavy : colors.success}
                />
              </View>
              <Text style={styles.formTitle}>
                {isAdmin ? 'Executive Access' : 'Property Management'}
              </Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to manage resort operations.
              </Text>
            </View>

            {/* Username Field */}
            <Input
              label="Username or Corporate Email"
              placeholder="e.g. admin@resortos.com"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              leftIcon="mail"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.username}
            />

            {/* Password Field */}
            <Input
              label="Password"
              placeholder="Enter your account password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              leftIcon="lock"
              isPassword
              error={errors.password}
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordRow}>
              <Text style={styles.securityHelper}>Protected by ResortOS Security</Text>
              <Text style={styles.forgotPasswordText}>Reset Password</Text>
            </View>

            {/* Login Button */}
            <Button
              title={isAdmin ? 'Sign In to Admin Dashboard' : 'Sign In to Manager Dashboard'}
              onPress={handleLogin}
              variant={isAdmin ? 'primary' : 'primary'}
              size="lg"
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            {/* Switch Role Prompt */}
            <Button
              title={isAdmin ? 'Switch to Manager Login' : 'Switch to Admin Login'}
              onPress={() => {
                const targetRole = isAdmin ? 'manager' : 'admin';
                navigate('login', { role: targetRole });
                setUsername(targetRole === 'admin' ? 'admin@resortos.com' : 'manager@resortos.com');
              }}
              variant="ghost"
              size="sm"
              style={styles.switchButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentBlueLight,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  bannerText: {
    ...typography.captionMedium,
    color: colors.accentBlue,
    flex: 1,
  },
  formCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  roleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  formSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  forgotPasswordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  securityHelper: {
    ...typography.caption,
    color: colors.textMuted,
  },
  forgotPasswordText: {
    ...typography.captionMedium,
    color: colors.accentBlue,
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  switchButton: {
    marginTop: spacing.md,
  },
});
