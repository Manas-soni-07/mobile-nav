/**
 * ResortOS - Staff Management Screen (Admin Only)
 * Directory of employees, designations, monthly salaries in INR, and hotel assignments.
 */

import React, { useState, useMemo } from 'react';
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
import { StaffMember } from '../types/hotel';
import { formatCurrency } from '../utils/formatters';

export const StaffManagementScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { hotels } = useHotel();

  // Initial staff seed
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'stf-v-1',
      hotelId: 'h-villa',
      employeeCode: 'EMP-TV-01',
      fullName: 'Manoj Kumar',
      role: 'Receptionist',
      department: 'Front Desk',
      shift: 'Morning',
      status: 'present',
      phone: '+91 98291 00111',
      monthlySalary: 18000,
      joinDate: '2025-01-15',
    },
    {
      id: 'stf-v-2',
      hotelId: 'h-villa',
      employeeCode: 'EMP-TV-02',
      fullName: 'Ramesh Meena',
      role: 'Housekeeping Lead',
      department: 'Housekeeping',
      shift: 'Morning',
      status: 'present',
      phone: '+91 98291 00112',
      monthlySalary: 15000,
      joinDate: '2025-03-01',
    },
    {
      id: 'stf-v-3',
      hotelId: 'h-villa',
      employeeCode: 'EMP-TV-03',
      fullName: 'Sohan Lal',
      role: 'Security Guard',
      department: 'Security',
      shift: 'Night',
      status: 'present',
      phone: '+91 98291 00113',
      monthlySalary: 14000,
      joinDate: '2025-02-10',
    },
    {
      id: 'stf-v-4',
      hotelId: 'h-villa',
      employeeCode: 'EMP-TV-04',
      fullName: 'Gopal Sharma',
      role: 'Maintenance Electrician',
      department: 'Maintenance',
      shift: 'Full Day',
      status: 'present',
      phone: '+91 98291 00114',
      monthlySalary: 16000,
      joinDate: '2025-04-01',
    },
    {
      id: 'stf-n-1',
      hotelId: 'h-navkar',
      employeeCode: 'EMP-NP-01',
      fullName: 'Bhupendra Singh',
      role: 'Front Office Executive',
      department: 'Front Desk',
      shift: 'Morning',
      status: 'present',
      phone: '+91 98292 00221',
      monthlySalary: 20000,
      joinDate: '2025-01-01',
    },
    {
      id: 'stf-n-2',
      hotelId: 'h-navkar',
      employeeCode: 'EMP-NP-02',
      fullName: 'Kamla Devi',
      role: 'Housekeeping Incharge',
      department: 'Housekeeping',
      shift: 'Morning',
      status: 'present',
      phone: '+91 98292 00222',
      monthlySalary: 16000,
      joinDate: '2025-02-15',
    },
    {
      id: 'stf-n-3',
      hotelId: 'h-navkar',
      employeeCode: 'EMP-NP-03',
      fullName: 'Pappu Rawat',
      role: 'Night Security',
      department: 'Security',
      shift: 'Night',
      status: 'present',
      phone: '+91 98292 00223',
      monthlySalary: 14000,
      joinDate: '2025-03-20',
    },
    {
      id: 'stf-n-4',
      hotelId: 'h-navkar',
      employeeCode: 'EMP-NP-04',
      fullName: 'Dinesh Soni',
      role: 'Plumber & Maintenance',
      department: 'Maintenance',
      shift: 'Full Day',
      status: 'present',
      phone: '+91 98292 00224',
      monthlySalary: 16500,
      joinDate: '2025-05-01',
    },
  ]);

  const [selectedFilterHotel, setSelectedFilterHotel] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [role, setRole] = useState('Receptionist');
  const [monthlySalary, setMonthlySalary] = useState('18000');
  const [targetHotelId, setTargetHotelId] = useState('h-villa');
  const [joinDate, setJoinDate] = useState('2025-01-01');

  const filteredStaff = useMemo(() => {
    if (selectedFilterHotel === 'all') return staffList;
    return staffList.filter((s) => s.hotelId === selectedFilterHotel);
  }, [staffList, selectedFilterHotel]);

  const openAddModal = () => {
    setEditingStaff(null);
    setFullName('');
    setPhone('+91 ');
    setRole('Receptionist');
    setMonthlySalary('18000');
    setTargetHotelId('h-villa');
    setJoinDate(new Date().toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFullName(staff.fullName);
    setPhone(staff.phone);
    setRole(staff.role);
    setMonthlySalary(staff.monthlySalary?.toString() || '15000');
    setTargetHotelId(staff.hotelId);
    setJoinDate(staff.joinDate || '2025-01-01');
    setModalVisible(true);
  };

  const handleSaveStaff = () => {
    if (!fullName.trim() || !role.trim()) {
      Alert.alert('Required Fields', 'Please enter staff full name and role');
      return;
    }

    const salary = parseFloat(monthlySalary) || 15000;

    if (editingStaff) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingStaff.id
            ? {
                ...s,
                fullName,
                phone,
                role,
                monthlySalary: salary,
                hotelId: targetHotelId,
                joinDate,
              }
            : s
        )
      );
    } else {
      const newStaff: StaffMember = {
        id: `stf-${Date.now()}`,
        hotelId: targetHotelId,
        employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
        fullName,
        phone,
        role,
        department: 'Front Desk',
        shift: 'Morning',
        status: 'present',
        monthlySalary: salary,
        joinDate,
      };
      setStaffList((prev) => [...prev, newStaff]);
    }

    setModalVisible(false);
  };

  const getHotelName = (hId: string) => {
    if (hId === 'h-villa') return 'THE VILLA';
    if (hId === 'h-navkar') return 'NAVKAR PALACE & RESORT';
    return hotels.find((h) => h.id === hId)?.name || 'Property';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Staff Management"
        subtitle="Admin Access • Employee Profiles & Salaries"
        showBack
        onBack={goBack}
        rightAction={
          <Button
            title="+ Add Staff"
            size="sm"
            variant="primary"
            onPress={openAddModal}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilterHotel === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilterHotel('all')}
          >
            <Text style={[styles.filterChipText, selectedFilterHotel === 'all' && styles.filterChipTextActive]}>
              All Hotels ({staffList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilterHotel === 'h-villa' && styles.filterChipActive]}
            onPress={() => setSelectedFilterHotel('h-villa')}
          >
            <Text style={[styles.filterChipText, selectedFilterHotel === 'h-villa' && styles.filterChipTextActive]}>
              The Villa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilterHotel === 'h-navkar' && styles.filterChipActive]}
            onPress={() => setSelectedFilterHotel('h-navkar')}
          >
            <Text style={[styles.filterChipText, selectedFilterHotel === 'h-navkar' && styles.filterChipTextActive]}>
              Navkar Palace
            </Text>
          </TouchableOpacity>
        </View>

        {/* Staff Cards List */}
        {filteredStaff.map((staff) => (
          <Card key={staff.id} padding="lg" variant="elevated" style={styles.staffCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Icon name="user" size={22} color={colors.primaryNavy} />
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.staffName}>{staff.fullName}</Text>
                <Text style={styles.staffRole}>{staff.role} • {staff.employeeCode}</Text>
              </View>
              <Badge
                label={getHotelName(staff.hotelId)}
                variant="primary"
                size="sm"
              />
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monthly Salary:</Text>
                <Text style={styles.salaryText}>{formatCurrency(staff.monthlySalary || 0)} / month</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mobile:</Text>
                <Text style={styles.infoValue}>{staff.phone}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joining Date:</Text>
                <Text style={styles.infoValue}>{staff.joinDate || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => openEditModal(staff)}
              >
                <Icon name="edit" size={14} color={colors.primaryNavy} />
                <Text style={styles.editBtnText}>Edit Profile & Salary</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Add / Edit Staff Modal */}
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
                {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Staff Full Name *"
                placeholder="e.g. Ramesh Meena"
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label="Role / Designation *"
                placeholder="e.g. Housekeeping Lead"
                value={role}
                onChangeText={setRole}
              />
              <Input
                label="Monthly Salary (₹ INR) *"
                placeholder="15000"
                value={monthlySalary}
                onChangeText={setMonthlySalary}
                keyboardType="numeric"
              />
              <Input
                label="Mobile Phone *"
                placeholder="+91 98291 00112"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Joining Date"
                placeholder="YYYY-MM-DD"
                value={joinDate}
                onChangeText={setJoinDate}
              />

              {/* Hotel Assignment */}
              <Text style={styles.formSectionLabel}>Assign to Hotel *</Text>
              <View style={styles.hotelSelectRow}>
                <TouchableOpacity
                  style={[
                    styles.hotelOptBtn,
                    targetHotelId === 'h-villa' && styles.hotelOptBtnActive,
                  ]}
                  onPress={() => setTargetHotelId('h-villa')}
                >
                  <Text
                    style={[
                      styles.hotelOptText,
                      targetHotelId === 'h-villa' && styles.hotelOptTextActive,
                    ]}
                  >
                    THE VILLA
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.hotelOptBtn,
                    targetHotelId === 'h-navkar' && styles.hotelOptBtnActive,
                  ]}
                  onPress={() => setTargetHotelId('h-navkar')}
                >
                  <Text
                    style={[
                      styles.hotelOptText,
                      targetHotelId === 'h-navkar' && styles.hotelOptTextActive,
                    ]}
                  >
                    NAVKAR PALACE
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title={editingStaff ? 'Save Changes' : 'Create Staff Member'}
                onPress={handleSaveStaff}
                variant="primary"
                size="lg"
                style={styles.modalSaveBtn}
              />
            </ScrollView>
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  filterChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  filterChipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  staffCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nameBlock: {
    flex: 1,
  },
  staffName: {
    ...typography.subtitle1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  staffRole: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  salaryText: {
    ...typography.captionMedium,
    color: '#047857',
    fontWeight: '800',
  },
  infoValue: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  editBtnText: {
    ...typography.captionMedium,
    color: colors.primaryNavy,
    marginLeft: 4,
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
  hotelSelectRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hotelOptBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  hotelOptBtnActive: {
    backgroundColor: colors.primaryNavy,
  },
  hotelOptText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  hotelOptTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSaveBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});

export default StaffManagementScreen;
