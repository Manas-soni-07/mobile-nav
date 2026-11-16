import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '../hooks/useNavigation';
import { SplashScreen } from './SplashScreen';
import { RoleSelectionScreen } from './RoleSelectionScreen';
import { LoginScreen } from './LoginScreen';
import { AdminDashboardScreen } from './AdminDashboardScreen';
import { ManagerDashboardScreen } from './ManagerDashboardScreen';
import { AttendanceScreen } from './AttendanceScreen';
import { AdvanceBookingScreen } from './AdvanceBookingScreen';
import { CheckInRoomsScreen } from './CheckInRoomsScreen';
import { BillingFoliosScreen } from './BillingFoliosScreen';
import { DailyExpensesScreen } from './DailyExpensesScreen';
import { DailySummaryScreen } from './DailySummaryScreen';
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
