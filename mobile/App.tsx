import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Zone, ZoneInput } from './src/types';
import { ZONE_STATUSES } from './src/types';
import { getZones, getZone, createZone, replaceZone, updateZone, deleteZone } from './src/api';
import { ZoneForm } from './src/ZoneForm';
import { styles, statusColor } from './src/styles';

type Screen =
  | { name: 'list' }
  | { name: 'detail'; zone: Zone }
  | { name: 'new' }
  | { name: 'edit'; zone: Zone };

const errorText = (cause: unknown) => (cause instanceof Error ? cause.message : 'Error de red');

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'list' });
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const loadZones = useCallback(async () => {
    setLoading(true);
    try { setZones(await getZones()); }
    catch (cause) { setError(errorText(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadZones(); }, [loadZones]);

  // GET /zones/{id}: pide la zona al backend antes de enseñar el detalle.
  async function openDetail(id: string) {
    setLoading(true); setError(''); setResult('');
    try { setScreen({ name: 'detail', zone: await getZone(id) }); }
    catch (cause) { setError(errorText(cause)); }
    finally { setLoading(false); }
  }

  // Ejecuta una escritura (POST/PUT/PATCH/DELETE), enseña la respuesta real del backend
  // y vuelve al listado. Si falla, se queda en la pantalla y muestra el error.
  async function write(label: string, task: () => Promise<unknown>) {
    setLoading(true); setError(''); setResult('');
    try {
      const response = await task();
      setResult(label + '\n' + JSON.stringify(response, null, 2));
      setScreen({ name: 'list' });
      await loadZones();
    } catch (cause) {
      setError(errorText(cause));
    } finally { setLoading(false); }
  }

  const goList = () => { setError(''); setScreen({ name: 'list' }); };

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>VENUE CONTROL</Text>
        <Text style={styles.title}>Espacios</Text>
        <Text style={styles.note}>Escrituras simuladas: la API responde la operación pero el catálogo es fijo y no cambia.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        {screen.name === 'list' ? (
          <>
            <Text style={styles.text}>{zones.length} zonas · GET /zones</Text>
            {zones.map(zone => (
              <Pressable key={zone.id} accessibilityRole="button" disabled={loading} style={styles.card} onPress={() => void openDetail(zone.id)}>
                <Text style={styles.cardName}>{zone.name}</Text>
                <Text style={styles.text}>Capacidad {zone.capacity.toLocaleString('es-ES')}</Text>
                <Text style={[styles.badge, { color: statusColor[zone.status] }]}>● {zone.status}</Text>
              </Pressable>
            ))}
            <Pressable accessibilityRole="button" disabled={loading} style={styles.button} onPress={() => { setError(''); setResult(''); setScreen({ name: 'new' }); }}>
              <Text style={styles.buttonText}>＋ Nuevo espacio</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} style={styles.buttonGhost} onPress={() => { setError(''); void loadZones(); }}>
              <Text style={styles.buttonText}>{loading ? 'Cargando…' : 'Recargar'}</Text>
            </Pressable>
          </>
        ) : null}

        {screen.name === 'detail' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>{screen.zone.id}</Text>
              <Text style={styles.cardName}>{screen.zone.name}</Text>
              <Text style={styles.text}>Capacidad {screen.zone.capacity.toLocaleString('es-ES')}</Text>
              <Text style={[styles.badge, { color: statusColor[screen.zone.status] }]}>● {screen.zone.status}</Text>
            </View>
            <Text style={styles.label}>CAMBIAR ESTADO · PATCH</Text>
            <View style={styles.row}>
              {ZONE_STATUSES.map(option => (
                <Pressable key={option} accessibilityRole="button" disabled={loading} style={styles.chip}
                  onPress={() => void write('PATCH ' + screen.zone.id + ' → ' + option, () => updateZone(screen.zone.id, option))}>
                  <Text style={styles.buttonText}>{option}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" disabled={loading} style={styles.button} onPress={() => setScreen({ name: 'edit', zone: screen.zone })}>
              <Text style={styles.buttonText}>Editar (PUT)</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} style={styles.buttonDanger}
              onPress={() => void write('DELETE ' + screen.zone.id, () => deleteZone(screen.zone.id))}>
              <Text style={styles.buttonText}>Eliminar (DELETE)</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={loading} style={styles.buttonGhost} onPress={goList}>
              <Text style={styles.buttonText}>Volver</Text>
            </Pressable>
          </>
        ) : null}

        {screen.name === 'new' ? (
          <ZoneForm submitLabel="Crear (POST)" disabled={loading} onCancel={goList}
            onSubmit={(input: ZoneInput) => void write('POST /zones', () => createZone(input))} />
        ) : null}

        {screen.name === 'edit' ? (
          <ZoneForm initial={screen.zone} submitLabel="Guardar (PUT)" disabled={loading} onCancel={goList}
            onSubmit={(input: ZoneInput) => void write('PUT ' + screen.zone.id, () => replaceZone(screen.zone.id, input))} />
        ) : null}

        {loading ? <Text style={styles.text}>Enviando…</Text> : null}
        <Text accessibilityLiveRegion="polite" style={styles.result}>{result}</Text>
      </ScrollView>
    </View>
  );
}
