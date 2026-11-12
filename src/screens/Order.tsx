import React from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api, friendly } from '../api';
import { JOURNEY } from '../content';
import { c, sp } from '../theme';
import { fmt, statusInfo } from '../data';
import { useStore } from '../store';
import { Button, Diamond, ErrorBox, H, Label, Row, Screen, T } from '../ui';
import { OrderSk } from '../skeletons';
import { BackBar } from './parts';

const day = (d?: string) => (d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '');

export default function Order({ navigation, route }: NativeStackScreenProps<any>) {
  const id: string = route.params!.id;
  const { authReady } = useStore();
  const { data: o, error, isLoading, refetch } = useQuery({ queryKey: ['order', id], queryFn: () => api.order(id), enabled: authReady, refetchInterval: 60_000 });
  const info = o ? statusInfo(o) : null;
  return (
    <Screen>
      <BackBar title={o ? `Order ${o.orderNumber}` : 'Order'} />
      {isLoading ? <OrderSk /> : error || !o || !info ? <ErrorBox error={(error as { status?: number } | null)?.status === 404 ? new Error('We could not find that order on this device.') : error ?? new Error(friendly(null))} retry={refetch} /> : (
        <ScrollView contentContainerStyle={{ padding: sp.md, gap: sp.md, paddingBottom: sp.xl }}>
          <Label>{info.label}</Label>
          <H size={34}>{info.ended ? info.head : `Shukriya, ${String(o.customerName).split(' ')[0]}. ${info.head}`}</H>
          <T>{o.expectedShipDate && !info.ended && info.step < 2 ? `Expected to ship by ${day(o.expectedShipDate)}. ` : ''}{info.payment}</T>
          {info.step >= 0 && !info.ended ? (
            <View style={{ paddingTop: sp.sm }}>
              {JOURNEY.map((t, i) => (
                <View key={t} style={{ flexDirection: 'row', gap: sp.md, minHeight: 46 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Diamond size={14} filled={i <= info.step} />
                    {i < JOURNEY.length - 1 ? <View style={{ flex: 1, width: 1.5, backgroundColor: i < info.step ? c.maroon : c.line }} /> : null}
                  </View>
                  <H size={20} color={i <= info.step ? c.maroon : c.muted} style={{ marginTop: -4 }}>{t}</H>
                </View>
              ))}
            </View>
          ) : null}
          <View style={{ borderWidth: 1, borderColor: c.line, padding: sp.md }}>
            {o.items.map(i => <Row key={i.id + i.name} k={`${i.name} × ${i.quantity}`} v={fmt(i.baseAmount ?? i.subtotal)} />)}
            <Row k="Subtotal" v={fmt(o.subtotalAmount)} /><Row k="GST" v={fmt(o.taxAmount)} /><Row k="Total" v={fmt(o.totalAmount)} bold />
          </View>
          {o.deliveryAddress ? <T muted>Delivering to {[o.deliveryAddress.line1, o.deliveryAddress.city, o.deliveryAddress.pincode].filter(Boolean).join(', ')}</T> : null}
          <Button title="Keep browsing" ghost onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />
        </ScrollView>
      )}
    </Screen>
  );
}
