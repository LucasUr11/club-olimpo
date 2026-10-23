// ============================================================================
// Vercel Function — adaptador de la API para producción.
// ----------------------------------------------------------------------------
// `vercel.json` reescribe /api/* hacia este handler. La lógica de rutas,
// validación, auth y repositorios sigue viviendo en `server/api.ts`, por lo
// que el comportamiento local (plugin de Vite) y el serverless es el mismo.
// ============================================================================

import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleApiRequest } from '../server/api.js'
import { envFromProcess } from '../server/env.js'

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await handleApiRequest(req, res, envFromProcess())
}
export { handleApiRequest };
