import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { readBody, zoneInputError, json } from './model.js';
import type { ZoneStatus } from './model.js';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const input = readBody(event.body);
  const problem = zoneInputError(input);
  if (problem !== null || input === null) return json(400, { message: problem ?? 'Body inválido' });
  console.log('POST zona:', input.name);
  // Escritura simulada: devuelve la zona con un id fijo, sin guardarla.
  return json(201, {
    id: 'ZONE-NEW',
    name: String(input.name).trim(),
    capacity: input.capacity as number,
    status: input.status as ZoneStatus
  });
};
