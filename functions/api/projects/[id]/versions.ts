import { json, versionRowToFull, type Env } from '../../../_shared';

export const onRequestGet = async ({ params, env }: { params: { id: string }; env: Env }) => {
  const result = await env.DB.prepare(
    'SELECT id, project_id, title, data_json, created_at FROM project_versions WHERE project_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(params.id).all();

  return json({ versions: (result.results || []).map(versionRowToFull) });
};
