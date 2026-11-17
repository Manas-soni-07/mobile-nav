import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '../hooks/useNavigation';
import { SplashScreen } from './SplashScreen';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { LoginScreen } from './LoginScreen';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { ManagerDashboardScreen } from './ManagerDashboardScreen';
import { HotelsManagementScreen } from './HotelsManagementScreen';
import { ManagersManagementScreen } from './ManagersManagementScreen';
import { StaffManagementScreen } from './StaffManagementScreen';
import { SalaryManagementScreen } from './SalaryManagementScreen';
import { SalaryAdvancesScreen } from './SalaryAdvancesScreen';
import { SettingsScreen } from './SettingsScreen';
import { AttendanceScreen } from './AttendanceScreen';
import { AdvanceBookingScreen } from './AdvanceBookingScreen';
import { CheckInRoomsScreen } from './CheckInRoomsScreen';
import { BillingFoliosScreen } from './BillingFoliosScreen';
import { DailyExpensesScreen } from './DailyExpensesScreen';
import { DailySummaryScreen } from './DailySummaryScreen';
import { BanquetEventsScreen } from './BanquetEventsScreen';
import { InRoomDiningScreen } from './InRoomDiningScreen';
import { HousekeepingDispatchScreen } from './HousekeepingDispatchScreen';
import { AyurvedicSpaScreen } from './AyurvedicSpaScreen';
import { ConciergeDispatchScreen } from './ConciergeDispatchScreen';
import { ShiftHandoverScreen } from './ShiftHandoverScreen';
import { CloudSyncScreen } from './CloudSyncScreen';
import { colors } from '../theme/colors';

export const MainAppNavigator: React.FC = () => {
  const { currentScreen } = useNavigation();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'role-selection':
        return <RoleSelectionScreen />;
      case 'login':
        return <LoginScreen />;
      case 'admin-dashboard':
        return <AdminDashboardScreen />;
      case 'manager-dashboard':
        return <ManagerDashboardScreen />;
      case 'hotels':
        return <HotelsManagementScreen />;
      case 'managers':
        return <ManagersManagementScreen />;
      case 'rooms':
        return <CheckInRoomsScreen />;
      case 'staff':
        return <StaffManagementScreen />;
      case 'salaries':
        return <SalaryManagementScreen />;
      case 'salary-advances':
        return <SalaryAdvancesScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'attendance':
        return <AttendanceScreen />;
      case 'advance-booking':
        return <AdvanceBookingScreen />;
      case 'checkin-rooms':
        return <CheckInRoomsScreen />;
      case 'billing':
        return <BillingFoliosScreen />;
      case 'daily-expenses':
        return <DailyExpensesScreen />;
      case 'daily-summary':
        return <DailySummaryScreen />;
      case 'banquets-events':
        return <BanquetEventsScreen />;
      case 'in-room-dining':
        return <InRoomDiningScreen />;
      case 'housekeeping-dispatch':
        return <HousekeepingDispatchScreen />;
      case 'ayurvedic-spa':
        return <AyurvedicSpaScreen />;
      case 'concierge-dispatch':
        return <ConciergeDispatchScreen />;
      case 'shift-handover':
        return <ShiftHandoverScreen />;
      case 'cloud-sync':
        return <CloudSyncScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default MainAppNavigator;
