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
import { formatCurrency } from '../utils/formatters';
import { ChargeCategory, FolioStatus } from '../types/hotel';

export const BillingFoliosScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const {
    folios,
    billingSummary,
    settleFolio,
    addFolioCharge,
    selectedHotel,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [expandedFolioId, setExpandedFolioId] = useState<string | null>(null);

  // Add Charge Modal State
  const [targetFolioId, setTargetFolioId] = useState<string | null>(null);
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeCategory, setChargeCategory] = useState<ChargeCategory>('dining');

  // Receipt Modal State
  const [receiptFolioId, setReceiptFolioId] = useState<string | null>(null);

  const statusFilters = ['ALL', 'open', 'settled'];
  const categories: ChargeCategory[] = ['dining', 'spa', 'minibar', 'service', 'room'];

  const filteredFolios = useMemo(() => {
    return folios.filter((f) => {
      const matchesSearch =
        f.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.roomNumber.includes(searchQuery);

      const matchesStatus = selectedStatus === 'ALL' || f.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [folios, searchQuery, selectedStatus]);

  const handleAddCharge = () => {
    if (!targetFolioId || !chargeDesc.trim()) {
      Alert.alert('Required', 'Please enter a description for the charge.');
      return;
    }
    const amt = parseFloat(chargeAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid charge amount.');
      return;
    }

    addFolioCharge(targetFolioId, {
      description: chargeDesc.trim(),
      category: chargeCategory,
      amount: amt,
    });

    setTargetFolioId(null);
    setChargeDesc('');
    setChargeAmount('');
  };

  const handleSettle = (folioId: string) => {
    settleFolio(folioId, 'Credit Card (Amex Terminal)');
    Alert.alert('Folio Settled', 'Payment confirmed and ledger marked as settled.');
  };

  const receiptFolio = folios.find((f) => f.id === receiptFolioId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Billing & Folios"
        subtitle={selectedHotel.name}
        hotelBadge={`${billingSummary.todaySettlements} SETTLED`}
        showBack
        onBack={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Financial Overview Card */}
        <View style={styles.summaryCard}>
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.success }]}>
              {billingSummary.todaySettlements}
            </Text>
            <Text style={styles.statLabel}>Settled Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.warning }]}>
              {billingSummary.outstandingBalance}
            </Text>
            <Text style={styles.statLabel}>Pending Balance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{billingSummary.pendingInvoices}</Text>
            <Text style={styles.statLabel}>Open Invoices</Text>
          </View>
        </View>

        {/* Search */}
        <Input
          placeholder="Search by guest, room, or invoice code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="receipt"
          style={styles.searchInput}
        />

        {/* Filter Pills */}
        <Text style={styles.filterTitle}>LEDGER STATUS FILTER:</Text>
        <View style={styles.filterRow}>
          {statusFilters.map((st) => {
            const isActive = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {st.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            ACTIVE INVOICES & FOLIOS ({filteredFolios.length} RECORDS)
          </Text>
        </View>

        {/* Folio Cards */}
        {filteredFolios.map((folio) => {
          const isSettled = folio.status === 'settled';
          const isExpanded = expandedFolioId === folio.id;

          return (
            <View key={folio.id} style={styles.folioCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setExpandedFolioId(isExpanded ? null : folio.id)}
                style={styles.cardHeader}
              >
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.guestName}>{folio.guestName}</Text>
                  <Text style={styles.invoiceCode}>
                    {folio.invoiceNumber} • Room {folio.roomNumber}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <Badge
                    label={isSettled ? 'SETTLED' : 'OPEN'}
                    variant={isSettled ? 'success' : 'warning'}
                    size="sm"
                  />
                  <Text style={styles.totalAmt}>{formatCurrency(folio.totalAmount)}</Text>
                </View>
              </TouchableOpacity>

              {/* Collapsible Details */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  <View style={styles.sectionRowBetween}>
                    <Text style={styles.breakdownTitle}>Itemized Charges Breakdown:</Text>
                    <TouchableOpacity
                      onPress={() => setTargetFolioId(folio.id)}
                      style={styles.addChargeTag}
                    >
                      <Icon name="plus" size={12} color={colors.accentBlue} style={{ marginRight: 2 }} />
                      <Text style={styles.addChargeTagText}>Add Line Charge</Text>
                    </TouchableOpacity>
                  </View>

                  {folio.items.map((item) => (
                    <View key={item.id} style={styles.itemLine}>
                      <Text style={styles.itemDesc} numberOfLines={1}>
                        • {item.description} ({item.category.toUpperCase()})
                      </Text>
                      <Text style={styles.itemAmt}>{formatCurrency(item.amount)}</Text>
                    </View>
                  ))}

                  <View style={styles.calcDivider} />
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Subtotal:</Text>
                    <Text style={styles.calcValue}>{formatCurrency(folio.subtotal)}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Tax (10%):</Text>
                    <Text style={styles.calcValue}>{formatCurrency(folio.taxAmount)}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>Paid Deposit:</Text>
                    <Text style={styles.calcValue}>{formatCurrency(folio.paidAmount)}</Text>
                  </View>
                  <View style={styles.calcRow}>
                    <Text style={[styles.calcLabel, { fontWeight: '700' }]}>Balance Due:</Text>
                    <Text
                      style={[
                        styles.calcValue,
                        {
                          color: folio.balanceDue > 0 ? colors.error : colors.success,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {formatCurrency(folio.balanceDue)}
                    </Text>
                  </View>

                  <View style={styles.actionButtonsRow}>
                    <Button
                      title="View Receipt"
                      variant="outline"
                      size="sm"
                      icon="receipt"
                      style={{ flex: 1, marginRight: spacing.xs }}
                      onPress={() => setReceiptFolioId(folio.id)}
                    />
                    {!isSettled && (
                      <Button
                        title="Settle Folio"
                        variant="primary"
                        size="sm"
                        icon="check-circle"
                        style={{ flex: 1 }}
                        onPress={() => handleSettle(folio.id)}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {filteredFolios.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="receipt" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Invoices Found</Text>
            <Text style={styles.emptyDesc}>No billing records match the current query.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Charge Line Modal */}
      <Modal visible={targetFolioId !== null} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post Folio Room Charge</Text>
            <TouchableOpacity onPress={() => setTargetFolioId(null)} style={styles.modalCloseBtn}>
              <Icon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Input
              label="Charge Item Description"
              placeholder="e.g. In-Suite Champagne & Caviar"
              value={chargeDesc}
              onChangeText={setChargeDesc}
            />
            <Input
              label="Amount ($ USD)"
              placeholder="185"
              keyboardType="numeric"
              value={chargeAmount}
              onChangeText={setChargeAmount}
            />

            <Text style={styles.formSectionLabel}>CHARGE CATEGORY:</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setChargeCategory(cat)}
                  style={[styles.catPill, chargeCategory === cat && styles.catPillActive]}
                >
                  <Text style={[styles.catPillText, chargeCategory === cat && styles.catPillTextActive]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Post Charge to Guest Folio"
              variant="primary"
              size="lg"
              onPress={handleAddCharge}
              style={{ marginTop: spacing.lg }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal visible={receiptFolio !== undefined} animationType="fade" transparent={true}>
        <View style={styles.receiptOverlay}>
          <View style={styles.receiptPaper}>
            <View style={styles.receiptHeader}>
              <Text style={styles.hotelBrand}>{selectedHotel.name}</Text>
              <Text style={styles.hotelBrandSub}>{selectedHotel.tagline}</Text>
              <Text style={styles.receiptTitle}>OFFICIAL GUEST FOLIO RECEIPT</Text>
            </View>

            {receiptFolio && (
              <View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaText}>Invoice: {receiptFolio.invoiceNumber}</Text>
                  <Text style={styles.receiptMetaText}>Room: {receiptFolio.roomNumber}</Text>
                </View>
                <Text style={styles.receiptGuest}>Guest: {receiptFolio.guestName}</Text>

                <View style={styles.receiptDivider} />
                {receiptFolio.items.map((item) => (
                  <View key={item.id} style={styles.receiptItemRow}>
                    <Text style={styles.receiptItemDesc}>{item.description}</Text>
                    <Text style={styles.receiptItemAmt}>{formatCurrency(item.amount)}</Text>
                  </View>
                ))}

                <View style={styles.receiptDivider} />
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotalLabel}>Total Folio Due:</Text>
                  <Text style={styles.receiptTotalAmt}>{formatCurrency(receiptFolio.totalAmount)}</Text>
                </View>
                <View style={styles.receiptTotalRow}>
                  <Text style={styles.receiptTotalLabel}>Paid Amount:</Text>
                  <Text style={[styles.receiptTotalAmt, { color: colors.success }]}>
                    {formatCurrency(receiptFolio.paidAmount)}
                  </Text>
                </View>

                {receiptFolio.paymentMethod && (
                  <Text style={styles.paymentMethodNotice}>
                    Paid Via: {receiptFolio.paymentMethod}
                  </Text>
                )}
              </View>
            )}

            <Button
              title="Close Receipt"
              variant="secondary"
              size="md"
              onPress={() => setReceiptFolioId(null)}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </View>
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
  summaryCard: {
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
  statNum: {
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
  filterTitle: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 12,
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
  folioCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  guestName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  invoiceCode: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  totalAmt: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
    marginTop: 2,
  },
  expandedSection: {
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  breakdownTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  addChargeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
  },
  addChargeTagText: {
    ...typography.captionBold,
    color: colors.accentBlue,
    fontSize: 10,
  },
  itemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  itemDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  itemAmt: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  calcDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  calcLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calcValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
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
  receiptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  receiptPaper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...shadows.lg,
  },
  receiptHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  hotelBrand: {
    ...typography.h4,
    color: colors.primaryNavy,
  },
  hotelBrandSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  receiptTitle: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 4,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  receiptMetaText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  receiptGuest: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptItemDesc: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  receiptItemAmt: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  receiptTotalLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  receiptTotalAmt: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
  },
  paymentMethodNotice: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
