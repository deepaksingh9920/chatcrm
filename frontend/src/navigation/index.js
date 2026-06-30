import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/main/DashboardScreen';
import { CustomersScreen } from '../screens/main/CustomersScreen';
import { SearchScreen } from '../screens/main/SearchScreen';
import { ConversationScreen } from '../screens/customer/ConversationScreen';
import { AddCustomerScreen } from '../screens/customer/AddCustomerScreen';
import { NewQuoteScreen } from '../screens/customer/NewQuoteScreen';
import { NewTaskScreen } from '../screens/customer/NewTaskScreen';
import { colors } from '../utils/theme';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, emoji, focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{emoji}</Text>
    <Text style={{ fontSize: 10, color: focused ? colors.primary : colors.textMuted, marginTop: 1 }}>{label}</Text>
  </View>
);

const CustomersStack = () => (
  <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}>
    <Stack.Screen name="CustomerList" component={CustomersScreen} options={{ title: 'Customers' }} />
    <Stack.Screen name="Conversation" component={ConversationScreen} />
    <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'New Customer' }} />
    <Stack.Screen name="NewQuote" component={NewQuoteScreen} options={{ title: 'New Quote' }} />
    <Stack.Screen name="NewTask" component={NewTaskScreen} options={{ title: 'New Task' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface }, tabBarShowLabel: false }}>
    <Tab.Screen name="Home" component={DashboardScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" emoji="🏠" focused={focused} /> }} />
    <Tab.Screen name="Customers" component={CustomersStack}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Customers" emoji="👥" focused={focused} /> }} />
    <Tab.Screen name="Search" component={SearchScreen}
      options={{ tabBarIcon: ({ focused }) => <TabIcon label="Search" emoji="🔍" focused={focused} />, headerShown: true, title: 'Search' }} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 32 }}>💬</Text>
      <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 14 }}>ChatCRM</Text>
    </View>
  );
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
