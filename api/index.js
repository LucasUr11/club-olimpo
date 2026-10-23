// Built by esbuild in npm run build:api
import { handleApiRequest } from "../server/api.js";
import { envFromProcess } from "../server/env.js";

export default async function handler(req, res) {
  return handleApiRequest(req, res, envFromProcess());
}
export { handleApiRequest };
