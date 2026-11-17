/**
 * ResortOS - Staff Salary Advances Screen (Admin Only)
 * Record, view, and track staff salary advance loans and auto-deduction status.
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
import { StaffAdvance } from '../types/hotel';
import { formatCurrency } from '../utils/formatters';

export const SalaryAdvancesScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { hotels } = useHotel();

  // Initial advances
  const [advances, setAdvances] = useState<StaffAdvance[]>([
    {
      id: 'adv-v-01',
      hotelId: 'h-villa',
      staffId: 'stf-v-1',
      staffName: 'Manoj Kumar',
      staffRole: 'Receptionist (THE VILLA)',
      advanceDate: '2026-11-05',
      amount: 3000,
      reason: 'Medical emergency for mother',
      paymentMethod: 'Cash',
      isDeducted: false,
      deductedMonth: 'Nov 2026 (Pending)',
    },
    {
      id: 'adv-n-01',
      hotelId: 'h-navkar',
      staffId: 'stf-n-2',
      staffName: 'Kamla Devi',
      staffRole: 'Housekeeping Incharge (NAVKAR PALACE)',
      advanceDate: '2026-10-12',
      amount: 2000,
      reason: 'Diwali family festival expense',
      paymentMethod: 'UPI',
      isDeducted: true,
      deductedMonth: 'October 2026 (Settled)',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [filterHotel, setFilterHotel] = useState<'all' | 'h-villa' | 'h-navkar'>('all');

  // Form states
  const [staffName, setStaffName] = useState('');
  const [targetHotelId, setTargetHotelId] = useState('h-villa');
  const [amount, setAmount] = useState('2000');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [advanceDate, setAdvanceDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredAdvances = useMemo(() => {
    if (filterHotel === 'all') return advances;
    return advances.filter((a) => a.hotelId === filterHotel);
  }, [advances, filterHotel]);

  const totalOutstanding = useMemo(() => {
    return filteredAdvances
      .filter((a) => !a.isDeducted)
      .reduce((sum, a) => sum + a.amount, 0);
  }, [filteredAdvances]);

  const handleCreateAdvance = () => {
    if (!staffName.trim() || !amount.trim()) {
      Alert.alert('Required Fields', 'Please enter staff name and advance amount');
      return;
    }

    const amt = parseFloat(amount) || 0;
    const hotelName = targetHotelId === 'h-villa' ? 'THE VILLA' : 'NAVKAR PALACE';

    const newAdv: StaffAdvance = {
      id: `adv-${Date.now()}`,
      hotelId: targetHotelId,
      staffId: `stf-custom-${Date.now()}`,
      staffName,
      staffRole: `Staff Member (${hotelName})`,
      advanceDate,
      amount: amt,
      reason: reason || 'Salary advance',
      paymentMethod,
      isDeducted: false,
      deductedMonth: 'Upcoming Salary (Pending)',
    };

    setAdvances((prev) => [newAdv, ...prev]);
    setModalVisible(false);
  };

  const toggleDeducted = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              isDeducted: !a.isDeducted,
              deductedMonth: !a.isDeducted ? 'Manually Settled' : 'Pending Deduction',
            }
          : a
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Staff Salary Advances"
        subtitle="Admin Access • Advance Recording & Deductions"
        showBack
        onBack={goBack}
        rightAction={
          <Button
            title="+ New Advance"
            size="sm"
            variant="primary"
            onPress={() => {
              setStaffName('');
              setAmount('2000');
              setReason('');
              setModalVisible(true);
            }}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Outstanding Advance Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Icon name="arrow-down-circle" size={24} color={colors.error} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Active Unrecovered Advances</Text>
            <Text style={styles.bannerAmount}>{formatCurrency(totalOutstanding)}</Text>
            <Text style={styles.bannerSub}>Automatically deducted in monthly payroll calculation</Text>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.chip, filterHotel === 'all' && styles.chipActive]}
            onPress={() => setFilterHotel('all')}
          >
            <Text style={[styles.chipText, filterHotel === 'all' && styles.chipTextActive]}>
              All Hotels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterHotel === 'h-villa' && styles.chipActive]}
            onPress={() => setFilterHotel('h-villa')}
          >
            <Text style={[styles.chipText, filterHotel === 'h-villa' && styles.chipTextActive]}>
              The Villa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterHotel === 'h-navkar' && styles.chipActive]}
            onPress={() => setFilterHotel('h-navkar')}
          >
            <Text style={[styles.chipText, filterHotel === 'h-navkar' && styles.chipTextActive]}>
              Navkar Palace
            </Text>
          </TouchableOpacity>
        </View>

        {/* Advances List */}
        <Text style={styles.sectionHeader}>Advance Records ({filteredAdvances.length})</Text>

        {filteredAdvances.map((adv) => (
          <Card key={adv.id} padding="lg" variant="elevated" style={styles.advCard}>
            <View style={styles.cardHeader}>
              <View style={styles.staffBlock}>
                <Text style={styles.staffName}>{adv.staffName}</Text>
                <Text style={styles.roleSub}>{adv.staffRole}</Text>
              </View>
              <Badge
                label={adv.isDeducted ? 'DEDUCTED' : 'PENDING'}
                variant={adv.isDeducted ? 'success' : 'warning'}
                size="sm"
              />
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Advance Amount:</Text>
                <Text style={styles.amountText}>{formatCurrency(adv.amount)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Disbursement Date:</Text>
                <Text style={styles.infoVal}>{adv.advanceDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Payment Mode:</Text>
                <Text style={styles.infoVal}>{adv.paymentMethod}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Reason:</Text>
                <Text style={styles.infoVal}>{adv.reason}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Deduction Status:</Text>
                <Text style={[styles.infoVal, { color: adv.isDeducted ? colors.success : colors.textSecondary }]}>
                  {adv.deductedMonth}
                </Text>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  adv.isDeducted ? styles.undeductBtn : styles.deductBtn,
                ]}
                onPress={() => toggleDeducted(adv.id)}
              >
                <Icon
                  name={adv.isDeducted ? 'rotate-ccw' : 'check'}
                  size={14}
                  color={adv.isDeducted ? colors.textSecondary : '#047857'}
                />
                <Text
                  style={[
                    styles.toggleBtnText,
                    { color: adv.isDeducted ? colors.textSecondary : '#047857' },
                  ]}
                >
                  {adv.isDeducted ? 'Mark as Pending' : 'Mark as Deducted'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* New Advance Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Staff Salary Advance</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Staff Member Full Name *"
                placeholder="e.g. Manoj Kumar"
                value={staffName}
                onChangeText={setStaffName}
              />
              <Input
                label="Advance Amount (₹ INR) *"
                placeholder="2000"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Input
                label="Disbursement Date"
                placeholder="YYYY-MM-DD"
                value={advanceDate}
                onChangeText={setAdvanceDate}
              />
              <Input
                label="Reason / Purpose"
                placeholder="e.g. Medical emergency, urgent travel"
                value={reason}
                onChangeText={setReason}
              />

              {/* Hotel Assignment */}
              <Text style={styles.formSectionLabel}>Hotel Property *</Text>
              <View style={styles.hotelSelectRow}>
                <TouchableOpacity
                  style={[
                    styles.hotelOptBtn,
                    targetHotelId === 'h-villa' && styles.hotelOptBtnActive,
                  ]}
                  onPress={() => setTargetHotelId('h-villa')}
                >
                  <Text style={[styles.hotelOptText, targetHotelId === 'h-villa' && styles.hotelOptTextActive]}>
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
                  <Text style={[styles.hotelOptText, targetHotelId === 'h-navkar' && styles.hotelOptTextActive]}>
                    NAVKAR PALACE
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Payment Method Selector */}
              <Text style={styles.formSectionLabel}>Disbursement Payment Mode *</Text>
              <View style={styles.hotelSelectRow}>
                {(['Cash', 'UPI', 'Bank Transfer'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.hotelOptBtn,
                      paymentMethod === m && styles.hotelOptBtnActive,
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.hotelOptText,
                        paymentMethod === m && styles.hotelOptTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Record & Disburse Advance"
                onPress={handleCreateAdvance}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerIcon: {
    marginRight: spacing.md,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.caption,
    color: '#991B1B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerAmount: {
    ...typography.h2,
    color: '#DC2626',
    fontWeight: '800',
    marginTop: 2,
  },
  bannerSub: {
    ...typography.caption,
    color: '#7F1D1D',
    marginTop: 2,
    fontSize: 11,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  chipText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  advCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  staffBlock: {
    flex: 1,
  },
  staffName: {
    ...typography.subtitle1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  roleSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
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
  amountText: {
    ...typography.subtitle2,
    color: '#DC2626',
    fontWeight: '800',
  },
  infoVal: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  deductBtn: {
    backgroundColor: '#ECFDF5',
  },
  undeductBtn: {
    backgroundColor: '#F1F5F9',
  },
  toggleBtnText: {
    ...typography.captionMedium,
    marginLeft: 4,
    fontWeight: '600',
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

export default SalaryAdvancesScreen;
