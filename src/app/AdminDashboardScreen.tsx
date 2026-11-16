import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import { KPICard } from '../components/dashboard/KPICard';
import { ModuleItem } from '../components/dashboard/ModuleItem';
import {
  AttendanceModal,
  CheckInRoomsModal,
  AdvanceBookingModal,
  BillingFoliosModal,
  DailyExpensesModal,
  DailySummaryModal,
} from '../components/modals';

export const AdminDashboardScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const {
    selectedHotel,
    hotels,
    switchHotel,
    kpis,
    dailySummary,
    operationalModules,
  } = useHotel();

  const [showHotelPicker, setShowHotelPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules'>('overview');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleModulePress = (moduleId: string) => {
    switch (moduleId) {
      case 'mod-attendance':
        navigate('attendance');
        break;
      case 'mod-advance-booking':
        navigate('advance-booking');
        break;
      case 'mod-checkin-rooms':
        navigate('checkin-rooms');
        break;
      case 'mod-billing':
        navigate('billing');
        break;
      case 'mod-daily-expenses':
        navigate('daily-expenses');
        break;
      case 'mod-daily-summary':
        navigate('daily-summary');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <Header
        title="Admin Console"
        subtitle={selectedHotel.name}
        hotelBadge="GLOBAL HQ"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigate('role-selection')}
            style={styles.logoutButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="log-out" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Selector Card */}
        <Card style={styles.selectorCard} padding="md" variant="elevated">
          <View style={styles.selectorHeader}>
            <View style={styles.selectorLeft}>
              <View style={styles.hotelIconCircle}>
                <Icon name="hotel" size={20} color={colors.primaryNavy} />
              </View>
              <View>
                <Text style={styles.selectorLabel}>ACTIVE RESORT PROPERTY</Text>
                <Text style={styles.activeHotelName}>{selectedHotel.name}</Text>
                <Text style={styles.hotelLocationText}>
                  {selectedHotel.code} • {selectedHotel.location}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowHotelPicker((prev) => !prev)}
              style={styles.switchPropertyButton}
            >
              <Text style={styles.switchPropertyText}>
                {showHotelPicker ? 'Close' : 'Switch'}
              </Text>
              <Icon
                name={showHotelPicker ? 'chevron-down' : 'chevron-right'}
                size={14}
                color={colors.accentBlue}
                style={styles.switchIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Collapsible Hotel Picker Dropdown */}
          {showHotelPicker && (
            <View style={styles.pickerDropdown}>
              <Text style={styles.pickerHeaderTitle}>SELECT MANAGED PROPERTY:</Text>
              {hotels.map((hotel) => {
                const isSelected = hotel.id === selectedHotel.id;
                return (
                  <TouchableOpacity
                    key={hotel.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      switchHotel(hotel.id);
                      setShowHotelPicker(false);
                    }}
                    style={[
                      styles.pickerOption,
                      isSelected && styles.pickerOptionSelected,
                    ]}
                  >
                    <View style={styles.pickerOptionLeft}>
                      <Icon
                        name={isSelected ? 'check-circle' : 'hotel'}
                        size={16}
                        color={isSelected ? colors.accentBlue : colors.textMuted}
                        style={styles.pickerOptionIcon}
                      />
                      <View>
                        <Text
                          style={[
                            styles.pickerOptionText,
                            isSelected && styles.pickerOptionTextSelected,
                          ]}
                        >
                          {hotel.name}
                        </Text>
                        <Text style={styles.pickerOptionSub}>
                          {hotel.code} • {hotel.starRating} Star Luxury • {hotel.totalRooms} Rooms
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <Badge label="ACTIVE" variant="primary" size="sm" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

        {/* Section Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('overview')}
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}
            >
              Real-Time KPIs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('modules')}
            style={[styles.tabButton, activeTab === 'modules' && styles.tabButtonActive]}
          >
            <Text
              style={[styles.tabText, activeTab === 'modules' && styles.tabTextActive]}
            >
              Operations & P&L
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: Real-Time KPIs Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Inventory & Flow</Text>
          <Badge
            label={`${kpis.occupancyPercentage}% Occupancy`}
            variant="success"
            size="sm"
          />
        </View>

        {/* KPI Grid (2 Columns) */}
        <View style={styles.kpiGrid}>
          {/* Total Rooms */}
          <KPICard
            title="Total Rooms"
            value={kpis.totalRooms}
            subtitle="Full resort capacity"
            icon="bed"
            badgeText="Asset Base"
            badgeVariant="neutral"
            style={styles.kpiItem}
          />

          {/* Occupied Rooms */}
          <KPICard
            title="Occupied Rooms"
            value={kpis.occupiedRooms}
            subtitle="In-house guests"
            icon="users"
            badgeText={`${kpis.occupancyPercentage}%`}
            badgeVariant="primary"
            accentColor={colors.accentBlue}
            style={styles.kpiItem}
          />

          {/* Available Rooms */}
          <KPICard
            title="Available Rooms"
            value={kpis.availableRooms}
            subtitle="Ready for check-in"
            icon="check-circle"
            badgeText="Vacant Clean"
            badgeVariant="success"
            accentColor={colors.success}
            style={styles.kpiItem}
          />

          {/* Today's Check-ins */}
          <KPICard
            title="Today's Check-ins"
            value={kpis.todayCheckIns}
            subtitle="Arrivals scheduled"
            icon="trending-up"
            badgeText="Arrivals"
            badgeVariant="info"
            accentColor={colors.accentBlue}
            style={styles.kpiItem}
          />

          {/* Today's Check-outs */}
          <KPICard
            title="Today's Check-outs"
            value={kpis.todayCheckOuts}
            subtitle="Departures scheduled"
            icon="trending-down"
            badgeText="Departures"
            badgeVariant="warning"
            accentColor={colors.warning}
            style={styles.kpiItem}
          />

          {/* Daily Net Revenue */}
          <KPICard
            title="Daily Gross Rev."
            value={dailySummary.grossRevenue}
            subtitle={`ADR ${dailySummary.adr}`}
            icon="dollar-sign"
            badgeText="Today"
            badgeVariant="gold"
            accentColor={colors.goldAccent}
            style={styles.kpiItem}
          />
        </View>

        {/* SECTION 2: Daily Summary Financial Breakdown (Admin-Only Feature) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Daily Financial Summary</Text>
          <Badge label="ADMIN EXCLUSIVE" variant="gold" size="sm" />
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigate('daily-summary')}
        >
          <Card padding="md" variant="elevated" style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>RevPAR</Text>
                <Text style={styles.financialValue}>{dailySummary.revPar}</Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>ADR</Text>
                <Text style={styles.financialValue}>{dailySummary.adr}</Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>Net Operating Income</Text>
                <Text style={[styles.financialValue, { color: colors.success }]}>
                  {dailySummary.netOperatingIncome}
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* SECTION 3: Operational Modules List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Operational Modules</Text>
          <Text style={styles.sectionCounter}>{operationalModules.length} Modules Active</Text>
        </View>

        {operationalModules.map((module) => (
          <ModuleItem
            key={module.id}
            title={module.title}
            subtitle={module.subtitle}
            icon={module.icon}
            badge={module.badge}
            badgeVariant={module.badgeColor || (module.adminOnly ? 'gold' : 'primary')}
            onPress={() => handleModulePress(module.id)}
          />
        ))}
      </ScrollView>

      {/* Operational Interactive Modals */}
      <AttendanceModal
        visible={activeModal === 'mod-attendance'}
        onClose={() => setActiveModal(null)}
      />
      <CheckInRoomsModal
        visible={activeModal === 'mod-checkin-rooms'}
        onClose={() => setActiveModal(null)}
      />
      <AdvanceBookingModal
        visible={activeModal === 'mod-advance-booking'}
        onClose={() => setActiveModal(null)}
      />
      <BillingFoliosModal
        visible={activeModal === 'mod-billing'}
        onClose={() => setActiveModal(null)}
      />
      <DailyExpensesModal
        visible={activeModal === 'mod-daily-expenses'}
        onClose={() => setActiveModal(null)}
      />
      <DailySummaryModal
        visible={activeModal === 'mod-daily-summary'}
        onClose={() => setActiveModal(null)}
      />
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
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectorCard: {
    marginBottom: spacing.md,
  },
  selectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hotelIconCircle: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#D0E1F2',
  },
  selectorLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  activeHotelName: {
    ...typography.h4,
    color: colors.primaryNavy,
  },
  hotelLocationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  switchPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.primaryTint,
  },
  switchPropertyText: {
    ...typography.captionBold,
    color: colors.accentBlue,
  },
  switchIcon: {
    marginLeft: 3,
  },
  pickerDropdown: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pickerHeaderTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: 2,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primaryTint,
  },
  pickerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerOptionIcon: {
    marginRight: spacing.sm,
  },
  pickerOptionText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  pickerOptionTextSelected: {
    color: colors.accentBlue,
  },
  pickerOptionSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabButtonActive: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.primaryNavy,
  },
  sectionCounter: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  kpiItem: {
    width: '48.5%',
    marginBottom: spacing.sm,
    flexGrow: 1,
  },
  financialCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.goldAccent,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  financialCol: {
    alignItems: 'center',
    flex: 1,
  },
  financialLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: 2,
  },
  financialValue: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
  },
  financialDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
});
