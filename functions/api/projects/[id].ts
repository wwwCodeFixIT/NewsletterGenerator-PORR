import { error, json, nowIso, projectRowToFull, projectRowToSummary, randomId, readJson, requireAdmin, slugify, type Env } from '../../_shared';

export const onRequestGet = async ({ params, env }: { params: { id: string }; env: Env }) => {
  const project = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(params.id).first();

  if (!project) {
    return error('Nie znaleziono projektu.', 404);
  }

  return json({ project: projectRowToFull(project) });
};

export const onRequestPut = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
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
  const now = nowIso();

  await env.DB.batch([
    env.DB.prepare('UPDATE projects SET title = ?, slug = ?, type = ?, data_json = ?, updated_at = ? WHERE id = ?').bind(title, slug, type, dataJson, now, params.id),
    env.DB.prepare('INSERT INTO project_versions (id, project_id, title, data_json, created_at) VALUES (?, ?, ?, ?, ?)').bind(randomId('version'), params.id, title, dataJson, now),
  ]);

  const project = await env.DB.prepare('SELECT id, title, slug, type, created_at, updated_at FROM projects WHERE id = ?').bind(params.id).first();
  return json({ project: projectRowToSummary(project) });
};

export const onRequestDelete = async ({ request, params, env }: { request: Request; params: { id: string }; env: Env }) => {
  requireAdmin(request, env);

  await env.DB.batch([
    env.DB.prepare('DELETE FROM project_versions WHERE project_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(params.id),
  ]);

  return json({ ok: true });
};
