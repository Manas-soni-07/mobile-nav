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
} from '../components/modals';

export const ManagerDashboardScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const { selectedHotel, kpis, operationalModules } = useHotel();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Filter modules: Exclude Admin-only modules (such as Daily Summary)
  const managerModules = operationalModules.filter((module) => !module.adminOnly);

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
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <Header
        title="Manager Console"
        subtitle={selectedHotel.name}
        hotelBadge={selectedHotel.code}
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
        {/* Assigned Property Locked Banner (No switcher for Manager) */}
        <Card style={styles.propertyBanner} padding="md" variant="elevated">
          <View style={styles.bannerRow}>
            <View style={styles.bannerLeft}>
              <View style={styles.propertyIconCircle}>
                <Icon name="key" size={20} color={colors.success} />
              </View>
              <View>
                <Text style={styles.bannerLabel}>ASSIGNED PROPERTY</Text>
                <Text style={styles.hotelName}>{selectedHotel.name}</Text>
                <Text style={styles.locationText}>{selectedHotel.location}</Text>
              </View>
            </View>

            <Badge label="FRONT DESK" variant="success" size="sm" />
          </View>
        </Card>

        {/* Operational Notice */}
        <View style={styles.operationalNotice}>
          <Icon name="clock" size={14} color={colors.textSecondary} style={styles.noticeIcon} />
          <Text style={styles.noticeText}>
            Shift: Active Day Operation • Next Handover in 4 hrs 30 mins
          </Text>
        </View>

        {/* SECTION 1: Key Operational Metrics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Room Occupancy Status</Text>
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
            subtitle="Full property count"
            icon="bed"
            badgeText="Asset"
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
            subtitle="Vacant & inspected"
            icon="check-circle"
            badgeText="Ready"
            badgeVariant="success"
            accentColor={colors.success}
            style={styles.kpiItem}
          />

          {/* Cleaning In Progress */}
          <KPICard
            title="Housekeeping"
            value={`${kpis.cleaningRooms} Rooms`}
            subtitle="Turnover underway"
            icon="shield"
            badgeText="Cleaning"
            badgeVariant="warning"
            accentColor={colors.warning}
            style={styles.kpiItem}
          />

          {/* Today's Check-ins */}
          <KPICard
            title="Today's Check-ins"
            value={kpis.todayCheckIns}
            subtitle="Expected arrivals"
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
            subtitle="Pending departures"
            icon="trending-down"
            badgeText="Departures"
            badgeVariant="warning"
            accentColor={colors.warning}
            style={styles.kpiItem}
          />
        </View>

        {/* SECTION 2: Operational Modules */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shift Action Modules</Text>
          <Text style={styles.sectionCounter}>{managerModules.length} Modules Accessible</Text>
        </View>

        {managerModules.map((module) => (
          <ModuleItem
            key={module.id}
            title={module.title}
            subtitle={module.subtitle}
            icon={module.icon}
            badge={module.badge}
            badgeVariant={module.badgeColor || 'primary'}
            onPress={() => handleModulePress(module.id)}
          />
        ))}

        {/* Role Boundary Notice */}
        <View style={styles.boundaryNotice}>
          <Icon name="lock" size={14} color={colors.textMuted} style={styles.lockIcon} />
          <Text style={styles.boundaryText}>
            Executive P&L and Multi-Property Controls are restricted to Corporate Administrators.
          </Text>
        </View>
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
  propertyBanner: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  propertyIconCircle: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  bannerLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  hotelName: {
    ...typography.h4,
    color: colors.primaryNavy,
  },
  locationText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  operationalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSubtle,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeIcon: {
    marginRight: spacing.xs,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
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
  boundaryNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockIcon: {
    marginRight: spacing.xs,
  },
  boundaryText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
  },
});
