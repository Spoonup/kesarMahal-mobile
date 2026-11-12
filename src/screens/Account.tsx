import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, friendly } from '../api';
import { brand } from '../content';
import { c, font, sp } from '../theme';
import { fmt, statusInfo } from '../data';
import { useStore } from '../store';
import { Button, Empty, ErrorBox, Field, H, Label, Row, Screen, T } from '../ui';
import { AccountSk, AddressesSk, OrdersListSk } from '../skeletons';

export default function Account({ navigation }: NativeStackScreenProps<any>) {
  const { user, authReady, signOut } = useStore();
  const qc = useQueryClient();
  const [form, setForm] = useState<{ label: string; line1: string; city: string; pincode: string } | null>(null);
  const [err, setErr] = useState('');
  const orders = useQuery({ queryKey: ['orders', user?.id], queryFn: async () => { const all = await api.myOrders(); return all.some(o => o.storefront) ? all.filter(o => o.storefront === brand.storefront) : all; }, enabled: !!user });
  const addrs = useQuery({ queryKey: ['addresses', user?.id], queryFn: api.addresses, enabled: !!user });
  const addAddr = useMutation({ mutationFn: api.addAddress, onSuccess: () => { setForm(null); qc.invalidateQueries({ queryKey: ['addresses'] }); }, onError: e => setErr(friendly(e)) });
  const delAddr = useMutation({ mutationFn: api.deleteAddress, onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }), onError: e => setErr(friendly(e)) });

  if (!authReady) return <Screen><AccountSk /></Screen>;
  if (!user) return (
    <Screen><Empty title="Join the house" text="Your orders and saved addresses, in one place. You can also check out as a guest." cta={<Button title="Sign in" onPress={() => navigation.navigate('SignIn')} />} /></Screen>
  );
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: sp.md, gap: sp.md, paddingBottom: sp.xl }}>
        <View style={{ gap: 2 }}><H size={32} italic>Salaam, {user.username}</H><T muted>{user.email}</T></View>
        <Label>Your orders</Label>
        {orders.isLoading ? <OrdersListSk /> : orders.error ? <ErrorBox error={orders.error} retry={() => orders.refetch()} /> : !orders.data?.length ? <T muted>No orders yet.</T> : orders.data.map(o => (
          <Pressable key={o.id} accessibilityRole="button" onPress={() => navigation.navigate('Order', { id: o.id })} style={{ borderWidth: 1, borderColor: c.line, padding: sp.md, gap: 2, minHeight: 56 }}>
            <Row k={`Order ${o.orderNumber}`} v={fmt(o.totalAmount)} bold />
            <T muted size={13}>{statusInfo(o).label}{o.createdAt ? ` · ${new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</T>
          </Pressable>
        ))}
        <Label>Addresses</Label>
        {addrs.isLoading ? <AddressesSk /> : null}
        {addrs.data?.map(a => (
          <View key={a.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.md }}>
            <T style={{ flex: 1 }}>{a.label ? `${a.label} · ` : ''}{[a.line1, a.city, a.pincode].filter(Boolean).join(', ')}</T>
            <Pressable accessibilityRole="button" accessibilityLabel="Delete address" onPress={() => a.id && Alert.alert('Delete this address?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => delAddr.mutate(a.id!) }])} style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' }}><Text style={{ fontFamily: font.body, color: c.muted, textDecorationLine: 'underline' }}>Delete</Text></Pressable>
          </View>
        ))}
        {form ? (
          <View style={{ gap: sp.sm }}>
            <Field label="Label (e.g. Home)" value={form.label} onChangeText={t => setForm({ ...form, label: t })} />
            <Field label="Address" value={form.line1} onChangeText={t => setForm({ ...form, line1: t })} />
            <Field label="City" value={form.city} onChangeText={t => setForm({ ...form, city: t })} />
            <Field label="Pincode" value={form.pincode} keyboardType="number-pad" onChangeText={t => setForm({ ...form, pincode: t.replace(/\D/g, '').slice(0, 6) })} />
            {err ? <T style={{ color: c.error }}>{err}</T> : null}
            <Button title="Save address" busy={addAddr.isPending} disabled={!form.line1.trim() || !form.city.trim() || form.pincode.length !== 6} onPress={() => { setErr(''); addAddr.mutate({ ...form, line1: form.line1.trim(), city: form.city.trim() }); }} />
          </View>
        ) : <Button title="Add address" ghost onPress={() => setForm({ label: 'Home', line1: '', city: '', pincode: '' })} />}
        <Button title="Sign out" ghost onPress={() => signOut()} style={{ marginTop: sp.md }} />
        <Label style={{ textAlign: 'center', fontSize: 9 }}>{brand.endorsement}</Label>
      </ScrollView>
    </Screen>
  );
}
