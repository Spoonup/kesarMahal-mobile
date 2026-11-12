import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium } from '@expo-google-fonts/cormorant-garamond';
import { Cinzel_500Medium } from '@expo-google-fonts/cinzel';
import { Jost_300Light, Jost_400Regular, Jost_500Medium } from '@expo-google-fonts/jost';
import { c, font } from './src/theme';
import { TabIcon } from './src/icons';
import { StoreProvider } from './src/store';
import Home from './src/screens/Home';
import Shop from './src/screens/Shop';
import Product from './src/screens/Product';
import Gift from './src/screens/Gift';
import Bag from './src/screens/Bag';
import Checkout from './src/screens/Checkout';
import Payment from './src/screens/Payment';
import Order from './src/screens/Order';
import Trace from './src/screens/Trace';
import Account from './src/screens/Account';
import { SignIn, Welcome, WELCOMED } from './src/screens/Auth';

SplashScreen.preventAutoHideAsync().catch(() => {});
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 60_000 } } });
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: c.ivory, primary: c.maroon, text: c.ink, card: c.ivory, border: c.line } };

function Tabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />, tabBarActiveTintColor: c.maroon, tabBarInactiveTintColor: c.muted, tabBarLabelStyle: { fontFamily: font.medium, fontSize: 10.5, letterSpacing: 0.4, marginTop: 2 }, tabBarStyle: { backgroundColor: c.ivory, borderTopColor: c.line, borderTopWidth: 1, paddingTop: 8 }, tabBarItemStyle: { minHeight: 44 } })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Shop" component={Shop} />
      <Tab.Screen name="Gift" component={Gift} />
      <Tab.Screen name="Trace" component={Trace} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

function Root() {
  const [first, setFirst] = useState<boolean | null>(null);
  useEffect(() => { AsyncStorage.getItem(WELCOMED).then(v => setFirst(!v)).catch(() => setFirst(false)); }, []);
  if (first === null) return null;
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator initialRouteName={first ? 'Welcome' : 'Tabs'} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.ivory } }}>
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Product" component={Product} />
        <Stack.Screen name="Bag" component={Bag} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="Payment" component={Payment} options={{ presentation: 'modal', gestureEnabled: false }} />
        <Stack.Screen name="Order" component={Order} />
        <Stack.Screen name="SignIn" component={SignIn} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded, error] = useFonts({ CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium, Cinzel_500Medium, Jost_300Light, Jost_400Regular, Jost_500Medium });
  useEffect(() => { if (loaded || error) SplashScreen.hideAsync().catch(() => {}); }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <StoreProvider><StatusBar style="dark" /><Root /></StoreProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
