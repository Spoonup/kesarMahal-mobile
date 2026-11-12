import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { api, forgetOrders, loadUserToken, setUnauthorizedHandler, setUserToken, type Quote, type Settings, type User } from './api';
import { MAX_LINES, MAX_QTY } from './content';
import { adapt, bagKey, lineKey, sortShelf, type BagLine, type Gift, type Product, type PSize } from './data';

type Ctx = {
  saved: string[]; toggleSaved: (id: string) => void;
  lines: BagLine[]; gifts: Record<string, Gift>; count: number; hydrated: boolean;
  add: (p: Product, s: PSize, qty?: number) => string | null; setQty: (key: string, qty: number) => void; remove: (key: string) => void;
  addGift: (meta: Gift, items: { p: Product; size: PSize }[]) => string | null; removeGift: (id: string) => void; clear: () => void;
  products: Product[]; catalogue: { isLoading: boolean; error: Error | null; refetch: () => void };
  byId: (id: string) => Product | undefined; settings?: Settings; settingsLoading: boolean;
  user: User | null; authReady: boolean; signIn: (r: { token: string; user: User }) => Promise<void>; signOut: () => Promise<void>;
};
const C = createContext<Ctx>(null as never);
export const useStore = () => useContext(C);

const usePersist = <T,>(k: string, d: T) => {
  const [v, set] = useState<T>(d); const [ok, setOk] = useState(false);
  useEffect(() => { AsyncStorage.getItem(k).then(s => { if (s) set(JSON.parse(s)); }).catch(() => {}).finally(() => setOk(true)); }, [k]);
  useEffect(() => { if (ok) AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {}); }, [k, v, ok]);
  return [v, set, ok] as const;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // The bag holds only ids and quantities. Prices are never stored or sent.
  const [lines, setLines, linesOk] = usePersist<BagLine[]>('km_bag', []);
  const [gifts, setGifts] = usePersist<Record<string, Gift>>('km_gifts', {});
  const [saved, setSaved] = usePersist<string[]>('km_saved', []); // device-only favourites; the backend has no wishlist
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const cat = useQuery({ queryKey: ['products'], queryFn: api.products, select: rows => sortShelf(rows.map(adapt)) });
  const settingsQ = useQuery({ queryKey: ['settings'], queryFn: api.settings });
  const settings = settingsQ.data;
  const products = useMemo(() => cat.data ?? [], [cat.data]);
  const byId = useCallback((id: string) => products.find(p => p.id === id), [products]);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    loadUserToken().then(t => (t ? api.me().then(r => setUser(r.user)).catch(() => {}) : null)).finally(() => setAuthReady(true));
  }, []);

  // Once the catalogue is known, drop bag lines whose product or size is gone or sold out (a gift box is all or nothing).
  const cleaned = useRef(false);
  useEffect(() => {
    if (!cat.data || !linesOk || cleaned.current) return;
    cleaned.current = true;
    const ok = (l: BagLine) => { const p = byId(l.productId); return !!p?.available && p.sizes.some(s => s.id === l.sizeId); };
    const bad = new Set(lines.filter(l => l.gift && !ok(l)).map(l => l.gift));
    setLines(cur => cur.filter(l => ok(l) && !bad.has(l.gift)));
  }, [cat.data, linesOk, lines, byId, setLines]);

  const add: Ctx['add'] = (p, size, qty = 1) => {
    const hit = lines.find(l => !l.gift && lineKey(l.productId, l.sizeId) === lineKey(p.id, size.id));
    if (!hit && lines.length >= MAX_LINES) return `A bag holds at most ${MAX_LINES} different items`;
    setLines(cur => hit ? cur.map(l => (l === hit ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l)) : [...cur, { productId: p.id, sizeId: size.id, qty: Math.min(MAX_QTY, qty) }]);
    return null;
  };
  const setQty: Ctx['setQty'] = (key, qty) => setLines(cur => cur.map(l => (bagKey(l) === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l)));
  const remove: Ctx['remove'] = key => setLines(cur => cur.filter(l => bagKey(l) !== key));
  const addGift: Ctx['addGift'] = (meta, items) => {
    if (lines.length + items.length > MAX_LINES) return `A bag holds at most ${MAX_LINES} different items`;
    const id = 'g' + Date.now().toString(36);
    setGifts(g => ({ ...g, [id]: meta }));
    setLines(cur => [...cur, ...items.map(({ p, size }) => ({ productId: p.id, sizeId: size.id, qty: 1, gift: id }))]);
    return null;
  };
  const removeGift = (id: string) => { setLines(cur => cur.filter(l => l.gift !== id)); setGifts(({ [id]: _, ...rest }) => rest); };
  const clear = () => { setLines([]); setGifts({}); };
  const signIn: Ctx['signIn'] = async ({ token, user: u }) => { await setUserToken(token); setUser(u); };
  const signOut: Ctx['signOut'] = async () => { api.logout(); await setUserToken(''); await forgetOrders(); setUser(null); };

  const toggleSaved = (id: string) => setSaved(cur => (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]));
  const value: Ctx = {
    saved, toggleSaved, lines, gifts, count: lines.reduce((a, l) => a + l.qty, 0), hydrated: linesOk, add, setQty, remove, addGift, removeGift, clear, products,
    catalogue: { isLoading: cat.isLoading, error: cat.error, refetch: () => { cat.refetch(); } }, byId, settings, settingsLoading: settingsQ.isLoading, user, authReady, signIn, signOut
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}

// Prices the bag on the server (never locally). Re-quotes whenever the bag or coupon changes.
export function useQuote(lines: BagLine[], coupon?: string, phone?: string) {
  const payload = lines.map(l => ({ id: l.productId, sizeId: l.sizeId, quantity: l.qty }));
  return useQuery<Quote, Error>({ queryKey: ['quote', payload, coupon, phone], queryFn: () => api.quote(payload, coupon, phone), enabled: lines.length > 0, placeholderData: p => p });
}
