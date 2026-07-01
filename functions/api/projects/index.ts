import { error, json, nowIso, projectRowToSummary, randomId, readJson, requireAdmin, slugify, type Env } from '../../_shared';

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
    const result = await env.DB.prepare(
    'SELECT id, title, slug, type, created_at, updated_at FROM projects ORDER BY updated_at DESC LIMIT 200'
  ).all();

    return json({ projects: (result.results || []).map(projectRowToSummary) });
  } catch (err) {
    return error(err instanceof Error ? err.message : 'Błąd API podczas pobierania projektów.', 500);
  }
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
  if (!env.DB) return error('Brak bindingu D1 DB w Cloudflare Pages.', 500);
  requireAdmin(request, env);

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
  const existing = await env.DB.prepare('SELECT id FROM projects WHERE slug = ?').bind(slug).first();
  const id = existing?.id || randomId('project');

  if (existing?.id) {
    await env.DB.batch([
      env.DB.prepare('UPDATE projects SET title = ?, type = ?, data_json = ?, updated_at = ? WHERE id = ?').bind(title, type, dataJson, now, id),
      env.DB.prepare('INSERT INTO project_versions (id, project_id, title, data_json, created_at) VALUES (?, ?, ?, ?, ?)').bind(randomId('version'), id, title, dataJson, now),
    ]);
  } else {
    await env.DB.batch([
      env.DB.prepare('INSERT INTO projects (id, title, slug, type, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, title, slug, type, dataJson, now, now),
      env.DB.prepare('INSERT INTO project_versions (id, project_id, title, data_json, created_at) VALUES (?, ?, ?, ?, ?)').bind(randomId('version'), id, title, dataJson, now),
    ]);
  }

  const project = await env.DB.prepare('SELECT id, title, slug, type, created_at, updated_at FROM projects WHERE id = ?').bind(id).first();
  return json({ project: projectRowToSummary(project) }, { status: existing?.id ? 200 : 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    const message = err instanceof Error ? err.message : 'Błąd API podczas zapisu projektu.';
    const status = /too big|TOOBIG|za duży/i.test(message) ? 413 : 500;
    return error(message, status);
  }
};
