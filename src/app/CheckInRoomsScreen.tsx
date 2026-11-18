/**
 * ResortOS - Check-In, Check-Out & Room Operations
 * Fast walk-in check-in, detailed check-out billing (Rent + manual food/water - discount + tax - advance),
 * and complete room lifecycle management (Available -> Reserved -> Occupied -> Cleaning -> Available).
 */

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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { useNavigation } from '../hooks/useNavigation';
import { useHotel } from '../hooks/useHotel';
import { Header } from '../components/common/Header';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/formatters';
import { RoomStatus, Room, Booking } from '../types/hotel';

interface ExtraChargeItem {
  id: string;
  name: string;
  amount: number;
}

export const CheckInRoomsScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const {
    todayArrivals,
    rooms,
    availableRooms,
    checkInGuest,
    checkOutGuest,
    updateRoomStatus,
    selectedHotel,
    createBooking,
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'arrivals' | 'inventory'>('arrivals');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('ALL');

  // --- Walk-in Check-in Modal ---
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInRoomId, setWalkInRoomId] = useState('');
  const [walkInGuestName, setWalkInGuestName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('+91 ');
  const [walkInAddress, setWalkInAddress] = useState('');
  const [walkInIdType, setWalkInIdType] = useState('Aadhaar Card');
  const [walkInIdNumber, setWalkInIdNumber] = useState('');
  const [walkInGuestsCount, setWalkInGuestsCount] = useState('2');
  const [walkInRent, setWalkInRent] = useState('2500');
  const [walkInAdvance, setWalkInAdvance] = useState('2500');
  const [walkInCheckInDate, setWalkInCheckInDate] = useState('2026-11-16');
  const [walkInCheckOutDate, setWalkInCheckOutDate] = useState('2026-11-17');

  // --- Check-out Folio Settlement Modal ---
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [activeCheckOutBooking, setActiveCheckOutBooking] = useState<Booking | null>(null);
  const [activeCheckOutRoom, setActiveCheckOutRoom] = useState<Room | null>(null);
  const [extraItems, setExtraItems] = useState<ExtraChargeItem[]>([
    { id: '1', name: 'Mineral Water (2 Bottles)', amount: 60 },
    { id: '2', name: 'Evening Chai & Snacks', amount: 220 },
  ]);
  const [newExtraName, setNewExtraName] = useState('');
  const [newExtraAmount, setNewExtraAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  // Status Filter Options
  const statusFilters = ['ALL', 'available', 'occupied', 'cleaning', 'maintenance'];

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchesSearch =
        r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.currentGuestName && r.currentGuestName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = roomStatusFilter === 'ALL' || r.status === roomStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchQuery, roomStatusFilter]);

  // Filtered arrivals
  const filteredArrivals = useMemo(() => {
    return todayArrivals.filter((a) => {
      return (
        a.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.roomNumber && a.roomNumber.includes(searchQuery))
      );
    });
  }, [todayArrivals, searchQuery]);

  // --- Walk-in Handler ---
  const handleWalkInCheckIn = () => {
    if (!walkInRoomId) {
      Alert.alert('Select Room', 'Please select a vacant room for check-in');
      return;
    }
    if (!walkInGuestName.trim()) {
      Alert.alert('Required Field', 'Please enter guest full name');
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === walkInRoomId);
    const rent = parseFloat(walkInRent) || 2500;
    const advance = parseFloat(walkInAdvance) || 0;

    // Create a confirmed booking and immediately check-in
    const newBooking = createBooking({
      hotelId: selectedHotel.id,
      guestName: walkInGuestName,
      guestPhone: walkInPhone,
      guestEmail: `${walkInGuestName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      roomCategory: selectedRoom?.category || 'Deluxe Room',
      roomId: walkInRoomId,
      roomNumber: selectedRoom?.roomNumber || '101',
      checkInDate: walkInCheckInDate,
      checkOutDate: walkInCheckOutDate,
      nightsCount: 1,
      numberOfGuests: parseInt(walkInGuestsCount, 10) || 2,
      status: 'checked_in',
      totalAmount: rent,
      depositPaid: advance,
      paymentStatus: advance >= rent ? 'paid' : advance > 0 ? 'partial' : 'unpaid',
      specialRequests: `Walk-in Guest. ID: ${walkInIdType} - ${walkInIdNumber}`,
    });

    // Mark room as occupied
    updateRoomStatus(walkInRoomId, 'occupied', 'clean');

    setShowWalkInModal(false);
    Alert.alert(
      'Walk-In Successful',
      `Guest ${walkInGuestName} checked in to Room ${selectedRoom?.roomNumber}!`
    );
  };

  // --- Check-out Modal Opener ---
  const openCheckOutModal = (booking: Booking) => {
    setActiveCheckOutBooking(booking);
    const assignedRoom = rooms.find((r) => r.id === booking.roomId || r.roomNumber === booking.roomNumber);
    setActiveCheckOutRoom(assignedRoom || null);
    setExtraItems([
      { id: '1', name: 'Mineral Water (2 Bottles)', amount: 60 },
      { id: '2', name: 'Evening Tea / Snacks', amount: 220 },
    ]);
    setDiscountAmount('0');
    setPaymentMode('UPI');
    setShowCheckOutModal(true);
  };

  // Check-out calculation (Rent + Extras - Discount + 18% GST - Advance)
  const folioCalc = useMemo(() => {
    if (!activeCheckOutBooking) return { rent: 0, extras: 0, subtotal: 0, discount: 0, tax: 0, advance: 0, balance: 0 };

    const rent = activeCheckOutBooking.totalAmount || 2500;
    const extras = extraItems.reduce((sum, item) => sum + item.amount, 0);
    const disc = parseFloat(discountAmount) || 0;
    const taxable = Math.max(0, rent + extras - disc);
    const tax = Math.round(taxable * 0.18);
    const advance = activeCheckOutBooking.depositPaid || 0;
    const balance = Math.max(0, taxable + tax - advance);

    return { rent, extras, subtotal: rent + extras, discount: disc, tax, advance, balance };
  }, [activeCheckOutBooking, extraItems, discountAmount]);

  const handleAddExtraItem = () => {
    if (!newExtraName.trim() || !newExtraAmount.trim()) return;
    const amt = parseFloat(newExtraAmount) || 0;
    setExtraItems((prev) => [...prev, { id: `${Date.now()}`, name: newExtraName, amount: amt }]);
    setNewExtraName('');
    setNewExtraAmount('');
  };

  const handleConfirmCheckOut = () => {
    if (!activeCheckOutBooking) return;

    // Check out guest in context
    checkOutGuest(activeCheckOutBooking.id);

    // CRITICAL: Room status becomes CLEANING on checkout!
    if (activeCheckOutRoom) {
      updateRoomStatus(activeCheckOutRoom.id, 'cleaning', 'dirty');
    }

    setShowCheckOutModal(false);
    Alert.alert(
      'Checkout Settled & Room Marked for Cleaning',
      `Payment of ${formatCurrency(folioCalc.balance)} recorded via ${paymentMode}.\n\nRoom ${
        activeCheckOutRoom?.roomNumber || 'Assigned Room'
      } is now set to CLEANING status. Manager can mark Available once sanitized.`
    );
  };

  // One-tap Cleaning -> Available transition
  const handleMarkCleanAndAvailable = (roomId: string, roomNum: string) => {
    updateRoomStatus(roomId, 'available', 'clean');
    Alert.alert('Room Cleaned', `Room ${roomNum} is now inspected and Available for check-in.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Check-In / Check-Out"
        subtitle={selectedHotel.name}
        hotelBadge={`${availableRooms.length} VACANT CLEAN`}
        showBack
        onBack={goBack}
        rightAction={
          <Button
            title="+ Walk-in"
            size="sm"
            variant="primary"
            onPress={() => {
              setWalkInRoomId(availableRooms[0]?.id || '');
              setWalkInGuestName('');
              setWalkInPhone('+91 ');
              setWalkInRent(availableRooms[0]?.ratePerNight?.toString() || '2500');
              setWalkInAdvance('2500');
              setShowWalkInModal(true);
            }}
          />
        }
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'arrivals' && styles.tabBtnActive]}
          onPress={() => setActiveTab('arrivals')}
        >
          <Text style={[styles.tabText, activeTab === 'arrivals' && styles.tabTextActive]}>
            Active In-House Stays ({todayArrivals.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'inventory' && styles.tabBtnActive]}
          onPress={() => setActiveTab('inventory')}
        >
          <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
            Room Directory ({rooms.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Input */}
        <Input
          placeholder={
            activeTab === 'arrivals'
              ? 'Search guest name, room or booking ref...'
              : 'Search room number or status...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="key"
          containerStyle={styles.searchBar}
        />

        {/* ARRIVALS & ACTIVE STAYS VIEW */}
        {activeTab === 'arrivals' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>GUESTS IN-HOUSE & ARRIVALS</Text>
              <Text style={styles.sectionCounter}>{filteredArrivals.length} Stays</Text>
            </View>

            {filteredArrivals.map((arrival) => {
              const isCheckedIn = arrival.status === 'checked_in';

              return (
                <Card key={arrival.id} padding="lg" variant="elevated" style={styles.stayCard}>
                  <View style={styles.stayTop}>
                    <View style={styles.stayIdentity}>
                      <Text style={styles.guestName}>{arrival.guestName}</Text>
                      <Text style={styles.stayMeta}>
                        {arrival.bookingReference} • {arrival.roomCategory}
                      </Text>
                      <Text style={styles.stayDates}>
                        Stay: {arrival.nightsCount} Nights ({arrival.checkInDate} to {arrival.checkOutDate})
                      </Text>
                      {arrival.roomNumber && (
                        <Text style={styles.roomBadgeText}>
                          Allocated Room: <Text style={{ fontWeight: '800' }}>Room {arrival.roomNumber}</Text>
                        </Text>
                      )}
                    </View>

                    <Badge
                      label={isCheckedIn ? 'IN HOUSE' : 'ARRIVAL DUE'}
                      variant={isCheckedIn ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>

                  <View style={styles.stayBottom}>
                    <View>
                      <Text style={styles.folioAmount}>Rent: {formatCurrency(arrival.totalAmount)}</Text>
                      <Text style={styles.advancePaidText}>
                        Advance: {formatCurrency(arrival.depositPaid)}
                      </Text>
                    </View>

                    {isCheckedIn ? (
                      <Button
                        title="Check-Out & Settle Folio"
                        size="sm"
                        variant="outline"
                        onPress={() => openCheckOutModal(arrival)}
                      />
                    ) : (
                      <Button
                        title="Check-In Guest"
                        size="sm"
                        variant="primary"
                        onPress={() => checkInGuest(arrival.id, availableRooms[0]?.id || '')}
                      />
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* ROOM DIRECTORY & CLEANING LIFECYCLE VIEW */}
        {activeTab === 'inventory' && (
          <View>
            {/* Status Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPillsScroll}>
              {statusFilters.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusPill, roomStatusFilter === st && styles.statusPillActive]}
                  onPress={() => setRoomStatusFilter(st)}
                >
                  <Text style={[styles.statusPillText, roomStatusFilter === st && styles.statusPillTextActive]}>
                    {st.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>ROOMS INVENTORY ({filteredRooms.length})</Text>
              <Text style={styles.cleanHint}>Checkout ➔ Cleaning ➔ Available</Text>
            </View>

            {filteredRooms.map((room) => {
              const isAvailable = room.status === 'available';
              const isOccupied = room.status === 'occupied';
              const isCleaning = room.status === 'cleaning';
              const isMaint = room.status === 'maintenance';

              const badgeVariant = isAvailable
                ? 'success'
                : isOccupied
                ? 'primary'
                : isCleaning
                ? 'warning'
                : 'error';

              return (
                <Card key={room.id} padding="lg" variant="elevated" style={styles.roomCard}>
                  <View style={styles.roomTop}>
                    <View style={styles.roomBadge}>
                      <Text style={styles.roomNum}>{room.roomNumber}</Text>
                    </View>
                    <View style={styles.roomDetails}>
                      <View style={styles.roomTitleRow}>
                        <Text style={styles.roomCat}>{room.category}</Text>
                        <Badge label={room.status.toUpperCase()} variant={badgeVariant} size="sm" />
                      </View>
                      <Text style={styles.roomPrice}>
                        {formatCurrency(room.ratePerNight)} / night • Floor {room.floor}
                      </Text>
                      {room.currentGuestName && (
                        <Text style={styles.inHouseGuest}>Current Guest: {room.currentGuestName}</Text>
                      )}
                    </View>
                  </View>

                  {/* Cleaning to Available One-Tap Action */}
                  <View style={styles.roomActionsRow}>
                    {isCleaning && (
                      <TouchableOpacity
                        style={styles.markCleanBtn}
                        onPress={() => handleMarkCleanAndAvailable(room.id, room.roomNumber)}
                      >
                        <Icon name="check-circle" size={14} color="#047857" />
                        <Text style={styles.markCleanText}>Sanitized: Mark Available</Text>
                      </TouchableOpacity>
                    )}

                    {isAvailable && (
                      <TouchableOpacity
                        style={styles.markMaintBtn}
                        onPress={() => updateRoomStatus(room.id, 'maintenance', 'dirty')}
                      >
                        <Icon name="alert-triangle" size={14} color="#DC2626" />
                        <Text style={styles.markMaintText}>Mark Maintenance</Text>
                      </TouchableOpacity>
                    )}

                    {isMaint && (
                      <TouchableOpacity
                        style={styles.markCleanBtn}
                        onPress={() => updateRoomStatus(room.id, 'cleaning', 'dirty')}
                      >
                        <Icon name="rotate-ccw" size={14} color="#047857" />
                        <Text style={styles.markCleanText}>Repair Done: Send to Cleaning</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* WALK-IN CHECK-IN MODAL */}
      <Modal visible={showWalkInModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fast Walk-In Check-In</Text>
              <TouchableOpacity onPress={() => setShowWalkInModal(false)}>
                <Icon name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Room Selector */}
              <Text style={styles.formSectionLabel}>Select Vacant Clean Room *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomPickScroll}>
                {availableRooms.map((r) => {
                  const isPicked = walkInRoomId === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.roomPickChip, isPicked && styles.roomPickChipActive]}
                      onPress={() => {
                        setWalkInRoomId(r.id);
                        setWalkInRent(r.ratePerNight.toString());
                      }}
                    >
                      <Text style={[styles.roomPickNum, isPicked && styles.roomPickNumActive]}>
                        Room {r.roomNumber}
                      </Text>
                      <Text style={styles.roomPickCat}>{r.category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Input
                label="Guest Full Name *"
                placeholder="e.g. Suresh Singhal"
                value={walkInGuestName}
                onChangeText={setWalkInGuestName}
              />
              <Input
                label="Mobile Contact Phone *"
                placeholder="+91 98290 12345"
                value={walkInPhone}
                onChangeText={setWalkInPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Guest Permanent Address"
                placeholder="City, State"
                value={walkInAddress}
                onChangeText={setWalkInAddress}
              />
              <View style={styles.halfRow}>
                <Input
                  label="ID Type"
                  value={walkInIdType}
                  onChangeText={setWalkInIdType}
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="ID Number"
                  placeholder="e.g. 4821 9920 1120"
                  value={walkInIdNumber}
                  onChangeText={setWalkInIdNumber}
                  containerStyle={styles.halfInput}
                />
              </View>
              <View style={styles.halfRow}>
                <Input
                  label="Room Rent / Night (₹)"
                  value={walkInRent}
                  onChangeText={setWalkInRent}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="Advance Collected (₹)"
                  value={walkInAdvance}
                  onChangeText={setWalkInAdvance}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
              </View>

              <Button
                title="Check-In Guest & Assign Key"
                onPress={handleWalkInCheckIn}
                variant="primary"
                size="lg"
                style={styles.modalSaveBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* CHECK-OUT FOLIO SETTLEMENT MODAL (SECTION 13 MANDATE) */}
      <Modal visible={showCheckOutModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Check-Out & Final Bill</Text>
                <Text style={styles.modalSub}>
                  Room {activeCheckOutRoom?.roomNumber} • {activeCheckOutBooking?.guestName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCheckOutModal(false)}>
                <Icon name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Extra Items List */}
              <Text style={styles.formSectionLabel}>Extra Line Charges (Food, Water, Laundry)</Text>
              {extraItems.map((item) => (
                <View key={item.id} style={styles.extraItemRow}>
                  <Text style={styles.extraItemName}>• {item.name}</Text>
                  <Text style={styles.extraItemAmt}>{formatCurrency(item.amount)}</Text>
                </View>
              ))}

              {/* Add Extra Charge Input */}
              <View style={styles.addExtraRow}>
                <Input
                  placeholder="Add item (e.g. Extra Water, Lunch)"
                  value={newExtraName}
                  onChangeText={setNewExtraName}
                  containerStyle={{ flex: 2, marginRight: spacing.xs }}
                />
                <Input
                  placeholder="Amount ₹"
                  value={newExtraAmount}
                  onChangeText={setNewExtraAmount}
                  keyboardType="numeric"
                  containerStyle={{ flex: 1, marginRight: spacing.xs }}
                />
                <Button title="Add" size="sm" variant="outline" onPress={handleAddExtraItem} />
              </View>

              <Input
                label="Discount Amount (₹)"
                placeholder="0"
                value={discountAmount}
                onChangeText={setDiscountAmount}
                keyboardType="numeric"
              />

              {/* BILL CALCULATION SUMMARY */}
              <View style={styles.billBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Base Room Rent Total:</Text>
                  <Text style={styles.billVal}>{formatCurrency(folioCalc.rent)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Extra Food & Water Charges:</Text>
                  <Text style={styles.billVal}>+ {formatCurrency(folioCalc.extras)}</Text>
                </View>
                {folioCalc.discount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={[styles.billLabel, { color: colors.error }]}>Discount Applied:</Text>
                    <Text style={[styles.billVal, { color: colors.error }]}>
                      − {formatCurrency(folioCalc.discount)}
                    </Text>
                  </View>
                )}
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>GST Tax (18%):</Text>
                  <Text style={styles.billVal}>+ {formatCurrency(folioCalc.tax)}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: '#047857' }]}>Advance Paid at Check-in:</Text>
                  <Text style={[styles.billVal, { color: '#047857' }]}>
                    − {formatCurrency(folioCalc.advance)}
                  </Text>
                </View>
                <View style={[styles.billRow, styles.finalBalanceRow]}>
                  <Text style={styles.finalBalanceLabel}>Remaining Balance Due:</Text>
                  <Text style={styles.finalBalanceVal}>{formatCurrency(folioCalc.balance)}</Text>
                </View>
              </View>

              {/* Payment Mode Selector */}
              <Text style={styles.formSectionLabel}>Settlement Payment Mode *</Text>
              <View style={styles.payModeRow}>
                {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.payModeBtn, paymentMode === m && styles.payModeBtnActive]}
                    onPress={() => setPaymentMode(m)}
                  >
                    <Text style={[styles.payModeText, paymentMode === m && styles.payModeTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title={`Settle ${formatCurrency(folioCalc.balance)} & Complete Checkout`}
                onPress={handleConfirmCheckOut}
                variant="primary"
                size="lg"
                style={styles.modalSaveBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  tabBtnActive: {
    backgroundColor: '#F1F5F9',
  },
  tabText: {
    ...typography.subtitle2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primaryNavy,
    fontWeight: '800',
  },
  searchBar: {
    marginBottom: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sectionCounter: {
    ...typography.caption,
    color: colors.textMuted,
  },
  cleanHint: {
    ...typography.caption,
    color: '#047857',
    fontWeight: '700',
    fontSize: 11,
  },
  stayCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  stayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  stayIdentity: {
    flex: 1,
  },
  guestName: {
    ...typography.subtitle1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stayMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  stayDates: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  roomBadgeText: {
    ...typography.captionMedium,
    color: colors.primaryNavy,
    marginTop: 4,
  },
  stayBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  folioAmount: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  advancePaidText: {
    ...typography.caption,
    color: '#047857',
  },
  filterPillsScroll: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginRight: spacing.xs,
  },
  statusPillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  statusPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  roomCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  roomTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomNum: {
    ...typography.subtitle1,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  roomDetails: {
    flex: 1,
  },
  roomTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomCat: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  roomPrice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inHouseGuest: {
    ...typography.captionMedium,
    color: colors.accentBlue,
    marginTop: 2,
  },
  roomActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: spacing.xs,
    marginTop: spacing.sm,
  },
  markCleanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  markCleanText: {
    ...typography.captionMedium,
    color: '#047857',
    fontWeight: '700',
    marginLeft: 4,
  },
  markMaintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  markMaintText: {
    ...typography.captionMedium,
    color: '#DC2626',
    fontWeight: '700',
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
    maxHeight: '92%',
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
  modalSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formSectionLabel: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  roomPickScroll: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  roomPickChip: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: spacing.xs,
    alignItems: 'center',
    minWidth: 80,
  },
  roomPickChipActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primaryNavy,
  },
  roomPickNum: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  roomPickNumActive: {
    color: colors.primaryNavy,
  },
  roomPickCat: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  halfRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  extraItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  extraItemName: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  extraItemAmt: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  addExtraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  billBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  billLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  billVal: {
    ...typography.captionMedium,
    color: colors.textPrimary,
  },
  finalBalanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  finalBalanceLabel: {
    ...typography.subtitle2,
    color: colors.textPrimary,
    fontWeight: '800',
  },
  finalBalanceVal: {
    ...typography.subtitle1,
    color: '#DC2626',
    fontWeight: '800',
  },
  payModeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  payModeBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  payModeBtnActive: {
    backgroundColor: '#059669',
  },
  payModeText: {
    ...typography.captionMedium,
    color: colors.textSecondary,
  },
  payModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSaveBtn: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});

export default CheckInRoomsScreen;
