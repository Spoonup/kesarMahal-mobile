import React, { useEffect, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { settle, takeRequest } from '../payment';
import { Loading, Screen } from '../ui';
import { PaymentSk } from '../skeletons';
import { BackBar } from './parts';

// Razorpay Standard Checkout inside a WebView. The server verifies the signature in /checkout/complete; we never trust this result alone.
export default function Payment({ navigation }: NativeStackScreenProps<any>) {
  const req = takeRequest();
  const done = useRef(false);
  const finish = (r: Parameters<typeof settle>[0]) => { if (done.current) return; done.current = true; settle(r); navigation.goBack(); };
  useEffect(() => navigation.addListener('beforeRemove', () => { if (!done.current) { done.current = true; settle({ error: 'Payment cancelled.' }); } }), [navigation]);
  const html = useMemo(() => {
    if (!req) return '';
    const { prepared, prefill, brand, theme } = req;
    const opts = { key: prepared.razorpayKeyId, order_id: prepared.razorpayOrderId, amount: Math.round(prepared.amount * 100), currency: 'INR', name: brand, prefill, theme: { color: theme } };
    return `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0;background:${theme}">
<script src="https://checkout.razorpay.com/v1/checkout.js"></script><script>
var post=function(m){window.ReactNativeWebView.postMessage(JSON.stringify(m))};
var o=${JSON.stringify(opts).replace(/</g, '\\u003c')};
o.handler=function(r){post({proof:{razorpayPaymentId:r.razorpay_payment_id,razorpayOrderId:r.razorpay_order_id,razorpaySignature:r.razorpay_signature}})};
o.modal={ondismiss:function(){post({error:'Payment cancelled.'})}};
window.onload=function(){try{var rz=new Razorpay(o);rz.on('payment.failed',function(e){post({error:(e&&e.error&&e.error.description)||'Payment failed. Please try again.'})});rz.open()}catch(e){post({error:'Could not reach Razorpay. Please try again.'})}};
</script></body>`;
  }, [req]);
  if (!req) return <Screen><BackBar title="Payment" /><Loading text="No payment in progress." /></Screen>;
  return (
    <Screen edges={['top', 'bottom']}>
      <BackBar title="Secure payment" />
      <WebView originWhitelist={['*']} source={{ html, baseUrl: 'https://checkout.razorpay.com' }} javaScriptEnabled domStorageEnabled startInLoadingState renderLoading={() => <PaymentSk />}
        onMessage={e => { try { finish(JSON.parse(e.nativeEvent.data)); } catch { finish({ error: 'Payment failed. Please try again.' }); } }} />
    </Screen>
  );
}
