import { error, json, nowIso, projectRowToFull, projectRowToSummary, randomId, readJson, requireAdmin, slugify, type Env } from '../../_shared';

export const onRequestGet = async ({ params, env }: { params: { id: string }; env: Env }) => {
  try {
  if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(params.id).first();

  if (!project) {
    return error('Nie znaleziono projektu.', 404);
  }

  return json({ project: projectRowToFull(project) });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Błąd API podczas pobierania projektu.', 500);
  }
};

export const onRequestPut = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  try {
  if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
  requireAdmin(request, env);

  const existing = await env.DB.prepare('SELECT id FROM projects WHERE id = ?').bind(params.id).first();

  if (!existing) {
    return error('Nie znaleziono projektu.', 404);
  }

  const body = await readJson(request);
  const title = String(body.title || '').trim();
  const slug = slugify(String(body.slug || title));
  const type = body.type === 'template' ? 'template' : 'project';
  const data = body.data;

  if (!title) {
    return error('Podaj nazwę projektu.');
  }

  if (!data || typeof data !== 'object') {
    return error('Brak poprawnych danych projektu.');
  }

  const dataJson = JSON.stringify(data);
  const dataSize = new TextEncoder().encode(dataJson).length;
  if (dataSize > 1_700_000) {
    return error(`Projekt jest za duży do D1 (${Math.round(dataSize / 1024)} KB). Użyj linków HTTPS do obrazów zamiast lokalnych obrazów base64.`, 413);
  }
  const now = nowIso();

  await env.DB.batch([
    env.DB.prepare('UPDATE projects SET title = ?, slug = ?, type = ?, data_json = ?, updated_at = ? WHERE id = ?').bind(title, slug, type, dataJson, now, params.id),
    env.DB.prepare('INSERT INTO project_versions (id, project_id, title, data_json, created_at) VALUES (?, ?, ?, ?, ?)').bind(randomId('version'), params.id, title, dataJson, now),
  ]);

  const project = await env.DB.prepare('SELECT id, title, slug, type, created_at, updated_at FROM projects WHERE id = ?').bind(params.id).first();
  return json({ project: projectRowToSummary(project) });
  } catch (err) {
    if (err instanceof Response) return err;
    const message = err instanceof Error ? err.message : 'Błąd API podczas aktualizacji projektu.';
    const status = /too big|TOOBIG|za duży/i.test(message) ? 413 : 500;
    return error(message, status);
  }
};

export const onRequestDelete = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  try {
  if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
  requireAdmin(request, env);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM project_versions WHERE project_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(params.id),
  ]);

  return json({ ok: true });
  } catch (err) {
    if (err instanceof Response) return err;
    return error(err instanceof Error ? err.message : 'Błąd API podczas usuwania projektu.', 500);
  }
};
