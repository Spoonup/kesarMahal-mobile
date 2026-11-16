import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type TextStyle, type ViewStyle, type StyleProp } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { c, font, sp, TAP } from './theme';
import { fmt, fromPrice, type Product } from './data';
import { friendly } from './api';
import { Icon } from './icons';

type S<T> = StyleProp<T>;
export const Label = ({ children, style, color }: { children: React.ReactNode; style?: S<TextStyle>; color?: string }) => (
  <Text style={[{ fontFamily: font.label, fontSize: 11, letterSpacing: 2.6, textTransform: 'uppercase', color: color || c.gold }, style]}>{children}</Text>
);
export const H = ({ children, size = 30, style, italic, color }: { children: React.ReactNode; size?: number; style?: S<TextStyle>; italic?: boolean; color?: string }) => (
  <Text style={[{ fontFamily: italic ? font.displayItalic : font.display, fontSize: size, lineHeight: size * 1.1, color: color || c.maroon }, style]}>{children}</Text>
);
export const T = ({ children, style, muted, size = 15, numberOfLines }: { children: React.ReactNode; style?: S<TextStyle>; muted?: boolean; size?: number; numberOfLines?: number }) => (
  <Text numberOfLines={numberOfLines} style={[{ fontFamily: font.light, fontSize: size, lineHeight: size * 1.5, color: muted ? c.muted : c.ink }, style]}>{children}</Text>
);
export const Diamond = ({ size = 8, filled = true, color = c.maroon }: { size?: number; filled?: boolean; color?: string }) => <Icon name="diamond" size={size * 1.5} color={color} filled={filled} stroke={1.3} />;
export const Rule = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: sp.sm }}><View style={s.rule} /><Diamond size={6} /><View style={s.rule} /></View>
);

// `light` = ivory fill with maroon text, for maroon grounds. `outline` = gold hairline with ivory text, also for maroon grounds.
export function Button({ title, onPress, ghost, light, outline, disabled, busy, style }: { title: string; onPress: () => void; ghost?: boolean; light?: boolean; outline?: boolean; disabled?: boolean; busy?: boolean; style?: S<ViewStyle> }) {
  const off = disabled || busy;
  const fg = outline ? c.ivory : ghost || light ? c.maroon : c.ivory;
  const box: ViewStyle = outline ? { borderWidth: 1, borderColor: c.goldLight } : ghost ? { borderWidth: 1, borderColor: c.maroon } : { backgroundColor: light ? c.ivory : c.maroon };
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!off, busy: !!busy }} onPress={off ? undefined : onPress}
      style={({ pressed }) => [s.btn, box, off && (light ? { backgroundColor: 'rgba(245,241,234,0.72)' } : { opacity: 0.45 }), pressed && { opacity: 0.8 }, style]}>
      {busy ? <ActivityIndicator color={fg} /> : <Text style={{ fontFamily: font.medium, fontSize: 13, letterSpacing: 1.8, color: fg }}>{title.toUpperCase()}</Text>}
    </Pressable>
  );
}
export const Badge = ({ label, color, style }: { label: string; color: string; style?: S<ViewStyle> }) => (
  <View style={[{ backgroundColor: color, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start' }, style]}><Text style={{ fontFamily: font.label, fontSize: 8, letterSpacing: 1.6, color: c.ivory, textTransform: 'uppercase' }}>{label}</Text></View>
);
export const Chip = ({ label, on, onPress, color }: { label: string; on: boolean; onPress: () => void; color?: string }) => (
  <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress}
    style={[s.chip, { backgroundColor: on ? c.maroon : 'transparent', borderColor: c.maroon }]}>
    {color ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: on ? c.ivory : color }} /> : null}
    <Text style={{ fontFamily: font.body, fontSize: 13, color: on ? c.ivory : c.maroon }}>{label}</Text>
  </Pressable>
);
export function Stepper({ qty, onChange }: { qty: number; onChange: (n: number) => void }) {
  const b = (t: 'plus' | 'minus', d: number, l: string) => <Pressable accessibilityRole="button" accessibilityLabel={l} onPress={() => onChange(qty + d)} style={s.step}><Icon name={t} size={20} /></Pressable>;
  return <View style={s.stepper}>{b('minus', -1, 'Decrease quantity')}<Text style={{ minWidth: 28, textAlign: 'center', fontFamily: font.medium, fontSize: 16, color: c.ink }}>{qty}</Text>{b('plus', 1, 'Increase quantity')}</View>;
}
// Arch frame (guidelines 07): crops product photography in a jharokha arch.
export const Arch = ({ uri, w, h, color }: { uri?: string; w: number | `${number}%`; h: number; color?: string }) => (
  <View style={{ width: w, height: h, borderTopLeftRadius: 999, borderTopRightRadius: 999, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, overflow: 'hidden', backgroundColor: c.paper, borderWidth: 1, borderColor: color || c.gold }}>
    {uri ? <Image source={{ uri }} contentFit="cover" style={{ flex: 1, backgroundColor: c.canvas }} transition={150} /> : null}
  </View>
);
export const Field = ({ label, error, style, ...p }: TextInputProps & { label: string; error?: string }) => (
  <View style={{ gap: 4 }}>
    <View style={[s.field, { borderColor: error ? c.error : c.line }]}>
      <Text style={{ fontFamily: font.body, fontSize: 11.5, color: c.muted }}>{label}</Text>
      <TextInput placeholderTextColor={c.muted} accessibilityLabel={label} style={[{ fontFamily: font.body, fontSize: 17, color: c.ink, paddingVertical: 0, minHeight: 24 }, style]} {...p} />
    </View>
    {error ? <Text style={{ fontFamily: font.body, fontSize: 12.5, color: c.error }}>{error}</Text> : null}
  </View>
);
export const Loading = ({ text = 'Loading…' }: { text?: string }) => <View style={s.center} accessibilityRole="progressbar"><ActivityIndicator color={c.maroon} /><T muted style={{ marginTop: sp.sm }}>{text}</T></View>;
export const ErrorBox = ({ error, retry }: { error: unknown; retry?: () => void }) => (
  <View style={[s.center, { gap: sp.md }]}><T style={{ color: c.error, textAlign: 'center' }}>{friendly(error)}</T>{retry ? <Button title="Try again" ghost onPress={retry} /> : null}</View>
);
export const Empty = ({ title, text, cta }: { title: string; text?: string; cta?: React.ReactNode }) => (
  <View style={[s.center, { gap: sp.sm, alignSelf: 'stretch', paddingHorizontal: sp.lg }]}><Diamond size={10} filled={false} /><H size={26} style={{ textAlign: 'center', alignSelf: 'stretch' }}>{title}</H>{text ? <T muted style={{ textAlign: 'center', alignSelf: 'stretch' }}>{text}</T> : null}{cta}</View>
);
export const Row = ({ k, v, bold, color }: { k: string; v: string; bold?: boolean; color?: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: sp.md, paddingVertical: 4 }}>
    <T style={{ flex: 1, color: color || c.ink, fontFamily: bold ? font.medium : font.light }}>{k}</T>
    <T style={{ color: color || c.ink, fontFamily: bold ? font.medium : font.body }}>{v}</T>
  </View>
);
export const Screen = ({ children, edges = ['top'] as ('top' | 'bottom')[], style }: { children: React.ReactNode; edges?: ('top' | 'bottom')[]; style?: S<ViewStyle> }) => (
  <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: c.ivory }, style]}>{children}</SafeAreaView>
);

// Shop card (design 1c): bordered ivory tile, square photo, category badge, name, pack sizes, price and a square add button.
export function ProductCard({ p, width, onPress, onAdd, added }: { p: Product; width?: number; onPress: () => void; onAdd?: () => void; added?: boolean }) {
  const price = p.available ? `${p.sizes.length > 1 ? 'from ' : ''}${fmt(fromPrice(p))}` : 'Sold out';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${p.name}, ${price}`} onPress={onPress} style={{ width, backgroundColor: c.ivory, borderWidth: 1, borderColor: c.line }}>
      <View style={{ aspectRatio: 1, backgroundColor: c.paper }}>
        {p.img ? <Image source={{ uri: p.img }} contentFit="cover" style={{ flex: 1, backgroundColor: c.canvas }} transition={150} /> : null}
        <Badge label={p.category} color={p.color} style={{ position: 'absolute', top: 8, left: 8 }} />
      </View>
      <View style={{ flex: 1, padding: 10, paddingLeft: 12, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontFamily: font.display, fontSize: 18, lineHeight: 20, color: c.maroon }}>{p.name}</Text>
        <Text numberOfLines={1} style={{ fontFamily: font.light, fontSize: 11, color: c.soft }}>{p.sizes.map(z => z.label).filter(Boolean).slice(0, 3).join(' · ')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6, minHeight: 42 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: c.ink }}>{price}</Text>
          {onAdd && p.available ? <Pressable accessibilityRole="button" accessibilityLabel={`Add ${p.name} to bag`} hitSlop={6} onPress={onAdd} style={[s.plus, { backgroundColor: added ? c.pine : c.maroon }]}><Icon name={added ? 'check' : 'plus'} size={20} color={c.ivory} /></Pressable> : null}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  rule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.gold },
  btn: { minHeight: 50, paddingHorizontal: sp.lg, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  chip: { minHeight: 38, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 100, borderWidth: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.line, borderRadius: 2 },
  step: { width: TAP, height: TAP, alignItems: 'center', justifyContent: 'center' },
  field: { borderWidth: 1, backgroundColor: c.ivory, paddingHorizontal: 14, paddingVertical: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.lg },
  plus: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }
});
