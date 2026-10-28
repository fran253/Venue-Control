import { StyleSheet } from 'react-native';
import type { ZoneStatus } from './types';

// Paleta tomada de la referencia visual: fondo casi negro, tarjetas gris oscuro,
// acento rosa fucsia y estados en verde / ámbar / rojo.
export const colors = {
  background: '#060606',
  surface: '#141414',
  border: '#262626',
  accent: '#f72b8e',
  text: '#ffffff',
  muted: '#8a8a8a',
  dangerSurface: '#3b161d',
  dangerBorder: '#6b2230',
  dangerText: '#ff8a9b'
};

export const statusColor: Record<ZoneStatus, string> = {
  OPEN: '#4ade80',
  FULL: '#fbbf24',
  CLOSED: '#f87171'
};

export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 48, gap: 16, width: '100%', maxWidth: 760, alignSelf: 'center' },
  eyebrow: { color: colors.accent, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800' },
  text: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  card: { padding: 20, gap: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  cardName: { color: colors.text, fontSize: 22, fontWeight: '800' },
  badge: { fontWeight: '800', letterSpacing: 1 },
  button: { padding: 14, backgroundColor: colors.accent, borderRadius: 12, alignItems: 'center' },
  buttonDanger: { padding: 14, backgroundColor: colors.dangerSurface, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.dangerBorder },
  buttonGhost: { padding: 14, backgroundColor: colors.surface, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.muted, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  input: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.surface, fontSize: 16 },
  error: { color: colors.dangerText, fontSize: 16 },
  result: { color: statusColor.OPEN, fontFamily: 'monospace', fontSize: 14, lineHeight: 20 }
});
