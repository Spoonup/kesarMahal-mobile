// Hands the Razorpay result from the Payment screen back to the checkout that opened it. Navigation params must be serialisable, so a promise lives here.
import type { Prepared } from './api';
export type Proof = { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string };
export type PayRequest = { prepared: Prepared; prefill: { name: string; contact: string; email: string }; brand: string; theme: string };
let pending: { req: PayRequest; resolve: (p: Proof) => void; reject: (e: Error) => void } | null = null;
export const takeRequest = () => pending?.req;
export const startPayment = (req: PayRequest, open: () => void) => new Promise<Proof>((resolve, reject) => { pending = { req, resolve, reject }; open(); });
export const settle = (r: { proof?: Proof; error?: string }) => { const p = pending; pending = null; if (!p) return; if (r.proof) p.resolve(r.proof); else p.reject(new Error(r.error || 'Payment cancelled.')); };
