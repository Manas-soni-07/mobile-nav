import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { useNavigation } from '../hooks/useNavigation';
import { useHotel } from '../hooks/useHotel';
import { Header } from '../components/common/Header';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { StaffDepartment, StaffShift, AttendanceStatus } from '../types/hotel';

export const AttendanceScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { staff, attendanceSummary, updateStaffAttendance, addStaffMember, selectedHotel } =
    useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState<StaffDepartment>('Front Desk');
  const [newShift, setNewShift] = useState<StaffShift>('Morning');
  const [newPhone, setNewPhone] = useState('');

  const departments: (StaffDepartment | 'ALL')[] = [
    'ALL',
    'Front Desk',
    'Housekeeping',
    'Food & Beverage',
    'Maintenance',
    'Security',
    'Management',
  ];

  const shifts: (StaffShift | 'ALL')[] = ['ALL', 'Morning', 'Afternoon', 'Night', 'Full Day'];

  // Filtered staff roster
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || member.department === selectedDept;
      const matchesShift = selectedShift === 'ALL' || member.shift === selectedShift;

      return matchesSearch && matchesDept && matchesShift;
    });
  }, [staff, searchQuery, selectedDept, selectedShift]);

  const handleCycleStatus = (staffId: string, currentStatus: AttendanceStatus) => {
    const statusCycle: AttendanceStatus[] = ['present', 'on_leave', 'absent', 'late'];
    const nextIndex = (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIndex];
    const checkInTime = nextStatus === 'present' ? '08:00 AM' : nextStatus === 'late' ? '08:45 AM' : undefined;

    updateStaffAttendance(staffId, nextStatus, checkInTime);
  };

  const handleCreateStaff = () => {
    if (!newFullName.trim() || !newRole.trim()) {
      Alert.alert('Required Fields', 'Please enter employee full name and job title.');
      return;
    }

    addStaffMember({
      hotelId: selectedHotel.id,
      fullName: newFullName.trim(),
      role: newRole.trim(),
      department: newDept,
      shift: newShift,
      status: 'present',
      checkInTime: '08:00 AM',
      phone: newPhone.trim() || '+1 (555) 000-0000',
    });

    setNewFullName('');
    setNewRole('');
    setNewPhone('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <Header
        title="Staff Attendance"
        subtitle={selectedHotel.name}
        hotelBadge={`${attendanceSummary.presentStaff}/${attendanceSummary.totalStaff} ON DUTY`}
        showBack
        onBack={goBack}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowAddModal(true)}
            style={styles.addBtn}
          >
            <Icon name="plus" size={16} color={colors.accentBlue} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Counter Card */}
        <View style={styles.summaryBar}>
          <View style={styles.statCol}>
            <Text style={styles.statNumber}>{attendanceSummary.totalStaff}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {attendanceSummary.presentStaff}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>
              {attendanceSummary.onLeaveStaff}
            </Text>
            <Text style={styles.statLabel}>On Leave</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {attendanceSummary.absentStaff}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        {/* Search Bar */}
        <Input
          placeholder="Search by name, role, or employee code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="users"
          style={styles.searchInput}
        />

        {/* Department Filter Pills */}
        <Text style={styles.filterLabel}>DEPARTMENT FILTER:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {departments.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <TouchableOpacity
                key={dept}
                onPress={() => setSelectedDept(dept)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Shift Filter Pills */}
        <Text style={styles.filterLabel}>SHIFT FILTER:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {shifts.map((shift) => {
            const isActive = selectedShift === shift;
            return (
              <TouchableOpacity
                key={shift}
                onPress={() => setSelectedShift(shift)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {shift}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Roster Section Title */}
        <View style={styles.rosterHeader}>
          <Text style={styles.rosterTitle}>
            ACTIVE ROSTER ({filteredStaff.length} EMPLOYEES)
          </Text>
          <Text style={styles.rosterHint}>Tap status to cycle</Text>
        </View>

        {/* Staff Members List */}
        {filteredStaff.map((member) => {
          const isPresent = member.status === 'present';
          const isLate = member.status === 'late';
          const isOnLeave = member.status === 'on_leave';

          const badgeVariant = isPresent
            ? 'success'
            : isLate
            ? 'warning'
            : isOnLeave
            ? 'neutral'
            : 'error';

          return (
            <TouchableOpacity
              key={member.id}
              activeOpacity={0.7}
              onPress={() => handleCycleStatus(member.id, member.status)}
              style={styles.staffCard}
            >
              <View style={styles.staffCardRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {member.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </Text>
                </View>

                <View style={styles.staffInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.staffName}>{member.fullName}</Text>
                    <Badge
                      label={member.status.replace('_', ' ').toUpperCase()}
                      variant={badgeVariant}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.staffRole}>
                    {member.role} • {member.department}
                  </Text>
                  <View style={styles.shiftDetailsRow}>
                    <Text style={styles.shiftText}>Shift: {member.shift}</Text>
                    {member.checkInTime && (
                      <Text style={styles.checkInText}>• In: {member.checkInTime}</Text>
                    )}
                    <Text style={styles.empCodeText}>• {member.employeeCode}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredStaff.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="users" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Employees Found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search query or filter selection.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Employee to Roster</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseBtn}
            >
              <Icon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Input
              label="Full Name"
              placeholder="e.g. Julian Thorne"
              value={newFullName}
              onChangeText={setNewFullName}
            />
            <Input
              label="Job Title / Role"
              placeholder="e.g. Front Desk Officer"
              value={newRole}
              onChangeText={setNewRole}
            />
            <Input
              label="Contact Phone"
              placeholder="+1 (555) 123-4567"
              value={newPhone}
              onChangeText={setNewPhone}
            />

            <Text style={styles.formSectionLabel}>DEPARTMENT:</Text>
            <View style={styles.formPillGrid}>
              {departments
                .filter((d) => d !== 'ALL')
                .map((dept) => (
                  <TouchableOpacity
                    key={dept}
                    onPress={() => setNewDept(dept as StaffDepartment)}
                    style={[styles.formPill, newDept === dept && styles.formPillActive]}
                  >
                    <Text
                      style={[styles.formPillText, newDept === dept && styles.formPillTextActive]}
                    >
                      {dept}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.formSectionLabel}>SHIFT:</Text>
            <View style={styles.formPillGrid}>
              {shifts
                .filter((s) => s !== 'ALL')
                .map((shift) => (
                  <TouchableOpacity
                    key={shift}
                    onPress={() => setNewShift(shift as StaffShift)}
                    style={[styles.formPill, newShift === shift && styles.formPillActive]}
                  >
                    <Text
                      style={[
                        styles.formPillText,
                        newShift === shift && styles.formPillTextActive,
                      ]}
                    >
                      {shift}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Button
              title="Save Employee to Roster"
              variant="primary"
              size="lg"
              onPress={handleCreateStaff}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0E1F2',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  filterLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  filterScroll: {
    paddingBottom: spacing.xs,
    marginBottom: 2,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  filterPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
  rosterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  rosterTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  rosterHint: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accentBlue,
  },
  staffCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  staffCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitials: {
    ...typography.bodySemiBold,
    color: colors.surface,
  },
  staffInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  staffRole: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  shiftDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  shiftText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  checkInText: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.success,
    marginLeft: 4,
  },
  empCodeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.primaryNavy,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: spacing.lg,
  },
  formSectionLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  formPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  formPillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  formPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  formPillTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
});
