import type { NewsletterState } from '@/types';

export interface RemoteProjectSummary {
  id: string;
  title: string;
  slug: string;
  type: 'project' | 'template';
  createdAt: string;
  updatedAt: string;
}

export interface RemoteProject extends RemoteProjectSummary {
  data: NewsletterState;
}

export interface RemoteProjectVersion {
  id: string;
  projectId: string;
  title: string;
  data: NewsletterState;
  createdAt: string;
}

interface SaveProjectInput {
  title: string;
  slug?: string;
  type?: 'project' | 'template';
  data: NewsletterState;
  adminToken?: string;
}

interface UpdateProjectInput {
  id: string;
  title: string;
  slug?: string;
  type?: 'project' | 'template';
  data: NewsletterState;
  adminToken?: string;
}

function headers(adminToken?: string): HeadersInit {
  const result: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (adminToken?.trim()) {
    result['X-Admin-Token'] = adminToken.trim();
  }

  return result;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.error || `API error ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function slugifyTitle(title: string): string {
  return (title || 'newsletter')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80) || 'newsletter';
}

export async function listRemoteProjects(): Promise<RemoteProjectSummary[]> {
  const result = await requestJson<{ projects: RemoteProjectSummary[] }>('/api/projects');
  return result.projects;
}

export async function getRemoteProject(id: string): Promise<RemoteProject> {
  const result = await requestJson<{ project: RemoteProject }>(`/api/projects/${encodeURIComponent(id)}`);
  return result.project;
}

export async function saveRemoteProject(input: SaveProjectInput): Promise<RemoteProjectSummary> {
  const result = await requestJson<{ project: RemoteProjectSummary }>('/api/projects', {
    method: 'POST',
    headers: headers(input.adminToken),
    body: JSON.stringify({
      title: input.title,
      slug: input.slug || slugifyTitle(input.title),
      type: input.type || 'project',
      data: input.data,
    }),
  });

  return result.project;
}

export async function updateRemoteProject(input: UpdateProjectInput): Promise<RemoteProjectSummary> {
  const result = await requestJson<{ project: RemoteProjectSummary }>(`/api/projects/${encodeURIComponent(input.id)}`, {
    method: 'PUT',
    headers: headers(input.adminToken),
    body: JSON.stringify({
      title: input.title,
      slug: input.slug || slugifyTitle(input.title),
      type: input.type || 'project',
      data: input.data,
    }),
  });

  return result.project;
}

export async function deleteRemoteProject(id: string, adminToken?: string): Promise<void> {
  await requestJson<{ ok: true }>(`/api/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: headers(adminToken),
  });
}

export async function listRemoteProjectVersions(id: string): Promise<RemoteProjectVersion[]> {
  const result = await requestJson<{ versions: RemoteProjectVersion[] }>(`/api/projects/${encodeURIComponent(id)}/versions`);
  return result.versions;
}
