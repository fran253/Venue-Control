import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { catalog, readBody, zoneInputError, json } from './model.js';
import type { ZoneStatus } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) return json(400, { message: 'Falta id' });
  if (!catalog.some(zone => zone.id === id)) return json(404, { message: 'Zona no encontrada' });
  const input = readBody(event.body);
  const problem = zoneInputError(input);
  if (problem !== null || input === null) return json(400, { message: 'PUT requiere name, capacity y status. ' + (problem ?? '') });
  console.log('PUT zona:', id);
  return json(200, {
    id,
    name: String(input.name).trim(),
    capacity: input.capacity as number,
    status: input.status as ZoneStatus,
    operation: 'REPLACED'
  });
};
