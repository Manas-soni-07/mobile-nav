import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import { RoomStatus, HousekeepingStatus } from '../types/hotel';

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
  } = useHotel();

  const [activeTab, setActiveTab] = useState<'arrivals' | 'inventory'>('arrivals');
  const [searchQuery, setSearchQuery] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('ALL');

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

  const handleCheckIn = (bookingId: string) => {
    const arrival = todayArrivals.find((a) => a.id === bookingId);
    if (!arrival) return;

    let targetRoomId = arrival.roomId;
    if (!targetRoomId && availableRooms.length > 0) {
      targetRoomId = availableRooms[0].id;
    }

    if (!targetRoomId) {
      Alert.alert('No Available Rooms', 'There are no vacant clean rooms ready for assignment.');
      return;
    }

    const success = checkInGuest(bookingId, targetRoomId);
    if (success) {
      Alert.alert('Check-In Complete', `Guest ${arrival.guestName} successfully checked in!`);
    }
  };

  const handleCheckOut = (bookingId: string) => {
    checkOutGuest(bookingId);
  };

  const handleCycleHousekeeping = (roomId: string, currentStatus: RoomStatus) => {
    if (currentStatus === 'occupied') {
      Alert.alert('Room Occupied', 'Cannot alter cleaning status while guest is in-house.');
      return;
    }

    if (currentStatus === 'cleaning') {
      updateRoomStatus(roomId, 'available', 'clean');
    } else if (currentStatus === 'available') {
      updateRoomStatus(roomId, 'maintenance', 'dirty');
    } else if (currentStatus === 'maintenance') {
      updateRoomStatus(roomId, 'cleaning', 'in_progress');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Check-In & Rooms"
        subtitle={selectedHotel.name}
        hotelBadge={`${availableRooms.length} VACANT READY`}
        showBack
        onBack={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('arrivals')}
            style={[styles.tabBtn, activeTab === 'arrivals' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'arrivals' && styles.tabTextActive]}>
              Today's Arrivals ({todayArrivals.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('inventory')}
            style={[styles.tabBtn, activeTab === 'inventory' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
              Room Inventory ({rooms.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <Input
          placeholder={
            activeTab === 'arrivals'
              ? 'Search guest name, code, or room...'
              : 'Search room number, category, or guest...'
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="key"
          style={styles.searchInput}
        />

        {/* ARRIVALS VIEW */}
        {activeTab === 'arrivals' && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                SCHEDULED ARRIVALS & ACTIVE STAYS
              </Text>
              <Text style={styles.sectionCounter}>{filteredArrivals.length} Guests</Text>
            </View>

            {filteredArrivals.map((arrival) => {
              const isCheckedIn = arrival.status === 'checked_in';

              return (
                <View key={arrival.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.guestName}>{arrival.guestName}</Text>
                      <Text style={styles.refCode}>
                        {arrival.bookingReference} • {arrival.roomCategory}
                      </Text>
                      <Text style={styles.dates}>
                        Stay: {arrival.nightsCount} Nights ({arrival.checkInDate} to {arrival.checkOutDate})
                      </Text>
                      {arrival.roomNumber && (
                        <Text style={styles.assignedRoom}>
                          Assigned Room: Room {arrival.roomNumber}
                        </Text>
                      )}
                    </View>

                    <Badge
                      label={isCheckedIn ? 'IN HOUSE' : 'ARRIVAL DUE'}
                      variant={isCheckedIn ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>

                  {arrival.specialRequests && (
                    <View style={styles.notesBox}>
                      <Icon name="info" size={12} color={colors.accentBlue} style={{ marginRight: 4 }} />
                      <Text style={styles.notesText} numberOfLines={2}>
                        {arrival.specialRequests}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardBottom}>
                    <Text style={styles.amount}>
                      Folio: {formatCurrency(arrival.totalAmount)} ({arrival.paymentStatus.toUpperCase()})
                    </Text>

                    {!isCheckedIn ? (
                      <Button
                        title="Process Check-In"
                        variant="primary"
                        size="sm"
                        icon="key"
                        onPress={() => handleCheckIn(arrival.id)}
                      />
                    ) : (
                      <Button
                        title="Checkout & Release"
                        variant="outline"
                        size="sm"
                        icon="log-out"
                        onPress={() => handleCheckOut(arrival.id)}
                      />
                    )}
                  </View>
                </View>
              );
            })}

            {filteredArrivals.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={36} color={colors.success} />
                <Text style={styles.emptyTitle}>No Pending Arrivals</Text>
                <Text style={styles.emptyDesc}>All scheduled guests are checked in.</Text>
              </View>
            )}
          </View>
        )}

        {/* ROOM INVENTORY VIEW */}
        {activeTab === 'inventory' && (
          <View>
            {/* Filter Pills */}
            <Text style={styles.filterTitle}>ROOM STATUS FILTER:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {statusFilters.map((st) => {
                const isActive = roomStatusFilter === st;
                return (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setRoomStatusFilter(st)}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                  >
                    <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                      {st.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                ROOMS DIRECTORY ({filteredRooms.length} ROOMS)
              </Text>
              <Text style={styles.cycleHint}>Tap to cycle maintenance</Text>
            </View>

            {/* Room Cards Grid */}
            {filteredRooms.map((room) => {
              const isOccupied = room.status === 'occupied';
              const isAvailable = room.status === 'available';
              const isCleaning = room.status === 'cleaning';

              const badgeVariant = isOccupied
                ? 'primary'
                : isAvailable
                ? 'success'
                : isCleaning
                ? 'warning'
                : 'error';

              return (
                <TouchableOpacity
                  key={room.id}
                  activeOpacity={0.7}
                  onPress={() => handleCycleHousekeeping(room.id, room.status)}
                  style={styles.card}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.roomBadgeCircle}>
                      <Text style={styles.roomNumText}>{room.roomNumber}</Text>
                    </View>

                    <View style={styles.roomInfo}>
                      <View style={styles.roomNameRow}>
                        <Text style={styles.roomCategory}>{room.category}</Text>
                        <Badge
                          label={room.status.toUpperCase()}
                          variant={badgeVariant}
                          size="sm"
                        />
                      </View>
                      <Text style={styles.roomMeta}>
                        Floor {room.floor} • ${room.ratePerNight}/night • Clean: {room.housekeepingStatus.toUpperCase()}
                      </Text>
                      {room.currentGuestName && (
                        <Text style={styles.guestInRoom}>
                          Guest: {room.currentGuestName}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.amenitiesRow}>
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <View key={idx} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primaryNavy,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  sectionCounter: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cycleHint: {
    ...typography.caption,
    fontSize: 10,
    color: colors.accentBlue,
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
  card: {
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
    alignItems: 'flex-start',
  },
  cardLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  guestName: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  refCode: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dates: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  assignedRoom: {
    ...typography.captionBold,
    color: colors.accentBlue,
    marginTop: 3,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderRadius: borderRadius.xs,
    padding: 6,
    marginTop: spacing.xs,
  },
  notesText: {
    ...typography.caption,
    color: colors.accentBlue,
    fontSize: 10,
    flex: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
  },
  amount: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
  },
  roomBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomNumText: {
    ...typography.bodySemiBold,
    color: colors.surface,
    fontSize: 13,
  },
  roomInfo: {
    flex: 1,
  },
  roomNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomCategory: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  roomMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guestInRoom: {
    ...typography.captionBold,
    color: colors.accentBlue,
    marginTop: 2,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    paddingTop: 4,
  },
  amenityTag: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginTop: 2,
  },
  amenityText: {
    ...typography.caption,
    fontSize: 9,
    color: colors.textSecondary,
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
});
