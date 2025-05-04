import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SocialScreen from '../screens/SocialScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import EsportsLinksScreen from '../screens/EsportsLinksScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CustomDrawerContent from './CustomDrawerContent';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'share-social' : 'share-social-outline';
          } else if (route.name === 'Documents') {
            iconName = focused ? 'document' : 'document-outline';
          } else if (route.name === 'EsportsLinks') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colors.dark,
          borderTopColor: colors.dark,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="EsportsLinks" component={EsportsLinksScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  const screens = [
    {
      name: 'Main',
      component: MainTabNavigator,
      options: {
        title: 'FuriaApp',
        drawerIcon: ({ color, size }) => (
          <Ionicons name="home" color={color} size={size} />
        ),
      },
    },
  ];

  if (user?.isAdmin) {
    screens.push({
      name: 'AdminDashboard',
      component: AdminDashboardScreen,
      options: {
        title: 'Admin Dashboard',
        drawerIcon: ({ color, size }) => (
          <Ionicons name="shield" color={color} size={size} />
        ),
      },
    });
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.dark,
          width: 240,
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.light,
        headerStyle: {
          backgroundColor: colors.dark,
        },
        headerTintColor: colors.light,
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Drawer.Navigator>
  );
};

export default AppNavigator;