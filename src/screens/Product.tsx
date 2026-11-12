import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PROMISES } from '../content';
import { c, font } from '../theme';
import { fmt } from '../data';
import { FeatureIcon, Heart } from '../icons';
import { useStore } from '../store';
import { Badge, Button, Empty, H, Label, Screen, T } from '../ui';
import { BackBar, RoundBack } from './parts';
import { ProductSk } from '../skeletons';

// Photo on top with floating back + save, then category, name, price per pack, story, brand promises, and a sticky quantity + add bar.
export default function Product({ navigation, route }: NativeStackScreenProps<any>) {
  const { byId, add, catalogue, saved, toggleSaved } = useStore();
  const { width } = useWindowDimensions();
  const inset = useSafeAreaInsets();
  const p = byId(route.params!.id);
  const [i, setI] = useState(0);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  if (!p && catalogue.isLoading) return <Screen><BackBar /><ProductSk /></Screen>;
  if (!p) return <Screen><BackBar /><Empty title="Not found" text="This treasure is no longer in the pantry." /></Screen>;
  const size = p.sizes[i];
  const sized = p.sizes.length > 1;
  const isSaved = saved.includes(p.id);
  const addToBag = () => {
    const err = add(p, size, qty);
    if (err) return Alert.alert('Bag is full', err);
    setDone(true);
  };
  const step = (d: number, label: string, t: string) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { setQty(n => Math.max(1, n + d)); setDone(false); }} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, color: c.maroon, fontFamily: font.body }}>{t}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.ivory }}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={{ width, height: width * 0.95, backgroundColor: c.paper }}>
          {p.img ? <Image source={{ uri: p.img }} contentFit="cover" style={{ flex: 1 }} transition={150} accessibilityLabel={p.name} /> : null}
        </View>
        <View style={{ marginTop: -22, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: c.ivory, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 28, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label color={p.color} style={{ fontSize: 12 }}>{p.category}</Label>
            {!p.available ? <Badge label="Sold out" color={c.kesar} /> : null}
          </View>
          <H size={38}>{p.name}</H>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Text style={{ fontFamily: font.display, fontSize: 34, color: c.ink }}>{size ? fmt(size.price) : ''}</Text>
            {size?.label ? <Text style={{ fontFamily: font.light, fontSize: 14, color: c.soft }}>per {size.label}</Text> : null}
          </View>
          {sized ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {p.sizes.map((z, k) => {
                const on = k === i;
                return (
                  <Pressable key={z.id ?? k} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${z.label}, ${fmt(z.price)}`} onPress={() => { setI(k); setDone(false); }}
                    style={{ minWidth: 76, height: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 100, borderWidth: 1, borderColor: c.maroon, backgroundColor: on ? c.maroon : 'transparent' }}>
                    <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: on ? c.ivory : c.maroon }}>{z.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {p.desc ? <T size={15} style={{ lineHeight: 24, color: c.soft }}>{p.desc}</T> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginTop: 4, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.line }}>
            {PROMISES.map(f => (
              <View key={f.icon} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                <FeatureIcon name={f.icon} />
                <Text style={{ fontFamily: font.body, fontSize: 12, color: c.soft, textAlign: 'center' }}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={{ position: 'absolute', top: inset.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }} pointerEvents="box-none">
        <RoundBack onPress={() => navigation.goBack()} />
        <Pressable accessibilityRole="button" accessibilityLabel={isSaved ? 'Remove from saved' : 'Save'} accessibilityState={{ selected: isSaved }} onPress={() => toggleSaved(p.id)}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
          <Heart filled={isSaved} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(inset.bottom, 14), backgroundColor: c.ivory }}>
        {p.available ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1, borderColor: c.line, backgroundColor: c.ivory }}>
              {step(-1, 'Decrease quantity', '−')}
              <Text style={{ minWidth: 40, textAlign: 'center', fontFamily: font.medium, fontSize: 17, color: c.ink }}>{qty}{size?.label ? <Text style={{ fontSize: 11, color: c.soft }}> × {size.label}</Text> : null}</Text>
              {step(1, 'Increase quantity', '+')}
            </View>
            <Button title={done ? 'Added to bag ✓' : `Add to bag · ${fmt(size.price * qty)}`} onPress={done ? () => navigation.navigate('Bag') : addToBag} style={{ flex: 1, minHeight: 54, paddingHorizontal: 8 }} />
          </>
        ) : <Button title="Sold out" disabled onPress={() => {}} style={{ flex: 1, minHeight: 54 }} />}
      </View>
    </View>
  );
}
