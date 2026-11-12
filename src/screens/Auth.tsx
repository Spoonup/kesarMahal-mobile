import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, friendly } from '../api';
import { brand } from '../content';
import { c, font, sp } from '../theme';
import { useStore } from '../store';
import { Button, Field, H, Label, Screen, T } from '../ui';
import { BackBar } from './parts';

export const WELCOMED = 'km_welcomed';
const markWelcomed = () => AsyncStorage.setItem(WELCOMED, '1').catch(() => {});

export function Welcome({ navigation }: NativeStackScreenProps<any>) {
  // Only an explicit choice gets past this screen: browsing as a guest, or a completed sign-in. Backing out of sign-in returns here.
  const guest = async () => { await markWelcomed(); navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }); };
  return (
    <Screen edges={['top', 'bottom']} style={{ backgroundColor: c.maroon }}>
      <View style={{ flex: 1, padding: sp.lg, justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center', gap: sp.md, marginTop: sp.xl }}>
          <View style={{ width: 230, height: 300, borderTopLeftRadius: 115, borderTopRightRadius: 115, overflow: 'hidden', borderWidth: 1.5, borderColor: c.goldLight }}>
            <Image source={require('../../assets/brand/km-logo.jpg')} contentFit="cover" style={{ flex: 1 }} accessibilityLabel={brand.name} />
          </View>
          <H size={34} color={c.ivory} italic style={{ textAlign: 'center' }}>{brand.welcomeLine}</H>
          <Label color={c.goldLight}>{brand.tagline}</Label>
        </View>
        <View style={{ gap: sp.sm }}>
          <Button title="Continue with Spoonup" light onPress={() => navigation.navigate('SignIn', { fromWelcome: true })} style={{ minHeight: 54 }} />
          <Button title="Browse as guest" outline onPress={guest} style={{ minHeight: 54 }} />
          <Text style={{ textAlign: 'center', fontFamily: font.displayItalic, fontSize: 16, color: c.goldLight, marginTop: 6 }}>{brand.endorsement}</Text>
        </View>
      </View>
    </Screen>
  );
}

export function SignIn({ navigation, route }: NativeStackScreenProps<any>) {
  const { signIn } = useStore();
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ username: '', password: '', email: '', phone: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF(s => ({ ...s, [k]: k === 'phone' ? v.replace(/\D/g, '').slice(0, 10) : v }));
  const ready = f.username.trim() && f.password && (!signup || (f.email.trim() && f.phone.length === 10));
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      const r = signup ? await api.signup({ username: f.username.trim(), password: f.password, email: f.email.trim(), phone: f.phone }) : await api.login({ username: f.username.trim(), password: f.password });
      await signIn(r);
      if (route.params?.fromWelcome || !navigation.canGoBack()) { await markWelcomed(); navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }); } else navigation.goBack();
    } catch (e) { setErr(friendly(e)); setBusy(false); }
  };
  return (
    <Screen>
      <BackBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: sp.lg, gap: sp.md }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontFamily: font.label, fontSize: 22, color: c.maroon }}>{brand.name}</Text>
          <H size={38}>{signup ? 'Join the house.' : 'Welcome back to the house.'}</H>
          <T>Your orders and saved addresses, in one place. You can also check out as a guest.</T>
          <Field label={signup ? 'Username (3-32 letters, numbers, underscores)' : 'Username or email'} value={f.username} onChangeText={set('username')} autoCapitalize="none" autoCorrect={false} autoComplete="username" textContentType="username" />
          {signup ? <Field label="Email" value={f.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" /> : null}
          {signup ? <Field label="Mobile number" value={f.phone} onChangeText={set('phone')} keyboardType="number-pad" autoComplete="tel" textContentType="telephoneNumber" /> : null}
          <Field label="Password" value={f.password} onChangeText={set('password')} secureTextEntry autoCapitalize="none" autoComplete={signup ? 'new-password' : 'current-password'} textContentType={signup ? 'newPassword' : 'password'} />
          {err ? <T style={{ color: c.error }}>{err}</T> : null}
          <Button title={signup ? 'Create account' : 'Sign in'} busy={busy} disabled={!ready} onPress={submit} />
          <Pressable accessibilityRole="button" onPress={() => { setSignup(s => !s); setErr(''); }} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ fontFamily: font.body, color: c.maroon, textDecorationLine: 'underline' }}>{signup ? 'I already have an account' : 'New here? Create an account'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
