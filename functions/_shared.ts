export interface Env {
  DB: any;
  ADMIN_TOKEN?: string;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(init.headers || {}),
    },
  });
}

export function error(message: string, status = 400) {
  return json({ error: message }, { status });
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch (_error) {
    throw new Error('Nieprawidłowy JSON w żądaniu.');
  }
}

export function requireAdmin(request: Request, env: Env) {
  const expected = env.ADMIN_TOKEN;

  if (!expected) {
    return;
  }

  const provided = request.headers.get('X-Admin-Token') || '';

  if (provided !== expected) {
    throw new Response(JSON.stringify({ error: 'Brak uprawnień do zapisu. Podaj poprawny token administratora.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
}

export function slugify(value: string): string {
  return (value || 'newsletter')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'newsletter';
}

export function nowIso() {
  return new Date().toISOString();
}

export function randomId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function projectRowToSummary(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectRowToFull(row: any) {
  return {
    ...projectRowToSummary(row),
    data: JSON.parse(row.data_json),
  };
}

export function versionRowToFull(row: any) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    data: JSON.parse(row.data_json),
    createdAt: row.created_at,
  };
}
