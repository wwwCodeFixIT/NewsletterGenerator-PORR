/**
 * Lokalny odpowiednik remoteLibrary — używa localStorage zamiast Cloudflare D1.
 * Stosowany jako fallback gdy backend /api/projects nie jest skonfigurowany.
 *
 * Interfejsy są zgodne z remoteLibrary.ts, więc zamiana jest przezroczysta dla UI.
 */
import type { NewsletterState } from '@/types';
import type {
  RemoteProjectSummary,
  RemoteProject,
  RemoteProjectVersion,
} from './remoteLibrary';

const LIBRARY_KEY   = 'porr_newsletter_library_v2';
const VERSIONS_KEY  = 'porr_newsletter_library_versions_v2';
const MAX_PROJECTS  = 30;
const MAX_VERSIONS  = 5;

// ─── internal shape ───────────────────────────────────────────────────────────

interface LocalEntry extends RemoteProjectSummary {
  data: NewsletterState;
}

function uid(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadAll(): LocalEntry[] {
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]'); } catch { return []; }
}

function persist(entries: LocalEntry[]): void {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(entries));
}

function loadVersionMap(): Record<string, RemoteProjectVersion[]> {
  try { return JSON.parse(localStorage.getItem(VERSIONS_KEY) || '{}'); } catch { return {}; }
}

function persistVersionMap(map: Record<string, RemoteProjectVersion[]>): void {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(map));
}

// ─── public API ───────────────────────────────────────────────────────────────

export function listLocalProjects(): Promise<RemoteProjectSummary[]> {
  const entries = loadAll()
    .map(({ data: _d, ...s }) => s)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return Promise.resolve(entries);
}

export function getLocalProject(id: string): Promise<RemoteProject> {
  const entry = loadAll().find(e => e.id === id);
  if (!entry) return Promise.reject(new Error(`Projekt "${id}" nie istnieje w bibliotece lokalnej.`));
  return Promise.resolve(entry);
}

export function saveLocalProject(input: {
  title: string;
  slug: string;
  type?: 'project' | 'template';
  data: NewsletterState;
}): Promise<RemoteProjectSummary> {
  const now  = new Date().toISOString();
  const slug = (input.slug || input.title)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 80) || 'newsletter';

  const all   = loadAll();
  const found = all.findIndex(e => e.slug === slug);

  if (found >= 0) {
    // Zapisz starą wersję do historii
    const existing = all[found];
    const versions = loadVersionMap();
    versions[existing.id] = [
      { id: uid(), projectId: existing.id, title: existing.title, data: existing.data, createdAt: existing.updatedAt },
      ...(versions[existing.id] || []),
    ].slice(0, MAX_VERSIONS);
    persistVersionMap(versions);

    all[found] = { ...existing, title: input.title, type: input.type || 'project', data: input.data, updatedAt: now };
    persist(all);
    const { data: _d, ...summary } = all[found];
    return Promise.resolve(summary);
  }

  if (all.length >= MAX_PROJECTS) {
    return Promise.reject(new Error(
      `Biblioteka lokalna osiągnęła limit ${MAX_PROJECTS} projektów. Usuń stare, aby dodać nowy.`
    ));
  }

  const entry: LocalEntry = {
    id: uid(), title: input.title, slug, type: input.type || 'project',
    data: input.data, createdAt: now, updatedAt: now,
  };
  all.push(entry);
  persist(all);
  const { data: _d, ...summary } = entry;
  return Promise.resolve(summary);
}

export function deleteLocalProject(id: string): Promise<void> {
  persist(loadAll().filter(e => e.id !== id));
  const vm = loadVersionMap();
  delete vm[id];
  persistVersionMap(vm);
  return Promise.resolve();
}

export function listLocalProjectVersions(id: string): Promise<RemoteProjectVersion[]> {
  return Promise.resolve(loadVersionMap()[id] || []);
}

/** Całkowity rozmiar zajęty przez lokalną bibliotekę w localStorage [bajty]. */
export function localLibraryBytes(): number {
  const a = localStorage.getItem(LIBRARY_KEY) || '';
  const b = localStorage.getItem(VERSIONS_KEY) || '';
  return new Blob([a, b]).size;
}

/** Ile wpisów ma biblioteka lokalna. */
export function localLibraryCount(): number {
  return loadAll().length;
}
