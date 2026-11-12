// The only module that talks to the Spoonup backend (same API as the Kesar Mahal website). Prices always come from the server.
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { brand } from './content';

const BASE = (process.env.EXPO_PUBLIC_API_BASE || '').replace(/\/$/, '');
if (!BASE) throw new Error('EXPO_PUBLIC_API_BASE is not set. Copy .env.example to .env.');

export type Size = { id?: string; label: string; price: number };
export type ServerProduct = {
  id: string; name: string; category?: string; price: number; description?: string; imageUrl?: string; isAvailable?: boolean;
  fulfillmentKind?: string; sizes?: Size[];
};
export type Settings = { razorpayEnabled?: boolean; razorpayKeyId?: string; googleAuthEnabled?: boolean; currencySymbol?: string };
export type Line = { id: string; sizeId?: string; quantity: number };
export type QuoteLine = { productId: string; name: string; sizeId?: string; sizeLabel?: string; quantity: number; unitPrice: number; baseAmount: number; taxAmount: number; lineTotal: number; imageUrl?: string; expectedShipDays?: number };
export type Quote = {
  lines: QuoteLine[]; totals: { itemsSubtotal: number; taxTotal: number; calculatedTotal: number };
  coupon?: { valid?: boolean; code?: string; discount: number } | null;
};
export type Address = { id?: string; label?: string; line1: string; landmark?: string; city: string; pincode: string; isDefault?: boolean };
export type Order = {
  id: string; orderNumber: string; status: string; paymentStatus?: string; paymentMethod?: string; storefront?: string; createdAt?: string;
  customerName: string; customerPhone?: string; customerEmail?: string; expectedShipDate?: string; deliveryAddress?: Address;
  items: { id: string; name: string; quantity: number; subtotal?: number; baseAmount?: number }[];
  subtotalAmount?: number; taxAmount?: number; totalAmount: number; accessToken?: string;
};
export type Lot = { code: string; product: string; verified?: boolean; facts: { label: string; value: string }[]; labReportUrl?: string };
export type User = { id: string; username: string; email: string; phone?: string };

const MESSAGES: Record<string, string> = {
  INVALID_PINCODE: 'Enter a valid 6-digit pincode.', INVALID_PHONE: 'Enter a valid 10-digit Indian mobile number.',
  EMAIL_REQUIRED: 'Please enter your email address.', INVALID_EMAIL: 'That email address does not look right.',
  PRODUCT_SOLD_OUT: 'One of the items in your bag is sold out. Remove it to continue.',
  PRODUCT_NOT_FOUND: 'One of the items in your bag is no longer available. Remove it to continue.',
  INVALID_SIZE: 'That pack size is no longer available.', EMPTY_CART: 'Your bag is empty.',
  CHECKOUT_EXPIRED: 'This checkout expired. Please try again.', COUPON_NOT_FOUND: 'That coupon code is not valid.',
  COUPON_EXPIRED: 'That coupon has expired.', COUPON_MIN_ORDER: 'Your order is below the minimum for that coupon.',
  COUPON_NEEDS_IDENTITY: 'Enter your mobile number or sign in to use that coupon.', INVALID_COUPON: 'That coupon code is not valid.',
  GATEWAY_UNAVAILABLE: 'That payment method is not available.',
  PAYMENT_AMOUNT_MISMATCH: 'The payment did not match the order total. Please contact us.',
  NOT_AVAILABLE_ON_STOREFRONT: 'That item is not sold on this store. Remove it from your bag to continue.'
};
export type ApiError = Error & { status?: number; code?: string };
export const friendly = (e: unknown) => { const x = e as ApiError; return MESSAGES[x?.code || ''] || x?.message || 'Something went wrong. Please try again.'; };

// Session + guest order tokens. Secure store for the user session, AsyncStorage for per-order guest tokens.
let userToken = '';
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (f: () => void) => { onUnauthorized = f; };
export const loadUserToken = async () => { try { userToken = (await SecureStore.getItemAsync('km_token')) || ''; } catch { userToken = ''; } return userToken; };
export const setUserToken = async (t: string) => { userToken = t; try { if (t) await SecureStore.setItemAsync('km_token', t); else await SecureStore.deleteItemAsync('km_token'); } catch { /* storage unavailable */ } };
const readJson = async <T,>(k: string, d: T): Promise<T> => { try { return JSON.parse((await AsyncStorage.getItem(k)) || 'null') ?? d; } catch { return d; } };
export const orderTokens = () => readJson<Record<string, string>>('km_order_tokens', {});
export const rememberOrder = async (o: Order) => { if (o.accessToken) await AsyncStorage.setItem('km_order_tokens', JSON.stringify({ ...(await orderTokens()), [o.id]: o.accessToken })); };
export const forgetOrders = () => AsyncStorage.removeItem('km_order_tokens');

async function request<T>(path: string, { method = 'GET', body, orderToken }: { method?: string; body?: unknown; orderToken?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { 'x-storefront': brand.storefront };
  if (body) headers['Content-Type'] = 'application/json';
  if (userToken) headers['x-user-token'] = userToken;
  if (orderToken) headers['x-order-token'] = orderToken;
  let res: Response;
  try { res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw Object.assign(new Error('Could not reach the store. Check your connection and try again.'), { code: 'NETWORK' }); }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && userToken) { await setUserToken(''); onUnauthorized(); }
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), { status: res.status, code: data.code });
  return data as T;
}
const post = <T,>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body });

export type Prepared = { checkoutId: string; checkoutToken: string; amount: number; razorpayKeyId?: string; razorpayOrderId?: string };
export const api = {
  settings: () => request<Settings>('/api/settings'),
  // Kesar Mahal sells the Pantry range only; the server filters by x-storefront, this is a belt-and-braces check.
  products: async () => (await request<ServerProduct[]>('/api/products')).filter(p => p.fulfillmentKind === 'DELIVERY_IN_DAYS'),
  quote: (lines: Line[], couponCode?: string, customerPhone?: string) => post<Quote>('/api/cart/quote', { lines, ...(couponCode ? { couponCode, customerPhone } : {}) }),
  prepare: (body: unknown) => post<Prepared>('/api/checkout/prepare', body),
  complete: (body: unknown) => post<{ order?: Order; orders?: Order[] }>('/api/checkout/complete', body),
  abandon: (checkoutId: string) => post('/api/checkout/abandon', { checkoutId }).catch(() => ({})),
  order: async (id: string) => request<Order>(`/api/orders/${encodeURIComponent(id)}`, { orderToken: (await orderTokens())[id] }),
  signup: (body: unknown) => post<{ token: string; user: User }>('/api/auth/signup', body),
  login: (body: unknown) => post<{ token: string; user: User }>('/api/auth/login', body),
  logout: () => post('/api/auth/logout').catch(() => ({})),
  me: () => request<{ user: User }>('/api/auth/me'),
  myOrders: () => request<Order[]>('/api/me/orders'),
  addresses: () => request<Address[]>('/api/me/addresses'),
  addAddress: (body: Address) => post<Address>('/api/me/addresses', body),
  // Not in the Spoonup backend yet (see README). Expected: { code, product, verified, facts:[{label,value}], labReportUrl? }.
  lot: (code: string) => request<Lot>(`/api/lots/${encodeURIComponent(code)}`),
  deleteAddress: (id: string) => request(`/api/me/addresses/${encodeURIComponent(id)}`, { method: 'DELETE' })
};
