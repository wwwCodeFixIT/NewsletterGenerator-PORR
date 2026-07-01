import { error, json, nowIso, projectRowToSummary, randomId, readJson, requireAdmin, slugify, type Env } from '../../_shared';

export const onRequestGet = async ({ env }: { env: Env }) => {
  const result = await env.DB.prepare(
    'SELECT id, title, slug, type, created_at, updated_at FROM projects ORDER BY updated_at DESC LIMIT 200'
  ).all();

  return json({ projects: (result.results || []).map(projectRowToSummary) });
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
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
};
