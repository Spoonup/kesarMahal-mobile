import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { api, friendly, type Lot } from '../api';
import { c, sp } from '../theme';
import { Button, Field, H, Label, Row, Screen, T } from '../ui';
import { TraceSk } from '../skeletons';

// Lot lookup by the code printed on the pack seal. Needs GET /api/lots/:code on the backend (see README).
export default function Trace() {
  const [code, setCode] = useState('');
  const [lot, setLot] = useState<Lot | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const look = async () => {
    setBusy(true); setErr(''); setLot(null);
    try { setLot(await api.lot(code.trim())); } catch (e) { setErr((e as { status?: number }).status === 404 ? 'We could not find that lot. Check the code on your pack seal.' : friendly(e)); }
    setBusy(false);
  };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: sp.md, gap: sp.md }} keyboardShouldPersistTaps="handled">
        <View><Label>Orchard to table</Label><H size={34}>Trace your lot</H></View>
        <T muted>Enter the lot code printed on the seal of your pack to see where it grew.</T>
        <Field label="Lot code" value={code} onChangeText={t => setCode(t.toUpperCase())} autoCapitalize="characters" autoCorrect={false} onSubmitEditing={look} returnKeyType="search" />
        <Button title="Find lot" busy={busy} disabled={code.trim().length < 3} onPress={look} />
        {busy ? <TraceSk /> : null}
        {err ? <T style={{ color: c.error }}>{err}</T> : null}
        {lot ? (
          <View style={{ borderWidth: 1, borderColor: c.gold, padding: sp.md, gap: 4 }}>
            <Label>{lot.verified ? 'Verified' : 'Lot'} · {lot.code}</Label><H size={26}>{lot.product}</H>
            {lot.facts.map(f => <Row key={f.label} k={f.label} v={f.value} />)}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
