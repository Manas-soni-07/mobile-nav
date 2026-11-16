import React from 'react';
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
import { Badge } from '../components/common/Badge';
import { Icon } from '../components/common/Icon';
import { Button } from '../components/common/Button';

export const DailySummaryScreen: React.FC = () => {
  const { goBack } = useNavigation();
  const {
    dailySummary,
    kpis,
    expensesSummary,
    selectedHotel,
    hotels,
    switchHotel,
    resetData,
  } = useHotel();

  const handleReset = () => {
    Alert.alert(
      'Reset Mock Data to Default Seeds',
      'This will revert all rooms, bookings, folios, attendance, and expenses back to initial defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Reset',
          style: 'destructive',
          onPress: () => {
            resetData();
            Alert.alert('Reset Complete', 'Mock data has been restored to factory seed state.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Daily Financial Summary"
        subtitle={selectedHotel.name}
        hotelBadge="ADMIN AUDITED"
        showBack
        onBack={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Managed Properties Pill Switcher */}
        <Text style={styles.filterTitle}>SELECT PROPERTY FOR AUDIT:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.propertyScroll}
        >
          {hotels.map((h) => {
            const isActive = h.id === selectedHotel.id;
            return (
              <TouchableOpacity
                key={h.id}
                onPress={() => switchHotel(h.id)}
                style={[styles.propPill, isActive && styles.propPillActive]}
              >
                <Text style={[styles.propPillText, isActive && styles.propPillTextActive]}>
                  {h.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Master P&L Statement Card */}
        <View style={styles.plCard}>
          <View style={styles.plCardHeader}>
            <Text style={styles.plTitle}>EXECUTIVE P&L STATEMENT</Text>
            <Badge label={selectedHotel.code} variant="gold" size="sm" />
          </View>

          <Text style={styles.grossRevText}>{dailySummary.grossRevenue}</Text>
          <Text style={styles.grossSubtitle}>Gross Realized & Accrued Daily Revenue</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>RevPAR</Text>
              <Text style={styles.metricValue}>{dailySummary.revPar}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>ADR</Text>
              <Text style={styles.metricValue}>{dailySummary.adr}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Occupancy</Text>
              <Text style={[styles.metricValue, { color: colors.accentBlue }]}>
                {dailySummary.occupancyRate}
              </Text>
            </View>
          </View>

          <View style={styles.summaryBarDivider} />

          {/* Bottom Financial Outcome Row */}
          <View style={styles.financialOutcomeRow}>
            <View>
              <Text style={styles.outcomeLabel}>Daily Operating Disbursements:</Text>
              <Text style={[styles.outcomeValue, { color: colors.error }]}>
                -{expensesSummary.todayTotal}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.outcomeLabel}>Net Operating Income (NOI):</Text>
              <Text style={[styles.outcomeValue, { color: colors.success }]}>
                {dailySummary.netOperatingIncome}
              </Text>
            </View>
          </View>
        </View>

        {/* Room Capacity Status */}
        <Text style={styles.sectionHeaderTitle}>ROOM FLOW & CAPACITY AUDIT</Text>
        <View style={styles.capacityCard}>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>Total Resort Capacity:</Text>
            <Text style={styles.capacityVal}>{kpis.totalRooms} Rooms</Text>
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>In-House Occupied Stays:</Text>
            <Text style={[styles.capacityVal, { color: colors.accentBlue }]}>
              {kpis.occupiedRooms} Rooms ({kpis.occupancyPercentage}%)
            </Text>
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>Vacant Clean & Inspected:</Text>
            <Text style={[styles.capacityVal, { color: colors.success }]}>
              {kpis.availableRooms} Rooms
            </Text>
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>Housekeeping Turnover / Cleaning:</Text>
            <Text style={[styles.capacityVal, { color: colors.warning }]}>
              {kpis.cleaningRooms} Rooms
            </Text>
          </View>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>Out of Order / Maintenance:</Text>
            <Text style={[styles.capacityVal, { color: colors.error }]}>
              {kpis.maintenanceRooms} Rooms
            </Text>
          </View>
        </View>

        {/* Revenue Centers Distribution */}
        <Text style={styles.sectionHeaderTitle}>REVENUE CENTERS AUDIT</Text>
        <View style={styles.streamCard}>
          <View style={styles.streamRow}>
            <View style={styles.streamLeft}>
              <View style={[styles.streamDot, { backgroundColor: colors.accentBlue }]} />
              <Text style={styles.streamName}>Room Accommodations & Suites</Text>
            </View>
            <Text style={styles.streamPct}>68% Contribution</Text>
          </View>
          <View style={styles.streamRow}>
            <View style={styles.streamLeft}>
              <View style={[styles.streamDot, { backgroundColor: colors.success }]} />
              <Text style={styles.streamName}>Fine Dining, Grill & Lounges</Text>
            </View>
            <Text style={styles.streamPct}>18% Contribution</Text>
          </View>
          <View style={styles.streamRow}>
            <View style={styles.streamLeft}>
              <View style={[styles.streamDot, { backgroundColor: colors.goldAccent }]} />
              <Text style={styles.streamName}>Holistic Spa & Wellness</Text>
            </View>
            <Text style={styles.streamPct}>9% Contribution</Text>
          </View>
          <View style={styles.streamRow}>
            <View style={styles.streamLeft}>
              <View style={[styles.streamDot, { backgroundColor: colors.primaryNavy }]} />
              <Text style={styles.streamName}>Private Yacht & Cabana Charter</Text>
            </View>
            <Text style={styles.streamPct}>5% Contribution</Text>
          </View>
        </View>

        {/* Mock State Maintenance Utility */}
        <Text style={styles.sectionHeaderTitle}>STATE PERSISTENCE & AUDIT RESET</Text>
        <View style={styles.resetCard}>
          <Text style={styles.resetTitle}>In-Memory Testing Control</Text>
          <Text style={styles.resetDesc}>
            All operational data (Check-ins, Attendance, Billing settlements, and Expenses) are managed reactively. You can reset all properties to clean seed data anytime.
          </Text>
          <Button
            title="Reset All Mock Data to Default Seeds"
            variant="outline"
            size="md"
            icon="refresh-cw"
            onPress={handleReset}
            style={{ marginTop: spacing.md }}
          />
        </View>
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
  filterTitle: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  propertyScroll: {
    paddingBottom: spacing.xs,
    marginBottom: spacing.xs,
  },
  propPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  propPillActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  propPillText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  propPillTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
  plCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.goldAccent,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  plCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  grossRevText: {
    ...typography.h1,
    color: colors.primaryNavy,
    marginTop: spacing.xs,
  },
  grossSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  summaryBarDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  financialOutcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  outcomeLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  outcomeValue: {
    ...typography.bodySemiBold,
    marginTop: 2,
  },
  sectionHeaderTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  capacityCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  capacityText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  capacityVal: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  streamCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  streamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  streamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  streamName: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  streamPct: {
    ...typography.captionBold,
    color: colors.primaryNavy,
  },
  resetCard: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xxl,
  },
  resetTitle: {
    ...typography.bodySemiBold,
    color: colors.primaryNavy,
  },
  resetDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
