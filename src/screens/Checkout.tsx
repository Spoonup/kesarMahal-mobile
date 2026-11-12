import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, friendly, rememberOrder } from '../api';
import { brand } from '../content';
import { c, sp } from '../theme';
import { fmt, giftNotes } from '../data';
import { payable } from '../payable';
import { startPayment } from '../payment';
import { useQuote, useStore } from '../store';
import { Button, Empty, ErrorBox, Field, Label, Row, Screen, T } from '../ui';
import { SummarySk, Sk, SkWrap } from '../skeletons';
import { BackBar } from './parts';

const blank = { name: '', phone: '', email: '', line1: '', landmark: '', city: '', pincode: '' };
type F = typeof blank;
const validate = (f: F) => {
  const e: Partial<F> = {};
  if (f.name.trim().length < 2) e.name = 'Enter your full name (at least 2 letters).';
  if (!/^\d{10}$/.test(f.phone)) e.phone = 'Enter a 10-digit mobile number.';
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email address.';
  if (f.line1.trim().length < 3) e.line1 = 'Enter your address.';
  if (f.city.trim().length < 2) e.city = 'Enter your city.';
  if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'Enter a 6-digit pincode.';
  return e;
};

export default function Checkout({ navigation }: NativeStackScreenProps<any>) {
  const { lines, gifts, clear, settings, settingsLoading, user, hydrated } = useStore();
  const qc = useQueryClient();
  const [f, setF] = useState<F>(blank);
  const [tried, setTried] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [applied, setApplied] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const lock = useRef(false);
  const quote = useQuote(lines, applied || undefined, f.phone.length === 10 ? f.phone : undefined);
  const q = quote.data;
  const online = !!(settings?.razorpayEnabled && settings.razorpayKeyId);
  const errors = validate(f);
  const set = (k: keyof F) => (v: string) => setF(s => ({ ...s, [k]: k === 'phone' ? v.replace(/\D/g, '').slice(0, 10) : k === 'pincode' ? v.replace(/\D/g, '').slice(0, 6) : v }));

  useEffect(() => { // signed-in customers: prefill from the account and the default saved address
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time prefill once the account loads
    setF(s => ({ ...s, name: s.name || user.username, email: s.email || user.email || '', phone: s.phone || user.phone?.replace(/\D/g, '').slice(-10) || '' }));
    api.addresses().then(rows => { const a = rows.find(r => r.isDefault) || rows[0]; if (a) setF(s => ({ ...s, line1: s.line1 || a.line1, landmark: s.landmark || a.landmark || '', city: s.city || a.city, pincode: s.pincode || a.pincode })); }).catch(() => {});
  }, [user]);

  // Reflect coupon feedback from the server quote.
  const couponBad = !!applied && q && q.coupon && q.coupon.valid === false;

  const submit = async () => {
    if (lock.current || !q) return;
    if (Object.keys(errors).length) { setTried(true); return; }
    lock.current = true; setBusy(true); setErr('');
    let checkoutId = '';
    try {
      const expected = payable(q);
      const body = {
        customerName: f.name.trim(), customerPhone: f.phone, customerEmail: f.email.trim(),
        lines: lines.map(l => ({ id: l.productId, sizeId: l.sizeId, quantity: l.qty })), paymentMethod: online ? 'online' : 'counter',
        ...(giftNotes(lines, gifts) ? { notes: giftNotes(lines, gifts) } : {}), ...(applied ? { couponCode: applied } : {}),
        deliveryAddress: { line1: f.line1.trim(), landmark: f.landmark.trim(), city: f.city.trim(), pincode: f.pincode }
      };
      const prepared = await api.prepare(body);
      checkoutId = prepared.checkoutId;
      // The amount the server will charge must equal the total we showed. If not, stop before any payment.
      if (Math.abs(prepared.amount - expected) > 0.005) throw Object.assign(new Error(`The total changed to ${fmt(prepared.amount)}. Please review your bag and try again.`), { code: 'TOTAL_CHANGED' });
      const proof = online ? await startPayment({ prepared, prefill: { name: f.name, contact: f.phone, email: f.email }, brand: brand.name, theme: c.maroon }, () => navigation.navigate('Payment')) : {};
      const done = await api.complete({ checkoutId, checkoutToken: prepared.checkoutToken, ...proof });
      const order = done.order || done.orders?.[0];
      if (!order) throw new Error('Your order was placed but could not be shown. Check your account orders, or contact us with your phone number.');
      await rememberOrder(order);
      clear(); qc.invalidateQueries({ queryKey: ['orders'] });
      navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'Order', params: { id: order.id } }] });
    } catch (ex) {
      if (checkoutId) api.abandon(checkoutId);
      setErr(friendly(ex)); lock.current = false; setBusy(false);
    }
  };

  if (!hydrated) return <Screen><BackBar title="Checkout" /><View style={{ padding: sp.md }}><SummarySk /></View></Screen>;
  if (!lines.length && !busy) return <Screen><BackBar title="Checkout" /><Empty title="Your bag is empty" /></Screen>;
  const e = (k: keyof F) => (tried ? errors[k] : undefined);
  return (
    <Screen>
      <BackBar title="Checkout" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: sp.md, gap: sp.md, paddingBottom: sp.xl }} keyboardShouldPersistTaps="handled">
          {!user ? (
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SignIn')} style={{ minHeight: 44, justifyContent: 'center' }}>
              <T muted>Checking out as a guest. <Text style={{ color: c.maroon, textDecorationLine: 'underline' }}>Sign in</Text> to use saved details.</T>
            </Pressable>
          ) : null}
          <Label>Deliver to</Label>
          <Field label="Full name" value={f.name} onChangeText={set('name')} error={e('name')} autoComplete="name" textContentType="name" />
          <Field label="Mobile number" value={f.phone} onChangeText={set('phone')} error={e('phone')} keyboardType="number-pad" autoComplete="tel" textContentType="telephoneNumber" />
          <Field label="Email" value={f.email} onChangeText={set('email')} error={e('email')} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
          <Field label="Address" value={f.line1} onChangeText={set('line1')} error={e('line1')} autoComplete="street-address" textContentType="streetAddressLine1" />
          <Field label="Landmark (optional)" value={f.landmark} onChangeText={set('landmark')} />
          <View style={{ flexDirection: 'row', gap: sp.sm }}>
            <View style={{ flex: 1 }}><Field label="City" value={f.city} onChangeText={set('city')} error={e('city')} textContentType="addressCity" /></View>
            <View style={{ flex: 1 }}><Field label="Pincode" value={f.pincode} onChangeText={set('pincode')} error={e('pincode')} keyboardType="number-pad" textContentType="postalCode" /></View>
          </View>
          <Label>Coupon</Label>
          <View style={{ flexDirection: 'row', gap: sp.sm, alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}><Field label="Coupon code" value={coupon} onChangeText={t => setCoupon(t.toUpperCase())} autoCapitalize="characters" /></View>
            <Button title={applied ? 'Remove' : 'Apply'} ghost disabled={!applied && !coupon.trim()} onPress={() => { if (applied) { setApplied(''); setCoupon(''); } else setApplied(coupon.trim()); }} style={{ minHeight: 56 }} />
          </View>
          {couponBad ? <T style={{ color: c.error }}>That coupon can’t be applied to this bag.</T> : null}
          <Label>Pay with</Label>
          {settingsLoading ? <SkWrap><Sk w="60%" h={16} /></SkWrap> : <T>{online ? 'Online · UPI, card or netbanking (Razorpay)' : 'Pay on delivery'}</T>}
          <Label>Summary</Label>
          {quote.error ? <ErrorBox error={quote.error} retry={() => quote.refetch()} /> : q ? (
            <View>
              {q.lines.map((l, i) => <Row key={i} k={`${l.name} × ${l.quantity}`} v={fmt(l.baseAmount)} />)}
              <Row k="GST" v={fmt(q.totals.taxTotal)} />
              {q.coupon?.valid ? <Row k={`Coupon ${q.coupon.code ?? ''}`} v={`− ${fmt(q.coupon.discount)}`} color={c.pine} /> : null}
              <Row k="Total" v={fmt(payable(q))} bold />
            </View>
          ) : <SummarySk />}
          {err ? <T style={{ color: c.error }} >{err}</T> : null}
        </ScrollView>
        <View style={{ padding: sp.md, borderTopWidth: 1, borderColor: c.line }}>
          <Button title={q ? `${online ? 'Pay' : 'Place order'} ${fmt(payable(q))}` : 'Checkout'} busy={busy} disabled={!q || quote.isFetching || settingsLoading} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
