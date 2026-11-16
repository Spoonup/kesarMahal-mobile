import React, { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { c, font, sp } from '../theme';
import { isBox, roomsOf } from '../data';
import { useStore } from '../store';
import { Button, Chip, Empty, ErrorBox, H, Label, ProductCard, Screen } from '../ui';
import { ShopSk } from '../skeletons';
import { BagButton, TopBand } from './parts';

const PAD = 16, GAP = 12;

export default function Shop({ navigation, route }: NativeStackScreenProps<any>) {
  const { products, catalogue, add } = useStore();
  const { width } = useWindowDimensions();
  const [room, setRoom] = useState('All');
  const [q, setQ] = useState('');
  const [added, setAdded] = useState<Record<string, true>>({});
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  useEffect(() => { // deep links from Home: ?room=… / ?focus
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync a deep link from Home, then clear it
    if (route.params?.room) setRoom(route.params.room);
    if (route.params?.focus) input.current?.focus();
    navigation.setParams({ room: undefined, focus: undefined });
  }, [route.params?.room, route.params?.focus, navigation]);
  const list = products.filter(p => !isBox(p) && (room === 'All' || p.room === room) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  const w = (width - PAD * 2 - GAP) / 2;
  const quick = (id: string) => {
    const p = products.find(x => x.id === id)!;
    if (p.sizes.length !== 1) return navigation.navigate('Product', { id });
    const err = add(p, p.sizes[0]);
    if (err) Alert.alert('Bag is full', err);
    else { setAdded(a => ({ ...a, [id]: true })); setTimeout(() => setAdded(a => { const { [id]: _, ...r } = a; return r; }), 1500); }
  };
  return (
    <Screen>
      <TopBand>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ gap: 4 }}><Label style={{ fontSize: 9.5 }}>{list.length} {list.length === 1 ? 'treasure' : 'treasures'}</Label><H size={34}>The pantry</H></View><BagButton />
        </View>
        <TextInput ref={input} value={q} onChangeText={setQ} placeholder="Search almonds, kesar, kahwa…" placeholderTextColor={c.muted} accessibilityLabel="Search the pantry" returnKeyType="search" clearButtonMode="while-editing"
          style={{ height: 46, borderWidth: 1, borderColor: c.line, paddingHorizontal: 16, fontFamily: font.body, fontSize: 15, color: c.ink, backgroundColor: c.ivory }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
          {['All', ...roomsOf(products)].map(r => <Chip key={r} label={r} on={room === r} onPress={() => setRoom(r)} />)}
        </ScrollView>
      </TopBand>
      <View style={{ flex: 1, backgroundColor: c.paper }}>
        {catalogue.isLoading ? <ShopSk /> : catalogue.error ? <ErrorBox error={catalogue.error} retry={catalogue.refetch} /> : (
          <FlatList data={list} numColumns={2} keyExtractor={p => p.id} columnWrapperStyle={{ gap: GAP }} contentContainerStyle={{ gap: GAP, padding: PAD }}
            ListEmptyComponent={<Empty title="Nothing here yet" text="Try another room or search." cta={room !== 'All' || q ? <Button title="Clear filters" ghost style={{ marginTop: sp.sm }} onPress={() => { setRoom('All'); setQ(''); }} /> : undefined} />} keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => <ProductCard p={item} width={w} added={!!added[item.id]} onPress={() => navigation.navigate('Product', { id: item.id })} onAdd={() => quick(item.id)} />} />
        )}
      </View>
    </Screen>
  );
}
