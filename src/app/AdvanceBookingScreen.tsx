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
import { BookingStatus, RoomCategory } from '../types/hotel';

export const AdvanceBookingScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const {
    bookings,
    advanceBookingSummary,
    createBooking,
    cancelBooking,
    selectedHotel,
  } = useHotel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Add Reservation Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [category, setCategory] = useState<RoomCategory>('Deluxe Ocean Suite');
  const [nights, setNights] = useState('4');
  const [adults, setAdults] = useState('2');
  const [specialRequests, setSpecialRequests] = useState('');

  const statusFilters = ['ALL', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  const roomCategories: RoomCategory[] = [
    'Deluxe Ocean Suite',
    'Royal Penthouse',
    'Executive Villa',
    'Garden View Villa',
    'Classic King Suite',
  ];

  const categoryRates: { [cat in RoomCategory]: number } = {
    'Deluxe Ocean Suite': 350,
    'Royal Penthouse': 950,
    'Executive Villa': 550,
    'Garden View Villa': 420,
    'Classic King Suite': 280,
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, selectedStatus]);

  const handleCreateReservation = () => {
    if (!guestName.trim()) {
      Alert.alert('Required Field', 'Please enter guest full name.');
      return;
    }

    const numNights = parseInt(nights, 10) || 3;
    const numGuests = parseInt(adults, 10) || 2;
    const rate = categoryRates[category] || 350;
    const totalAmount = numNights * rate;
    const depositPaid = Math.round(totalAmount * 0.5);

    createBooking({
      hotelId: selectedHotel.id,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || '+1 (555) 303-9911',
      guestEmail: guestEmail.trim() || `${guestName.toLowerCase().replace(/\s+/g, '.')}@resortos-guest.com`,
      roomCategory: category,
      checkInDate: '2026-11-20',
      checkOutDate: '2026-11-24',
      nightsCount: numNights,
      numberOfGuests: numGuests,
      status: 'confirmed',
      totalAmount,
      depositPaid,
      paymentStatus: 'partial',
      specialRequests: specialRequests.trim() || 'Advance VIP Reservation entry',
    });

    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setSpecialRequests('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Advance Bookings"
        subtitle={selectedHotel.name}
        hotelBadge={`${advanceBookingSummary.upcomingCount} UPCOMING`}
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
        {/* KPI Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{advanceBookingSummary.upcomingCount}</Text>
            <Text style={styles.statLabel}>Active Pipeline</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: colors.success }]}>
              {advanceBookingSummary.confirmedRevenue}
            </Text>
            <Text style={styles.statLabel}>Confirmed Rev.</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{advanceBookingSummary.next7DaysArrivals}</Text>
            <Text style={styles.statLabel}>Next 7 Days</Text>
          </View>
        </View>

        {/* Search Input */}
        <Input
          placeholder="Search by guest, booking code, or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="calendar"
          style={styles.searchInput}
        />

        {/* Status Filter Pills */}
        <Text style={styles.filterTitle}>RESERVATION STATUS:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {statusFilters.map((st) => {
            const isActive = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {st.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            BOOKINGS LEDGER ({filteredBookings.length} RESERVATIONS)
          </Text>
        </View>

        {/* Bookings List */}
        {filteredBookings.map((b) => {
          const isConfirmed = b.status === 'confirmed';
          const isCheckedIn = b.status === 'checked_in';
          const isCancelled = b.status === 'cancelled';

          const badgeVariant = isConfirmed
            ? 'primary'
            : isCheckedIn
            ? 'success'
            : isCancelled
            ? 'error'
            : 'neutral';

          return (
            <View key={b.id} style={styles.bookingCard}>
              <View style={styles.cardTop}>
                <View style={styles.guestCol}>
                  <Text style={styles.guestName}>{b.guestName}</Text>
                  <Text style={styles.refText}>
                    {b.bookingReference} • {b.roomCategory}
                  </Text>
                </View>
                <Badge
                  label={b.status.replace('_', ' ').toUpperCase()}
                  variant={badgeVariant}
                  size="sm"
                />
              </View>

              <View style={styles.dateRow}>
                <Icon name="clock" size={13} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <Text style={styles.dateText}>
                  {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)} ({b.nightsCount} Nights • {b.numberOfGuests} Guests)
                </Text>
              </View>

              {b.roomNumber && (
                <View style={styles.roomTagRow}>
                  <Icon name="key" size={12} color={colors.accentBlue} style={{ marginRight: 4 }} />
                  <Text style={styles.roomTagText}>Assigned Room: {b.roomNumber}</Text>
                </View>
              )}

              {b.specialRequests && (
                <View style={styles.requestsBox}>
                  <Text style={styles.requestsText} numberOfLines={2}>
                    Note: {b.specialRequests}
                  </Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                <View>
                  <Text style={styles.totalValue}>{formatCurrency(b.totalAmount)}</Text>
                  <Text style={styles.depositText}>
                    Deposit: {formatCurrency(b.depositPaid)} ({b.paymentStatus.toUpperCase()})
                  </Text>
                </View>

                {isConfirmed && (
                  <TouchableOpacity
                    onPress={() => cancelBooking(b.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.cancelActionBtn}
                  >
                    <Text style={styles.cancelActionText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        {filteredBookings.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={36} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Reservations Found</Text>
            <Text style={styles.emptyDesc}>No bookings match the specified filters.</Text>
          </View>
        )}
      </ScrollView>

      {/* Full Create Reservation Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Reservation Request</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseBtn}
            >
              <Icon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Input
              label="Guest Full Name"
              placeholder="e.g. Vivienne Montgomery"
              value={guestName}
              onChangeText={setGuestName}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 789-0123"
              value={guestPhone}
              onChangeText={setGuestPhone}
            />
            <Input
              label="Email Address"
              placeholder="guest@domain.com"
              value={guestEmail}
              onChangeText={setGuestEmail}
            />

            <Text style={styles.formSectionLabel}>SELECT ROOM CATEGORY:</Text>
            {roomCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.categoryChoice, category === cat && styles.categoryChoiceActive]}
              >
                <View>
                  <Text
                    style={[
                      styles.categoryName,
                      category === cat && styles.categoryNameActive,
                    ]}
                  >
                    {cat}
                  </Text>
                  <Text style={styles.categoryRate}>${categoryRates[cat]} / night</Text>
                </View>
                {category === cat && <Badge label="SELECTED" variant="primary" size="sm" />}
              </TouchableOpacity>
            ))}

            <View style={styles.numFieldsRow}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input
                  label="Nights Count"
                  placeholder="4"
                  keyboardType="numeric"
                  value={nights}
                  onChangeText={setNights}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Guests Count"
                  placeholder="2"
                  keyboardType="numeric"
                  value={adults}
                  onChangeText={setAdults}
                />
              </View>
            </View>

            <Input
              label="Special Requests / Concierge Notes"
              placeholder="e.g. Ocean view preferred, airport chauffeur"
              value={specialRequests}
              onChangeText={setSpecialRequests}
            />

            <View style={styles.estSummary}>
              <Text style={styles.estLabel}>Estimated Total Amount:</Text>
              <Text style={styles.estValue}>
                {formatCurrency((parseInt(nights, 10) || 3) * (categoryRates[category] || 350))}
              </Text>
            </View>

            <Button
              title="Confirm & Save Reservation"
              variant="primary"
              size="lg"
              onPress={handleCreateReservation}
              style={{ marginTop: spacing.md }}
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
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  guestCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  guestName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  refText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  roomTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  roomTagText: {
    ...typography.captionBold,
    color: colors.accentBlue,
    fontSize: 11,
  },
  requestsBox: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.xs,
    padding: 6,
    marginTop: spacing.xs,
  },
  requestsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  totalValue: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
  },
  depositText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  cancelActionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelActionText: {
    ...typography.captionBold,
    color: colors.error,
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
  categoryChoice: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 6,
  },
  categoryChoiceActive: {
    borderColor: colors.accentBlue,
    backgroundColor: colors.primaryTint,
  },
  categoryName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  categoryNameActive: {
    color: colors.accentBlue,
  },
  categoryRate: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  numFieldsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  estSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  estLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  estValue: {
    ...typography.h3,
    color: colors.primaryNavy,
  },
});
