import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { c } from './theme';

// Hairline tab icons drawn from the brand motifs: jharokha arch, pantry jar, wrapped box, orchard leaf, guest.
const PATHS: Record<string, React.ReactNode> = {
  Home: <><Path d="M3 21h18M5 21V11.5a7 7 0 0 1 14 0V21M9.5 21v-7a2.5 2.5 0 0 1 5 0v7" /><Path d="M12 1.6l1.1 1.5L12 4.6l-1.1-1.5z" /></>,
  Shop: <><Path d="M7 8.5h10l1.6 12.5H5.4z" /><Path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /><Path d="M9.5 13h5" /></>,
  Gift: <><Path d="M4.5 10.5h15V21h-15zM3.5 7h17v3.5h-17zM12 7v14" /><Path d="M12 7C10.6 3.4 7 3.6 7 5.4S10 7 12 7zM12 7c1.4-3.6 5-3.4 5-1.6S14 7 12 7z" /></>,
  Trace: <><Path d="M4.5 19.5c0-8.5 5-13.5 15-15 0 10-5 15-15 15z" /><Path d="M4.5 19.5L14 10M9 15h4.5M11.5 12.5V8.5" /></>,
  Account: <><Circle cx={12} cy={8} r={3.6} /><Path d="M4.5 21c0-4.2 3.3-7 7.5-7s7.5 2.8 7.5 7" /></>
};

export function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? c.maroon : c.muted;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 1.5 : 1.2} strokeLinecap="round" strokeLinejoin="round">{PATHS[name]}</Svg>
      {focused ? <View style={{ position: 'absolute', top: -7, width: 5, height: 5, transform: [{ rotate: '45deg' }], backgroundColor: c.gold }} /> : null}
    </View>
  );
}

const FEATURE: Record<string, React.ReactNode> = {
  valley: <><Path d="M2.5 19.5l6.5-11 4 6.5 2.5-4 6 8.5z" /><Circle cx={17.5} cy={6} r={1.8} /></>,
  graded: <><Circle cx={12} cy={12} r={9} /><Path d="M8 12.5l2.7 2.7L16 9.5" /></>,
  sealed: <><Circle cx={12} cy={9.5} r={5.5} /><Path d="M9.5 14.5L8 21.5l4-2 4 2-1.5-7" /><Path d="M12 7l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" /></>,
  delivery: <><Path d="M2.5 6.5h11v9.5h-11zM13.5 9.5h4l3 3v3.5h-7" /><Circle cx={6.5} cy={18} r={1.8} /><Circle cx={17} cy={18} r={1.8} /></>
};
export const FeatureIcon = ({ name, color = c.maroon }: { name: string; color?: string }) => (
  <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round">{FEATURE[name]}</Svg>
);
export const ArrowLeft = ({ color = c.maroon }: { color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
);
export const Heart = ({ filled, color = c.maroon }: { filled?: boolean; color?: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 20.5S3.5 15 3.5 8.9A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.5 1.7C20.5 15 12 20.5 12 20.5z" /></Svg>
);
