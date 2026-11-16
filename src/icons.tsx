import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { c } from './theme';

// One hairline icon set: 24 grid, 1.1 stroke, round caps and joins, no fills except where a state needs it.
const P: Record<string, string> = {
  // tabs
  Home: 'M6 20.5V11a6 6 0 0 1 12 0v9.5M3.5 20.5h17M9.500 20.500v-4.500a2.500 2.500 0 0 1 5 0v4.500',
  Shop: 'M5.5 8.5h13l-1 12h-11zM9 8.5V7.5a3 3 0 0 1 6 0v1',
  Gift: 'M4.5 10.5h15v10h-15zM3.5 7.5h17v3h-17zM12 7.5v13M12 7.5C11 4.5 7.5 4.5 7.5 6.2S10.5 7.5 12 7.5zM12 7.5c1-3 4.5-3 4.5-1.3S13.5 7.5 12 7.5z',
  Trace: 'M5 19C5 10.500 9.500 5.500 19 5c0 9.500-5 14-14 14zM5 19l8-8',
  Account: 'M12 4.8a3.6 3.6 0 1 0 0 7.200 3.6 3.6 0 0 0 0-7.200zM5 20c.8-3.600 3.600-5.600 7-5.600s6.200 2 7 5.600',
  // brand promises
  valley: 'M3 19l6-10 4.500 7 2.500-3.500L21 19zM17 5.500a1.200 1.200 0 1 0 0 .01',
  graded: 'M12 3.500a8.500 8.500 0 1 0 0 17 8.500 8.500 0 0 0 0-17zM8.500 12.200l2.500 2.500 4.500-5',
  sealed: 'M12 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM9.500 13.500L8.500 20.500l3.500-2 3.500 2-1-7',
  delivery: 'M3 7h10.500v9H3zM13.500 10h4l3 3v3h-7M7 16a1.800 1.800 0 1 0 0 .01M17 16a1.800 1.800 0 1 0 0 .01',
  // symbols
  plus: 'M12 5.500v13M5.500 12h13',
  minus: 'M5.500 12h13',
  check: 'M5.500 12.500l4.200 4.200L18.500 7.500',
  close: 'M6.500 6.500l11 11M17.500 6.500l-11 11',
  chevronLeft: 'M14.500 5.500L8 12l6.500 6.500',
  chevronRight: 'M9.500 5.500L16 12l-6.500 6.500',
  arrowLeft: 'M19 12H5.500M11 6l-6 6 6 6',
  heart: 'M12 20S4 14.800 4 9.200A4.200 4.200 0 0 1 12 7.300a4.200 4.200 0 0 1 8 1.900C20 14.800 12 20 12 20z',
  diamond: 'M12 4.500l7.500 7.500-7.500 7.500L4.500 12z'
};

export type IconName = keyof typeof P;
// `filled` paints the shape in the icon colour (heart saved, diamond reached). Default size 24.
export const Icon = ({ name, color = c.maroon, size = 24, filled, stroke = 1.1 }: { name: IconName; color?: string; size?: number; filled?: boolean; stroke?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"><Path d={P[name]} /></Svg>
);

export function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} color={focused ? c.maroon : c.muted} stroke={focused ? 1.25 : 1.1} />
      {focused ? <View style={{ position: 'absolute', bottom: -6, width: 3, height: 3, borderRadius: 1.5, backgroundColor: c.gold }} /> : null}
    </View>
  );
}
export const FeatureIcon = ({ name, color = c.maroon }: { name: string; color?: string }) => <Icon name={name} color={color} size={26} />;
export const ArrowLeft = ({ color = c.maroon }: { color?: string }) => <Icon name="arrowLeft" color={color} size={22} />;
export const Heart = ({ filled, color = c.maroon }: { filled?: boolean; color?: string }) => <Icon name="heart" color={color} size={22} filled={filled} />;
