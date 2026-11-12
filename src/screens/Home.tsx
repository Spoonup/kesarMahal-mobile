import React from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { brand } from '../content';
import { c, font, sp } from '../theme';
import { fromPrice, fmt, isBox, roomsOf, shelfColor, treasuresOf } from '../data';
import { useStore } from '../store';
import { Arch, ErrorBox, H, Label, ProductCard, Screen, T } from '../ui';
import { HomeSk } from '../skeletons';
import { BagButton } from './parts';

export default function Home({ navigation }: NativeStackScreenProps<any>) {
  const { products, catalogue, user } = useStore();
  const { width } = useWindowDimensions();
  const shop = products.filter(p => p.available && !isBox(p));
  const hero = shop.find(p => p.room === 'Kesar') || shop[0];
  const rooms = roomsOf(products);
  const gifted = treasuresOf(products).slice(0, 6);
  const cardW = Math.min(170, width * 0.42);
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, backgroundColor: c.ivory, borderBottomWidth: 1, borderColor: c.line }}>
        <View style={{ gap: 3 }}><Text style={{ fontFamily: font.label, fontSize: 21, color: c.maroon }}>{brand.name}</Text><Label color={c.pine} style={{ fontSize: 7.5 }}>{brand.tagline}</Label></View>
        <BagButton />
      </View>
      <View style={{ flex: 1, backgroundColor: c.paper }}>
      {catalogue.isLoading ? <HomeSk /> : catalogue.error ? <ErrorBox error={catalogue.error} retry={catalogue.refetch} /> : (
        <ScrollView contentContainerStyle={{ paddingTop: 18, paddingBottom: sp.xl, gap: sp.lg }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: sp.md, gap: sp.md }}>
            {user ? <H size={26} italic>Salaam, {user.username}</H> : null}
            <Pressable accessibilityRole="search" onPress={() => navigation.navigate('Shop', { focus: true })} style={{ minHeight: 48, borderWidth: 1, borderColor: c.line, backgroundColor: c.ivory, paddingHorizontal: 14, justifyContent: 'center' }}>
              <T muted>Search almonds, kesar, kahwa…</T>
            </Pressable>
          </View>
          {hero ? (
            <Pressable accessibilityRole="button" accessibilityLabel={`${hero.name}, shop now`} onPress={() => navigation.navigate('Product', { id: hero.id })}
              style={{ marginHorizontal: sp.md, backgroundColor: c.maroon, padding: sp.lg, flexDirection: 'row', gap: sp.md, alignItems: 'center' }}>
              <View style={{ flex: 1, gap: 8 }}>
                <Label color={c.gold}>New harvest</Label>
                <H size={30} color={c.ivory}>{hero.name}</H>
                <T style={{ color: '#EADFD0' }} numberOfLines={3}>{hero.desc}</T>
                <Text style={{ fontFamily: font.medium, fontSize: 12, letterSpacing: 1.8, color: c.ivory, marginTop: 4 }}>SHOP NOW · {fmt(fromPrice(hero))}</Text>
              </View>
              <Arch uri={hero.img} w={110} h={150} />
            </Pressable>
          ) : null}
          <View style={{ gap: sp.sm }}>
            <H size={24} style={{ paddingHorizontal: sp.md }}>The rooms</H>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.md, gap: sp.sm }}>
              {rooms.map(r => (
                <Pressable key={r} accessibilityRole="button" accessibilityLabel={r} onPress={() => navigation.navigate('Shop', { room: r })} style={{ width: 120, gap: 6 }}>
                  <Arch uri={products.find(p => p.room === r && p.img)?.img} w={120} h={130} color={shelfColor(r)} />
                  <Label color={shelfColor(r)} style={{ fontSize: 9.5 }}>{r}</Label>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          {gifted.length ? (
            <View style={{ gap: sp.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: sp.md }}>
                <H size={24}>Most gifted</H>
                <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Gift')} style={{ minHeight: 44, justifyContent: 'center' }}><Label color={c.maroon}>Build a box</Label></Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: sp.md, gap: sp.md }}>
                {gifted.map(p => <ProductCard key={p.id} p={p} width={cardW} onPress={() => navigation.navigate('Product', { id: p.id })} />)}
              </ScrollView>
            </View>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Trace')} style={{ marginHorizontal: sp.md, borderWidth: 1, borderColor: c.gold, padding: sp.md, gap: 4 }}>
            <Label>Orchard to table</Label><H size={22}>Trace your lot</H><T muted>Scan the seal on your pack to see where it grew.</T>
          </Pressable>
          <Label style={{ textAlign: 'center', fontSize: 9 }}>{brand.endorsement}</Label>
        </ScrollView>
      )}
      </View>
    </Screen>
  );
}
