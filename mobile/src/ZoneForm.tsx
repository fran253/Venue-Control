import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import type { Zone, ZoneInput, ZoneStatus } from './types';
import { ZONE_STATUSES } from './types';
import { styles } from './styles';

interface Props {
  initial?: Zone;
  submitLabel: string;
  disabled: boolean;
  onSubmit: (input: ZoneInput) => void;
  onCancel: () => void;
}

// Formulario compartido por "Nuevo" (POST) y "Editar" (PUT).
// No valida: lo que escribes viaja tal cual y es el backend quien responde 400 con el motivo.
export function ZoneForm({ initial, submitLabel, disabled, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [capacity, setCapacity] = useState(initial ? String(initial.capacity) : '');
  const [status, setStatus] = useState<ZoneStatus>(initial?.status ?? 'OPEN');
  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.label}>NOMBRE</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Main Stage" placeholderTextColor="#6b7280" />
      <Text style={styles.label}>CAPACIDAD</Text>
      <TextInput style={styles.input} value={capacity} onChangeText={setCapacity} keyboardType="numeric" placeholder="5000" placeholderTextColor="#6b7280" />
      <Text style={styles.label}>ESTADO</Text>
      <View style={styles.row}>
        {ZONE_STATUSES.map(option => (
          <Pressable key={option} accessibilityRole="button" onPress={() => setStatus(option)}
            style={[styles.chip, status === option && styles.chipActive]}>
            <Text style={styles.buttonText}>{option}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable accessibilityRole="button" disabled={disabled} style={styles.button}
        onPress={() => onSubmit({ name, capacity: Number(capacity), status })}>
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={disabled} style={styles.buttonGhost} onPress={onCancel}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}
