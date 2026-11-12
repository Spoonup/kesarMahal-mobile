import React, { useEffect, useState } from 'react';
import { Animated, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { c, sp } from './theme';

// One shared pulse drives every skeleton on screen.
const pulse = new Animated.Value(0.45);
let started = false;
const start = () => {
  if (started) return;
  started = true;
  Animated.loop(Animated.sequence([
    Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
    Animated.timing(pulse, { toValue: 0.45, duration: 750, useNativeDriver: true })
  ])).start();
};

export const Sk = ({ w = '100%', h = 14, r = 2, style }: { w?: number | `${number}%`; h?: number; r?: number; style?: StyleProp<ViewStyle> }) => {
  useEffect(start, []);
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: c.line, opacity: pulse }, style]} />;
};
export const SkArch = ({ w, h }: { w: number | `${number}%`; h: number }) => <Sk w={w} h={h} r={0} style={{ borderTopLeftRadius: 999, borderTopRightRadius: 999, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }} />;
// Marks a block as loading for screen readers; children are the visual placeholders.
// Placeholders only appear if loading is still going after SHOW_AFTER ms, so fast loads (cached data, local storage) never flash a skeleton.
const SHOW_AFTER = 300;
export const SkWrap = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), SHOW_AFTER); return () => clearTimeout(t); }, []);
  if (!show) return <View style={{ flex: 1 }} />;
  return <View accessibilityRole="progressbar" accessibilityLabel="Loading" accessibilityState={{ busy: true }} style={style}>{children}</View>;
};

export const SkCard = ({ width }: { width: number }) => (
  <View style={{ width, gap: 8 }}><SkArch w="100%" h={width * 1.15} /><Sk w="40%" h={9} /><Sk w="85%" h={18} /><Sk w="50%" h={14} /></View>
);
export function ShopSk() {
  const { width } = useWindowDimensions();
  const w = (width - sp.md * 3) / 2;
  return <SkWrap style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sp.lg, paddingHorizontal: sp.md }}>{Array.from({ length: 6 }, (_, i) => <SkCard key={i} width={w} />)}</SkWrap>;
}
export function HomeSk() {
  const { width } = useWindowDimensions();
  return (
    <SkWrap style={{ gap: sp.lg }}>
      <View style={{ paddingHorizontal: sp.md, gap: sp.md }}><Sk h={48} /></View>
      <View style={{ marginHorizontal: sp.md, flexDirection: 'row', gap: sp.md, alignItems: 'center', padding: sp.lg, backgroundColor: c.paper }}>
        <View style={{ flex: 1, gap: 10 }}><Sk w="35%" h={9} /><Sk w="80%" h={28} /><Sk h={12} /><Sk w="70%" h={12} /></View>
        <SkArch w={110} h={150} />
      </View>
      <View style={{ gap: sp.sm }}>
        <Sk w="40%" h={24} style={{ marginLeft: sp.md }} />
        <View style={{ flexDirection: 'row', gap: sp.sm, paddingHorizontal: sp.md }}>{[0, 1, 2].map(i => <View key={i} style={{ gap: 6 }}><SkArch w={120} h={130} /><Sk w={80} h={9} /></View>)}</View>
      </View>
      <View style={{ flexDirection: 'row', gap: sp.md, paddingHorizontal: sp.md }}>{[0, 1].map(i => <SkCard key={i} width={Math.min(170, width * 0.42)} />)}</View>
    </SkWrap>
  );
}
export function ProductSk() {
  const { width } = useWindowDimensions();
  const w = Math.min(width - sp.md * 2, 320);
  return (
    <SkWrap style={{ padding: sp.md, gap: sp.md }}>
      <View style={{ alignItems: 'center' }}><SkArch w={w} h={w * 1.2} /></View>
      <Sk w="30%" h={10} /><Sk w="75%" h={34} /><Sk h={12} /><Sk w="90%" h={12} />
      <View style={{ flexDirection: 'row', gap: sp.sm }}>{[0, 1, 2].map(i => <Sk key={i} w={100} h={38} r={19} />)}</View>
    </SkWrap>
  );
}
export function GiftSk() {
  const { width } = useWindowDimensions();
  const w = (width - sp.md * 2 - sp.sm * 2) / 3;
  return (
    <SkWrap style={{ padding: sp.md, gap: sp.md }}>
      <View style={{ flexDirection: 'row', gap: sp.sm }}>{[0, 1, 2].map(i => <Sk key={i} w={96} h={38} r={19} />)}</View>
      <Sk h={6} r={3} /><Sk w="45%" h={14} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm }}>{Array.from({ length: 6 }, (_, i) => <View key={i} style={{ width: w, gap: 6 }}><SkArch w="100%" h={w * 1.1} /><Sk w="80%" h={12} /><Sk w="40%" h={10} /></View>)}</View>
    </SkWrap>
  );
}
export const BagSk = () => (
  <SkWrap style={{ padding: sp.md, gap: sp.md }}>
    {[0, 1, 2].map(i => (
      <View key={i} style={{ flexDirection: 'row', gap: sp.md, alignItems: 'center' }}>
        <Sk w={64} h={76} />
        <View style={{ flex: 1, gap: 8 }}><Sk w="75%" h={18} /><Sk w="30%" h={12} /><Sk w="25%" h={12} /></View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}><Sk w={110} h={44} /><Sk w={50} h={14} /></View>
      </View>
    ))}
  </SkWrap>
);
export const SummarySk = () => (
  <SkWrap style={{ gap: 12 }}>{[0, 1, 2].map(i => <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Sk w="55%" h={14} /><Sk w={50} h={14} /></View>)}<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Sk w="25%" h={18} /><Sk w={70} h={18} /></View></SkWrap>
);
export const OrderSk = () => (
  <SkWrap style={{ padding: sp.md, gap: sp.md }}>
    <Sk w="25%" h={10} /><Sk w="90%" h={34} /><Sk w="60%" h={34} /><Sk h={12} />
    {[0, 1, 2, 3].map(i => <View key={i} style={{ flexDirection: 'row', gap: sp.md, alignItems: 'center' }}><Sk w={14} h={14} /><Sk w="40%" h={20} /></View>)}
    <Sk h={120} />
  </SkWrap>
);
export const OrdersListSk = () => (
  <SkWrap style={{ gap: sp.sm }}>{[0, 1, 2].map(i => <View key={i} style={{ borderWidth: 1, borderColor: c.line, padding: sp.md, gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Sk w="40%" h={16} /><Sk w={60} h={16} /></View><Sk w="30%" h={12} /></View>)}</SkWrap>
);
export const AccountSk = () => (
  <SkWrap style={{ padding: sp.md, gap: sp.md }}>
    <Sk w="60%" h={32} /><Sk w="45%" h={14} /><Sk w="25%" h={10} style={{ marginTop: sp.sm }} /><OrdersListSk />
  </SkWrap>
);
export const AddressesSk = () => <SkWrap style={{ gap: 10 }}>{[0, 1].map(i => <Sk key={i} h={18} w={i ? '60%' : '85%'} />)}</SkWrap>;
export const TraceSk = () => (
  <SkWrap style={{ borderWidth: 1, borderColor: c.line, padding: sp.md, gap: 10 }}><Sk w="40%" h={10} /><Sk w="70%" h={26} />{[0, 1, 2, 3].map(i => <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Sk w="30%" h={14} /><Sk w="35%" h={14} /></View>)}</SkWrap>
);
export const PaymentSk = () => <SkWrap style={{ padding: sp.lg, gap: sp.md, backgroundColor: c.ivory, flex: 1 }}><Sk w="50%" h={26} /><Sk h={52} /><Sk h={52} /><Sk h={52} /></SkWrap>;
