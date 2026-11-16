import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { c, font, sp } from '../theme';
import { bagKey, fmt } from '../data';
import { hasUnpriced } from '../payable';
import { useQuote, useStore } from '../store';
import { Button, Empty, ErrorBox, H, Label, Screen, Stepper, T } from '../ui';
import { BagSk } from '../skeletons';
import { BackBar } from './parts';

export default function Bag({ navigation }: NativeStackScreenProps<any>) {
  const { lines, gifts, setQty, remove, removeGift, byId, hydrated, catalogue } = useStore();
  const quote = useQuote(lines);
  const q = quote.data;
  const priced = q?.lines.length === lines.length ? q.lines : [];
  const loose = lines.map((l, i) => ({ l, i })).filter(({ l }) => !l.gift);
  const giftIds = [...new Set(lines.map(l => l.gift).filter((g): g is string => !!g))];
  return (
    <Screen>
      <BackBar title="Your bag" />
      {!hydrated || (lines.length > 0 && catalogue.isLoading) ? <BagSk /> : lines.length === 0 ? <Empty title="Your bag is empty" text="The valley’s harvest is waiting." cta={<Button title="Browse the pantry" ghost onPress={() => navigation.navigate('Tabs', { screen: 'Shop' })} />} /> : (
        <>
          <ScrollView contentContainerStyle={{ padding: sp.md, gap: sp.md }}>
            {loose.map(({ l, i }) => {
              const p = byId(l.productId), pl = priced[lines.indexOf(l)];
              const size = p?.sizes.find(z => z.id === l.sizeId);
              return (
                <View key={bagKey(l)} style={{ flexDirection: 'row', gap: sp.md, alignItems: 'center' }}>
                  <View style={{ width: 64, height: 76, backgroundColor: c.paper }}>{p?.img ? <Image source={{ uri: p.img }} style={{ flex: 1, backgroundColor: c.canvas }} contentFit="cover" /> : null}</View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <H size={19}>{p?.name ?? 'Unavailable item'}</H>
                    <T muted size={13}>{size?.label}</T>
                    <Pressable accessibilityRole="button" onPress={() => remove(bagKey(l))} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ fontFamily: font.body, fontSize: 12.5, color: c.muted, textDecorationLine: 'underline' }}>Remove</Text></Pressable>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Stepper qty={l.qty} onChange={n => setQty(bagKey(l), n)} />
                    <T style={{ fontFamily: font.medium }}>{pl ? fmt(pl.baseAmount) : '…'}</T>
                  </View>
                </View>
              );
            })}
            {giftIds.map(id => {
              const g = gifts[id], gl = lines.filter(l => l.gift === id);
              return (
                <View key={id} style={{ borderWidth: 1, borderColor: c.gold, padding: sp.md, gap: 6 }}>
                  <Label>{g ? `${g.tier} gift box · ${g.colour}` : 'Gift box'}</Label>
                  {gl.map(l => <T key={bagKey(l)} size={14}>{byId(l.productId)?.name ?? 'Unavailable item'}</T>)}
                  {g?.note ? <T style={{ fontFamily: font.displayItalic, fontSize: 18 }}>“{g.note}”</T> : null}
                  <Pressable accessibilityRole="button" onPress={() => Alert.alert('Remove gift box?', undefined, [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => removeGift(id) }])} style={{ minHeight: 44, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: font.body, fontSize: 12.5, color: c.muted, textDecorationLine: 'underline' }}>Remove box</Text>
                  </Pressable>
                </View>
              );
            })}
            {quote.isLoading ? <BagSk /> : quote.error ? <ErrorBox error={quote.error} retry={() => quote.refetch()} /> : null}
          </ScrollView>
          <View style={{ padding: sp.md, borderTopWidth: 1, borderColor: c.line, gap: sp.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T>Subtotal</T><T style={{ fontFamily: font.medium }}>{q ? fmt(q.totals.itemsSubtotal) : '—'}</T>
            </View>
            <T muted size={12.5}>GST and delivery are confirmed at checkout.</T>
            <Button title="Checkout" disabled={!q || quote.isFetching || hasUnpriced(q) || !!quote.error} onPress={() => navigation.navigate('Checkout')} />
          </View>
        </>
      )}
    </Screen>
  );
}
