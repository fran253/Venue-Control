import type { Zone, ZoneInput, ZoneStatus } from './types';
import { ZONE_STATUSES } from './types';

// URL base SIN /zones al final. Es el único valor que cambia entre local y cloud.
// Local (serverless-offline):  http://localhost:3000/dev
// Cloud (API Gateway):         https://<id>.execute-api.<región>.amazonaws.com/dev
export const API_URL = 'http://localhost:3000/dev';

async function request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const response = await fetch(API_URL + path, {
    method,
    ...(body !== undefined ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
  });
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new Error('HTTP ' + response.status + ': la API no devolvió JSON');
  }
  if (!response.ok) {
    const message = typeof value === 'object' && value !== null && 'message' in value
      ? String(value.message) : response.statusText;
    throw new Error('HTTP ' + response.status + ': ' + message);
  }
  return value;
}

function isZone(value: unknown): value is Zone {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'capacity' in value && typeof value.capacity === 'number' &&
    'status' in value && (ZONE_STATUSES as readonly unknown[]).includes(value.status);
}

const zonePath = (id: string) => '/zones/' + encodeURIComponent(id);

export async function getZones(): Promise<Zone[]> {
  const value = await request('/zones');
  if (!Array.isArray(value) || !value.every(isZone)) throw new Error('La API no devolvió una lista de zonas válida');
  return value;
}

export async function getZone(id: string): Promise<Zone> {
  const value = await request(zonePath(id));
  if (!isZone(value)) throw new Error('La API no devolvió una zona válida');
  return value;
}

export const createZone = (input: ZoneInput) => request('/zones', 'POST', input);
export const replaceZone = (id: string, input: ZoneInput) => request(zonePath(id), 'PUT', input);
export const updateZone = (id: string, status: ZoneStatus) => request(zonePath(id), 'PATCH', { status });
export const deleteZone = (id: string) => request(zonePath(id), 'DELETE');
