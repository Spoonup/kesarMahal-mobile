import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { c, font, sp, TAP } from '../theme';
import { useStore } from '../store';
import { ArrowLeft } from '../icons';

export function BagButton() {
  const nav = useNavigation<any>();
  const { count } = useStore();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Bag, ${count} items`} onPress={() => nav.navigate('Bag')}
      style={{ height: TAP, minWidth: TAP, paddingHorizontal: 14, borderRadius: 100, borderWidth: 1, borderColor: c.maroon, backgroundColor: c.ivory, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontFamily: font.medium, fontSize: 12.5, color: c.maroon }}>Bag · {count}</Text>
    </Pressable>
  );
}
// Ivory header band with a hairline under it; screen content sits on paper below.
export const TopBand = ({ children }: { children: React.ReactNode }) => (
  <View style={{ backgroundColor: c.ivory, borderBottomWidth: 1, borderColor: c.line, paddingHorizontal: 20, paddingTop: sp.sm, paddingBottom: 14, gap: 14 }}>{children}</View>
);
export const RoundBack = ({ onPress }: { onPress: () => void }) => (
  <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onPress} style={{ width: TAP, height: TAP, borderRadius: TAP / 2, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}>
    <ArrowLeft />
  </Pressable>
);
export function BackBar({ title, right }: { title?: string; right?: React.ReactNode }) {
  const nav = useNavigation<any>();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => nav.goBack()} style={{ width: TAP, height: TAP, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 30, color: c.maroon, fontFamily: font.body }}>‹</Text></Pressable>
      {title ? <Text style={{ fontFamily: font.display, fontSize: 22, color: c.maroon }}>{title}</Text> : null}
      <View style={{ minWidth: TAP, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
