import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, readBody, isZoneStatus, ZONE_STATUSES, json } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  if (!catalog.some(zone => zone.id === id)) return json(404, { message: 'Zona no encontrada' });
  const input = readBody(event.body);
  if (!input || Object.keys(input).length !== 1 || !isZoneStatus(input.status)) {
    return json(400, { message: 'PATCH admite únicamente status: ' + ZONE_STATUSES.join(', ') });
  }
  console.log('PATCH zona:', id);
  return json(200, { id, changes: { status: input.status }, operation: 'UPDATED' });
};
