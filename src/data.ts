import { BOXES, CATCH_ALL, SHELVES, SHELF_COLOR, SHELF_OF } from './content';
import type { Order, ServerProduct } from './api';
import { c } from './theme';

export const fmt = (n?: number) => { const v = Number(n || 0); const d = Number.isInteger(v) ? 0 : 2; return '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }); };
export const shelfOf = (cat?: string) => (cat && SHELF_OF[cat]) || CATCH_ALL;
export const shelfColor = (shelf: string) => SHELF_COLOR[shelf] || c.gold;
const validPrice = (n: unknown) => Number.isFinite(Number(n)) && Number(n) > 0;

export type PSize = { id?: string; label: string; price: number };
export type Product = { id: string; name: string; category: string; room: string; desc: string; img: string; available: boolean; color: string; sizes: PSize[] };

// Server product -> UI product. Sizes without a valid price are dropped so they can never be bagged or checked out.
export const adapt = (p: ServerProduct): Product => {
  const all: PSize[] = p.sizes?.length ? p.sizes.map(s => ({ id: s.id, label: s.label, price: Number(s.price) })) : [{ id: undefined, label: '', price: Number(p.price) }];
  const sizes = all.filter(z => validPrice(z.price));
  const room = shelfOf(p.category);
  return { id: p.id, name: p.name, category: p.category || CATCH_ALL, room, desc: p.description || '', img: p.imageUrl || '', available: p.isAvailable !== false && sizes.length > 0, color: shelfColor(room), sizes };
};
export const sortShelf = (l: Product[]) => [...l].sort((a, b) => SHELVES.indexOf(a.room as never) - SHELVES.indexOf(b.room as never) || a.category.localeCompare(b.category));
export const roomsOf = (l: Product[]) => SHELVES.filter(r => l.some(p => p.room === r));
export const fromPrice = (p: Product) => Math.min(...p.sizes.map(s => s.price));

export const isBox = (p: Product) => BOXES.some(b => b.product === p.name);
export const boxProductOf = (l: Product[], b: (typeof BOXES)[number]) => l.find(p => p.name === b.product && p.available);
const GIFT_ROOMS = ['Dry Fruits & Berries', 'Honey', 'Kesar'];
export const treasuresOf = (l: Product[]) => l.filter(p => p.available && !isBox(p) && GIFT_ROOMS.includes(p.room));

export type BagLine = { productId: string; sizeId?: string; qty: number; gift?: string };
export type Gift = { tier: string; colour: string; note: string };
export const lineKey = (productId: string, sizeId?: string) => `${productId}|${sizeId ?? ''}`;
export const bagKey = (l: BagLine) => lineKey(l.productId, l.sizeId) + (l.gift ? `|${l.gift}` : '');
// Order note for gift boxes (<= 250 chars): structure kept, only the free-text notes are cut.
export const giftNotes = (lines: BagLine[], gifts: Record<string, Gift>) => {
  const ids = [...new Set(lines.map(l => l.gift).filter((id): id is string => !!id && !!gifts[id]))];
  let room = 250 - ids.map(id => `Gift box: ${gifts[id].tier}, ${gifts[id].colour}.`).join(' | ').length - ids.length * 8;
  return ids.map(id => { const g = gifts[id], note = (g.note || '').trim().slice(0, Math.max(0, room)); room -= note.length; return `Gift box: ${g.tier}, ${g.colour}.${note ? ` Note: ${note}` : ''}`; }).join(' | ').slice(0, 250);
};

const STATUS: Record<string, { label: string; step: number; head: string; ended?: boolean }> = {
  pending: { label: 'Received', step: 0, head: 'We have received your order.' }, confirmed: { label: 'Received', step: 0, head: 'We have received your order.' },
  scheduled: { label: 'Received', step: 0, head: 'We have received your order.' }, sourcing: { label: 'Being sourced', step: 0, head: 'We are sourcing your order.' },
  preparing: { label: 'Being prepared', step: 1, head: 'Your order is being prepared.' }, ready: { label: 'Ready', step: 1, head: 'Your order is ready.' },
  packed: { label: 'Packed', step: 1, head: 'Your treasures are packed.' }, shipped: { label: 'Shipped', step: 2, head: 'Your order is on its way.' },
  out_for_delivery: { label: 'Out for delivery', step: 2, head: 'Your order is out for delivery.' }, delivered: { label: 'Delivered', step: 3, head: 'Your order was delivered.' },
  completed: { label: 'Completed', step: 3, head: 'Your order is complete.' }, failed_delivery: { label: 'Delivery failed', step: 2, head: 'We could not deliver this order.', ended: true },
  cancelled: { label: 'Cancelled', step: -1, head: 'This order was cancelled.', ended: true }, rejected: { label: 'Not accepted', step: -1, head: 'We could not accept this order.', ended: true },
  returned: { label: 'Returned', step: -1, head: 'This order was returned.', ended: true }, refunded: { label: 'Refunded', step: -1, head: 'This order was refunded.', ended: true }
};
export const statusInfo = (o: Pick<Order, 'status' | 'paymentStatus' | 'paymentMethod'>) => {
  const key = String(o.status || '').toLowerCase();
  const info = STATUS[key] || { label: key.replace(/_/g, ' ') || 'Unknown', step: 0, head: 'Your order is with us.', ended: false };
  const pay = String(o.paymentStatus || '').toLowerCase(), online = String(o.paymentMethod || '').toLowerCase() === 'online';
  let payment = '';
  if (pay === 'refunded') payment = 'Payment refunded.';
  else if (pay === 'paid') payment = info.ended ? 'Payment was received. Please contact us about your refund.' : 'Payment received.';
  else if (info.ended) payment = '';
  else if (online) payment = 'Payment is pending confirmation.';
  else if (pay === 'unpaid') payment = 'Pay on delivery.';
  return { ...info, ended: !!info.ended, payment };
};
