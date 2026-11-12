import type { Quote } from './api';
export const payable = (q: Quote) => Math.max(0, Math.round((q.totals.calculatedTotal - (q.coupon?.valid ? q.coupon.discount : 0)) * 100) / 100);
// A quote with an unpriced line must never reach checkout.
export const hasUnpriced = (q?: Quote) => !!q && (q.lines.some(l => !(l.baseAmount > 0)) || !(q.totals.calculatedTotal > 0));
