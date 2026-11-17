/**
 * ResortOS - Manager Management Screen (Admin Only)
 * View, add, edit, assign 1:1 to hotel, reset passwords, and toggle active status.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { useNavigation } from '../hooks/useNavigation';
import { useHotel } from '../hooks/useHotel';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ManagerUser } from '../types/hotel';

export const ManagersManagementScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { hotels } = useHotel();

  // Initial Seed Managers
  const [managers, setManagers] = useState<ManagerUser[]>([
    {
      id: 'usr-mgr-villa',
      hotelId: 'h-villa',
      hotelName: 'THE VILLA',
      email: 'manager.villa@resortos.com',
      fullName: 'Sunita Sharma',
      phone: '+91 98290 11441',
      status: 'ACTIVE',
      createdAt: '2026-11-14',
    },
    {
      id: 'usr-mgr-navkar',
      hotelId: 'h-navkar',
      hotelName: 'NAVKAR PALACE & RESORT',
      email: 'manager.navkar@resortos.com',
      fullName: 'Rajesh Verma',
      phone: '+91 98290 11442',
      status: 'ACTIVE',
      createdAt: '2026-11-14',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState<ManagerUser | null>(null);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedForReset, setSelectedForReset] = useState<ManagerUser | null>(null);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [assignedHotelId, setAssignedHotelId] = useState(hotels[0]?.id || 'h-villa');
  const [initialPassword, setInitialPassword] = useState('Password123!');
  const [newPassword, setNewPassword] = useState('');

  const openAddModal = () => {
    setEditingManager(null);
    setFullName('');
    setEmail('');
    setPhone('+91 ');
    setAssignedHotelId(hotels[0]?.id || 'h-villa');
    setInitialPassword('Password123!');
    setModalVisible(true);
  };

  const openEditModal = (mgr: ManagerUser) => {
    setEditingManager(mgr);
    setFullName(mgr.fullName);
    setEmail(mgr.email);
    setPhone(mgr.phone);
    setAssignedHotelId(mgr.hotelId);
    setModalVisible(true);
  };

  const handleSaveManager = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please provide Manager Name and Email Address');
      return;
    }

    const assignedHotelObj = hotels.find((h) => h.id === assignedHotelId);
    const hotelName = assignedHotelObj ? assignedHotelObj.name : 'Unknown Hotel';

    if (editingManager) {
      setManagers((prev) =>
        prev.map((m) =>
          m.id === editingManager.id
            ? {
                ...m,
                fullName,
                email,
                phone,
                hotelId: assignedHotelId,
                hotelName,
              }
            : m
        )
      );
    } else {
      const newMgr: ManagerUser = {
        id: `usr-mgr-${Date.now()}`,
        fullName,
        email,
        phone,
        hotelId: assignedHotelId,
        hotelName,
        status: 'ACTIVE',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setManagers((prev) => [...prev, newMgr]);
    }

    setModalVisible(false);
  };

  const toggleStatus = (id: string) => {
    setManagers((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : m
      )
    );
  };

  const openResetPasswordModal = (mgr: ManagerUser) => {
    setSelectedForReset(mgr);
    setNewPassword('Password123!');
    setResetModalVisible(true);
  };

  const handlePasswordReset = () => {
    if (!newPassword || newPassword.length < 4) {
      Alert.alert('Invalid Password', 'Password must be at least 4 characters');
      return;
    }
    Alert.alert(
      'Password Reset Successful',
      `Password for ${selectedForReset?.fullName} has been updated to: ${newPassword}`
    );
    setResetModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Manager Management"
        subtitle="Admin Access • Assign 1 Manager to 1 Hotel"
        showBack
        onBack={goBack}
        rightAction={
          <Button
            title="+ Add Manager"
            size="sm"
            variant="primary"
            onPress={openAddModal}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Rule Banner */}
        <View style={styles.ruleBanner}>
          <Icon name="shield" size={18} color="#047857" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Security Policy: Every Manager is assigned strictly to ONE hotel and cannot view or access records of any other property.
          </Text>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hotel Managers ({managers.length})</Text>
          <Text style={styles.sectionSub}>Active property operational supervisors</Text>
        </View>

        {/* Managers Cards */}
        {managers.map((mgr) => {
          const isActive = mgr.status === 'ACTIVE';

          return (
            <Card key={mgr.id} padding="lg" variant="elevated" style={styles.managerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.managerIdentity}>
                  <View style={styles.avatar}>
                    <Icon name="user" size={24} color="#047857" />
                  </View>
                  <View style={styles.titleBlock}>
                    <Text style={styles.managerName}>{mgr.fullName}</Text>
                    <Text style={styles.managerEmail}>{mgr.email}</Text>
                  </View>
                </View>

                <Badge
                  label={isActive ? 'ACTIVE' : 'INACTIVE'}
                  variant={isActive ? 'success' : 'error'}
                  size="sm"
                />
              </View>

              {/* Assignment Box */}
              <View style={styles.assignmentBox}>
                <View style={styles.assignRow}>
                  <Text style={styles.assignLabel}>Assigned Property:</Text>
                  <Text style={styles.assignHotelName}>{mgr.hotelName}</Text>
                </View>
                <View style={styles.assignRow}>
                  <Text style={styles.assignLabel}>Contact Phone:</Text>
                  <Text style={styles.assignValue}>{mgr.phone}</Text>
                </View>
                <View style={styles.assignRow}>
                  <Text style={styles.assignLabel}>Permissions:</Text>
                  <Text style={styles.assignValue}>Single Hotel Only (No Salaries/Reports)</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => openEditModal(mgr)}
                >
                  <Icon name="edit" size={14} color={colors.primaryNavy} />
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.resetBtn]}
                  onPress={() => openResetPasswordModal(mgr)}
                >
                  <Icon name="lock" size={14} color="#D97706" />
                  <Text style={styles.resetBtnText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    isActive ? styles.deactivateBtn : styles.activateBtn,
                  ]}
                  onPress={() => toggleStatus(mgr.id)}
                >
                  <Text style={isActive ? styles.deactivateText : styles.activateText}>
                    {isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Add / Edit Manager Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingManager ? 'Edit Manager Details' : 'Create Manager Account'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Manager Full Name *"
                placeholder="e.g. Sunita Sharma"
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label="Username / Email Address *"
                placeholder="manager.villa@resortos.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Mobile Contact Number *"
                placeholder="+91 98290 11441"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* Hotel Assignment Picker */}
              <Text style={styles.formSectionLabel}>Assign to Hotel (Strict 1:1 Mapping) *</Text>
              <View style={styles.hotelSelectContainer}>
                {hotels.map((h) => {
                  const isSelected = assignedHotelId === h.id;
                  return (
                    <TouchableOpacity
                      key={h.id}
                      style={[
                        styles.hotelOption,
                        isSelected && styles.hotelOptionSelected,
                      ]}
                      onPress={() => setAssignedHotelId(h.id)}
                    >
                      <Icon
                        name={isSelected ? 'check-circle' : 'circle'}
                        size={18}
                        color={isSelected ? colors.primaryNavy : colors.textMuted}
                      />
                      <View style={styles.hotelOptionText}>
                        <Text style={[styles.hotelOptTitle, isSelected && styles.hotelOptTitleSelected]}>
                          {h.name}
                        </Text>
                        <Text style={styles.hotelOptSub}>{h.code} • {h.location}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {!editingManager && (
                <Input
                  label="Initial Password *"
                  placeholder="Password123!"
                  value={initialPassword}
                  onChangeText={setInitialPassword}
                  isPassword
                />
              )}

              <Button
                title={editingManager ? 'Save Changes' : 'Create Manager'}
                onPress={handleSaveManager}
                variant="primary"
                size="lg"
                style={styles.modalSaveBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        visible={resetModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, styles.smallModal]}>
            <Text style={styles.modalTitle}>Reset Manager Password</Text>
            <Text style={styles.resetSub}>
              Set a new login password for {selectedForReset?.fullName} ({selectedForReset?.email})
            </Text>

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
              containerStyle={{ marginVertical: spacing.md }}
            />

            <View style={styles.modalActionsRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setResetModalVisible(false)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <Button
                title="Save Password"
                variant="primary"
                onPress={handlePasswordReset}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  ruleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerIcon: {
    marginRight: spacing.sm,
  },
  bannerText: {
    ...typography.captionMedium,
    color: '#065F46',
    flex: 1,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  managerCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  managerIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  managerName: {
    ...typography.subtitle1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  managerEmail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  assignmentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  assignLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  assignHotelName: {
    ...typography.captionMedium,
    color: colors.primaryNavy,
    fontWeight: '700',
  },
  assignValue: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  editBtn: {
    backgroundColor: colors.primaryTint,
  },
  editBtnText: {
    ...typography.captionMedium,
    color: colors.primaryNavy,
    marginLeft: 4,
  },
  resetBtn: {
    backgroundColor: '#FEF3C7',
  },
  resetBtnText: {
    ...typography.captionMedium,
    color: '#B45309',
    marginLeft: 4,
  },
  deactivateBtn: {
    backgroundColor: '#FEF2F2',
  },
  deactivateText: {
    ...typography.captionMedium,
    color: colors.error,
  },
  activateBtn: {
    backgroundColor: '#F0FDF4',
  },
  activateText: {
    ...typography.captionMedium,
    color: colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
    ...shadows.lg,
  },
  smallModal: {
    maxHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  formSectionLabel: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  hotelSelectContainer: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  hotelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hotelOptionSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryNavy,
  },
  hotelOptionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  hotelOptTitle: {
    ...typography.subtitle2,
    color: colors.textPrimary,
  },
  hotelOptTitleSelected: {
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  hotelOptSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  modalSaveBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  resetSub: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
});

export default ManagersManagementScreen;
