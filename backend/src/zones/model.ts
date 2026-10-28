import type { APIGatewayProxyResult } from 'aws-lambda';

export const ZONE_STATUSES = ['OPEN', 'FULL', 'CLOSED'] as const;
export type ZoneStatus = (typeof ZONE_STATUSES)[number];

export interface Zone {
  id: string;
  name: string;
  capacity: number;
  status: ZoneStatus;
}
export type ZoneInput = Omit<Zone, 'id'>;

export const MAX_CAPACITY = 100000;

// Catálogo fijo: no hay persistencia. Las escrituras son simuladas.
export const catalog: Zone[] = [
  { id: 'ZONE-01', name: 'Main Stage', capacity: 5000, status: 'OPEN' },
  { id: 'ZONE-07', name: 'Garden Stage', capacity: 2500, status: 'FULL' },
  { id: 'ZONE-03', name: 'Invernadero', capacity: 1800, status: 'OPEN' },
  { id: 'ZONE-04', name: 'Chill Out', capacity: 800, status: 'CLOSED' }
];

export const json = (statusCode: number, value: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(value)
});

// Devuelve el body como objeto, o null si no es JSON válido o no es un objeto.
export function readBody(text: string | null): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text ?? 'null');
    return typeof value === 'object' && value !== null && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch { return null; }
}

export function isZoneStatus(value: unknown): value is ZoneStatus {
  return typeof value === 'string' && (ZONE_STATUSES as readonly string[]).includes(value);
}

export function isValidCapacity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_CAPACITY;
}

// Devuelve un mensaje de error concreto, o null si el body es una zona válida.
export function zoneInputError(value: Record<string, unknown> | null): string | null {
  if (value === null) return 'Se requiere un objeto JSON válido';
  if (typeof value.name !== 'string' || value.name.trim().length === 0 || value.name.trim().length > 60) {
    return 'name debe ser un texto de 1 a 60 caracteres';
  }
  if (!isValidCapacity(value.capacity)) {
    return 'capacity debe ser un entero entre 1 y ' + MAX_CAPACITY;
  }
  if (!isZoneStatus(value.status)) {
    return 'status debe ser ' + ZONE_STATUSES.join(', ');
  }
  return null;
}
