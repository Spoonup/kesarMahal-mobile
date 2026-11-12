import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BOXES, BOX_COLOURS, NOTE_MAX } from '../content';
import { c, font } from '../theme';
import { boxProductOf, fmt, fromPrice, treasuresOf } from '../data';
import { useQuote, useStore } from '../store';
import { Button, Chip, ErrorBox, H, Label, Screen, T } from '../ui';
import { GiftSk } from '../skeletons';
import { BagButton, TopBand } from './parts';

const PAD = 16, GAP = 10;

// Design 1e: pick a box, tap treasures to fill it, total on a maroon bar.
export default function Gift({ navigation }: NativeStackScreenProps<any>) {
  const { products, catalogue, addGift } = useStore();
  const { width } = useWindowDimensions();
  const [tier, setTier] = useState(0);
  const [colour, setColour] = useState(0);
  const [picks, setPicks] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const box = BOXES[tier], boxProduct = boxProductOf(products, box);
  const chosen = picks.slice(0, box.n).map(id => products.find(p => p.id === id)!).filter(Boolean);
  const treasures = useMemo(() => treasuresOf(products), [products]);
  const left = box.n - chosen.length;
  // Cheapest pack of each pick; the server prices the whole box.
  const items = boxProduct ? [boxProduct, ...chosen].map(p => ({ p, size: p.sizes.reduce((a, b) => (b.price < a.price ? b : a)) })) : [];
  const quote = useQuote(items.map(({ p, size }) => ({ productId: p.id, sizeId: size.id, qty: 1 })));
  const w = (width - PAD * 2 - GAP * 2) / 3;
  const toggle = (id: string) => setPicks(cur => { const k = cur.slice(0, box.n); return k.includes(id) ? k.filter(x => x !== id) : k.length >= box.n ? k : [...k, id]; });
  const ready = left === 0 && !!boxProduct && !!quote.data;
  const submit = () => {
    const err = addGift({ tier: box.key, colour: BOX_COLOURS[colour].name, note: note.trim() }, items);
    if (err) return Alert.alert('Bag is full', err);
    setPicks([]); setNote(''); navigation.navigate('Bag');
  };
  return (
    <Screen>
      <TopBand>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ gap: 4 }}><Label color={c.crocus} style={{ fontSize: 9.5 }}>Gifting</Label><H size={32}>Build a box</H></View><BagButton />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {BOXES.map((b, i) => {
            const on = tier === i;
            return (
              <Pressable key={b.key} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${b.key} box, ${b.n} treasures`} onPress={() => setTier(i)}
                style={{ flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: 1, borderColor: c.maroon, backgroundColor: on ? c.maroon : 'transparent' }}>
                <Text style={{ fontFamily: font.display, fontSize: 17, color: on ? c.ivory : c.maroon }}>{b.key}</Text>
                <Text style={{ fontFamily: font.body, fontSize: 11, color: on ? c.ivory : c.maroon }}>{b.n} treasures</Text>
              </Pressable>
            );
          })}
        </View>
      </TopBand>
      <View style={{ flex: 1, backgroundColor: c.paper }}>
        {catalogue.isLoading ? <GiftSk /> : catalogue.error ? <ErrorBox error={catalogue.error} retry={catalogue.refetch} /> : (
          <ScrollView contentContainerStyle={{ padding: PAD, gap: 14 }} keyboardShouldPersistTaps="handled">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 4 }}>
                {Array.from({ length: box.n }, (_, i) => <View key={i} style={{ width: 16, height: 16, transform: [{ rotate: '45deg' }], borderWidth: 1, borderColor: c.gold, backgroundColor: i < chosen.length ? c.maroon : 'transparent' }} />)}
              </View>
              <Text style={{ flex: 1, fontFamily: font.body, fontSize: 13, color: c.soft }}>{!boxProduct ? `The ${box.key} box is not in the pantry right now.` : left > 0 ? `${chosen.length} of ${box.n} chosen · ${left} to go` : 'Box full · ready to wrap'}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
              {treasures.map(p => {
                const on = chosen.includes(p);
                return (
                  <Pressable key={p.id} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${p.name}, ${fmt(fromPrice(p))}`} onPress={() => toggle(p.id)}
                    style={{ width: w, backgroundColor: c.ivory, borderWidth: on ? 2 : 1, borderColor: on ? c.maroon : c.line, opacity: !on && left === 0 ? 0.5 : 1 }}>
                    <View style={{ aspectRatio: 1, backgroundColor: c.paper }}>{p.img ? <Image source={{ uri: p.img }} contentFit="cover" style={{ flex: 1 }} transition={150} /> : null}</View>
                    <View style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: c.maroon, backgroundColor: on ? c.maroon : 'rgba(245,241,234,0.9)', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: c.ivory, fontSize: 12 }}>{on ? '✓' : ''}</Text>
                    </View>
                    <View style={{ padding: 8, gap: 1 }}>
                      <Text numberOfLines={2} style={{ fontFamily: font.display, fontSize: 15, lineHeight: 17, color: c.maroon }}>{p.name}</Text>
                      <Text style={{ fontFamily: font.body, fontSize: 11, color: c.soft }}>{fmt(fromPrice(p))}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Label color={c.muted}>Box</Label>
              {BOX_COLOURS.map((b, i) => <Chip key={b.name} label={b.name} color={b.hex} on={colour === i} onPress={() => setColour(i)} />)}
            </View>
            <TextInput value={note} onChangeText={t => setNote(t.slice(0, NOTE_MAX))} placeholder="Gift note (optional)" placeholderTextColor={c.muted} accessibilityLabel="Gift note" multiline maxLength={NOTE_MAX}
              style={{ minHeight: 72, borderWidth: 1, borderColor: c.line, backgroundColor: c.ivory, padding: 12, fontFamily: font.displayItalic, fontSize: 18, color: c.ink, textAlignVertical: 'top' }} />
            <T muted size={12} style={{ textAlign: 'right' }}>{note.length}/{NOTE_MAX}</T>
          </ScrollView>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: c.maroon }}>
        <View style={{ gap: 2 }}>
          <Label color={c.goldLight} style={{ fontSize: 9 }}>{box.key} box</Label>
          <Text style={{ fontFamily: font.medium, fontSize: 19, color: c.ivory }}>{quote.data && boxProduct ? fmt(quote.data.totals.calculatedTotal) : '—'}</Text>
        </View>
        <Button title="Add to bag" light disabled={!ready} onPress={submit} style={{ minHeight: 50, paddingHorizontal: 22 }} />
      </View>
    </Screen>
  );
}
