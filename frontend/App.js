import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { colors } from './constants/theme';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simula carregamento
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer
      theme={{
        colors: {
          background: colors.dark,
          card: colors.dark,
          text: colors.light,
          border: colors.dark,
          primary: colors.primary,
        },
      }}
      onReady={onLayoutRootView} // Adiciona o callback aqui para garantir que o splash seja escondido
    >
      <AuthProvider>
        <Stack.Navigator
          initialRouteName="Login" // Corrigido de initialRoute para initialRouteName
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.dark,
            },
            headerTintColor: colors.light,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Registrar' }}
          />
          <Stack.Screen
            name="Main"
            component={AppNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </AuthProvider>
      <Toast />
    </NavigationContainer>
  );
}