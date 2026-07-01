import { error, json, versionRowToFull, type Env } from '../../../_shared';

export const onRequestGet = async ({ params, env }: { params: { id: string }; env: Env }) => {
  try {
    if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
    const result = await env.DB.prepare(
    'SELECT id, project_id, title, data_json, created_at FROM project_versions WHERE project_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(params.id).all();

    return json({ versions: (result.results || []).map(versionRowToFull) });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Błąd API podczas pobierania wersji.', 500);
  }
};
