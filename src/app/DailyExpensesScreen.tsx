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
import { formatCurrency, formatDate } from '../utils/formatters';
import { ExpenseCategory } from '../types/hotel';

export const DailyExpensesScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const { expenses, expensesSummary, recordExpense, selectedHotel } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('F&B Provisions');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');

  const categories: (ExpenseCategory | 'ALL')[] = [
    'ALL',
    'F&B Provisions',
    'Housekeeping Supplies',
    'Utilities & Maintenance',
    'Staff Payroll',
    'Marketing',
    'Operations',
  ];

  const paymentMethods = ['Corporate Card', 'Bank Wire', 'Cash Voucher', 'Supplier Invoicing'];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchQuery, selectedCategory]);

  const handleRecordExpense = () => {
    if (!title.trim() || !vendor.trim()) {
      Alert.alert('Required Fields', 'Please enter expense description and vendor name.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense disbursement amount.');
      return;
    }

    recordExpense({
      hotelId: selectedHotel.id,
      title: title.trim(),
      category,
      amount: numAmount,
      vendor: vendor.trim(),
      recordedBy: 'Duty Manager',
      paymentMethod,
    });

    setTitle('');
    setAmount('');
    setVendor('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Daily Expenses"
        subtitle={selectedHotel.name}
        hotelBadge={`${expensesSummary.todayTotal} TODAY`}
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
        {/* Total Expense Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerSubtitle}>TOTAL OPERATIONAL DISBURSEMENTS</Text>
          <Text style={styles.bannerTotal}>{expensesSummary.todayTotal}</Text>
          <Text style={styles.bannerNote}>
            {expenses.length} expense batches logged for active shift
          </Text>

          {/* Categories Pill Grid */}
          <View style={styles.categoryPills}>
            {expensesSummary.categories.map((c) => (
              <View key={c.name} style={styles.categoryPill}>
                <Text style={styles.categoryName}>{c.name}:</Text>
                <Text style={styles.categoryAmt}>{c.amount}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Search */}
        <Input
          placeholder="Search by expense title, vendor, or recorder..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="dollar-sign"
          style={styles.searchInput}
        />

        {/* Category Filters */}
        <Text style={styles.filterTitle}>DISBURSEMENT CATEGORY FILTER:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            EXPENSE AUDIT TRAIL ({filteredExpenses.length} ENTRIES)
          </Text>
        </View>

        {/* Expense Cards */}
        {filteredExpenses.map((e) => (
          <View key={e.id} style={styles.expenseCard}>
            <View style={styles.expenseHeader}>
              <View style={styles.expenseLeft}>
                <Text style={styles.expenseTitle}>{e.title}</Text>
                <Text style={styles.expenseVendor}>
                  Vendor: {e.vendor} • Recorded by {e.recordedBy}
                </Text>
                <Text style={styles.expenseDate}>
                  {formatDate(e.date)} • Payment via {e.paymentMethod}
                </Text>
              </View>

              <View style={styles.expenseRight}>
                <Text style={styles.expenseAmount}>-{formatCurrency(e.amount)}</Text>
                <Badge label={e.category} variant="warning" size="sm" />
              </View>
            </View>
          </View>
        ))}

        {filteredExpenses.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="dollar-sign" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Expenses Found</Text>
            <Text style={styles.emptyDesc}>No disbursements match the selected filter criteria.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Record Operational Expense</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalCloseBtn}>
              <Icon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Input
              label="Expense Title / Description"
              placeholder="e.g. Organic Produce & Wine Restock"
              value={title}
              onChangeText={setTitle}
            />
            <Input
              label="Disbursement Amount ($ USD)"
              placeholder="1250"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <Input
              label="Vendor / Supplier Name"
              placeholder="e.g. Coastal Fresh Foods Ltd."
              value={vendor}
              onChangeText={setVendor}
            />

            <Text style={styles.formSectionLabel}>EXPENSE CATEGORY:</Text>
            <View style={styles.categoryGrid}>
              {categories
                .filter((c) => c !== 'ALL')
                .map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat as ExpenseCategory)}
                    style={[styles.catPill, category === cat && styles.catPillActive]}
                  >
                    <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.formSectionLabel}>PAYMENT METHOD:</Text>
            <View style={styles.categoryGrid}>
              {paymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm}
                  onPress={() => setPaymentMethod(pm)}
                  style={[styles.catPill, paymentMethod === pm && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, paymentMethod === pm && styles.catPillTextActive]}>
                    {pm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Save Disbursement Record"
              variant="primary"
              size="lg"
              onPress={handleRecordExpense}
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
  bannerCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  bannerSubtitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  bannerTotal: {
    ...typography.h1,
    color: colors.error,
    marginTop: 2,
  },
  bannerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  categoryPill: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    marginRight: spacing.xs,
    marginTop: 4,
  },
  categoryName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginRight: 4,
  },
  categoryAmt: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 10,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  filterTitle: {
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
  listHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  listTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  expenseCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  expenseTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  expenseVendor: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expenseDate: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    ...typography.bodySemiBold,
    color: colors.error,
    marginBottom: 4,
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
    paddingBottom: spacing.xxxl,
  },
  formSectionLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  catPillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  catPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  catPillTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
});
