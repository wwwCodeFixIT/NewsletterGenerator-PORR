import { useEffect, useReducer } from 'react';
import type { NewsletterState, NotificationType } from '@/types';
import type { RemoteProjectSummary, RemoteProjectVersion } from '@/utils/remoteLibrary';
import {
  listLocalProjects,
  getLocalProject,
  deleteLocalProject,
  listLocalProjectVersions,
  localLibraryBytes,
  localLibraryCount,
} from '@/utils/localLibrary';
import { Modal } from './Modal';

interface LibraryModalProps {
  onClose: () => void;
  onLoad: (state: NewsletterState) => void;
  notify: (msg: string, type?: NotificationType) => void;
}

const ESTIMATED_MAX_BYTES = 5 * 1024 * 1024; // ~5 MB orientacyjnie

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pl-PL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  } catch { return iso; }
}

// Używamy reducera zamiast wielu setState, żeby uniknąć race-conditions
// przy odświeżaniu listy po usunięciu/wczytaniu.
type State = {
  projects: RemoteProjectSummary[];
  versions: Record<string, RemoteProjectVersion[]>;
  loading: boolean;
  activeType: 'all' | 'template' | 'project';
  libraryBytes: number;
  libraryCount: number;
};

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_DONE'; projects: RemoteProjectSummary[] }
  | { type: 'SET_VERSIONS'; id: string; versions: RemoteProjectVersion[] }
  | { type: 'CLEAR_VERSIONS'; id: string }
  | { type: 'SET_FILTER'; filter: 'all' | 'template' | 'project' }
  | { type: 'REFRESH_STATS' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'LOAD_START': return { ...s, loading: true };
    case 'LOAD_DONE':  return { ...s, loading: false, projects: a.projects, libraryBytes: localLibraryBytes(), libraryCount: localLibraryCount() };
    case 'SET_VERSIONS': return { ...s, versions: { ...s.versions, [a.id]: a.versions } };
    case 'CLEAR_VERSIONS': { const v = { ...s.versions }; delete v[a.id]; return { ...s, versions: v }; }
    case 'SET_FILTER': return { ...s, activeType: a.filter };
    case 'REFRESH_STATS': return { ...s, libraryBytes: localLibraryBytes(), libraryCount: localLibraryCount() };
    default: return s;
  }
}

export function LibraryModal({ onClose, onLoad, notify }: LibraryModalProps) {
  const [s, dispatch] = useReducer(reducer, {
    projects: [], versions: {}, loading: true, activeType: 'all',
    libraryBytes: localLibraryBytes(), libraryCount: localLibraryCount(),
  });

  const reload = async () => {
    dispatch({ type: 'LOAD_START' });
    try {
      const projects = await listLocalProjects();
      dispatch({ type: 'LOAD_DONE', projects });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Nie udało się wczytać biblioteki.', 'error');
      dispatch({ type: 'LOAD_DONE', projects: [] });
    }
  };

  useEffect(() => { void reload(); }, []);

  const handleLoad = async (id: string, title: string) => {
    try {
      const project = await getLocalProject(id);
      onLoad(project.data);
      notify(`✅ Wczytano projekt „${title}"`, 'success');
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Nie udało się wczytać projektu.', 'error');
    }
  };

  const handleDelete = async (project: RemoteProjectSummary) => {
    if (!confirm(`Usunąć projekt „${project.title}" z biblioteki?\nTej operacji nie można cofnąć.`)) return;
    try {
      await deleteLocalProject(project.id);
      notify(`🗑️ Usunięto „${project.title}".`);
      void reload();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Nie udało się usunąć projektu.', 'error');
    }
  };

  const handleToggleVersions = async (id: string) => {
    if (s.versions[id]) { dispatch({ type: 'CLEAR_VERSIONS', id }); return; }
    try {
      const versions = await listLocalProjectVersions(id);
      dispatch({ type: 'SET_VERSIONS', id, versions });
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Nie udało się pobrać historii wersji.', 'error');
    }
  };

  const handleLoadVersion = (version: RemoteProjectVersion) => {
    onLoad(version.data);
    notify(`🕒 Wczytano wersję z ${fmtDate(version.createdAt)}`, 'success');
    onClose();
  };

  const filtered = s.projects.filter(p => s.activeType === 'all' || p.type === s.activeType);
  const usagePct = Math.min(100, Math.round((s.libraryBytes / ESTIMATED_MAX_BYTES) * 100));
  const barColor = usagePct >= 85 ? 'bg-red-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-[#00d9a5]';

  return (
    <Modal title="📚 Biblioteka projektów" onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Pasek pamięci */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="font-medium text-gray-400">Pamięć lokalna przeglądarki</span>
            <span className="font-bold text-white">{fmtBytes(s.libraryBytes)} <span className="text-gray-500">/ ~5 MB orientacyjnie</span></span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${usagePct}%` }} />
          </div>
          <p className="mt-1 text-[9px] text-gray-600">{s.libraryCount}/30 projektów. Projekty są zapisane tylko w tej przeglądarce — do przeniesienia użyj eksportu .json w zakładce Eksport.</p>
        </div>

        {/* Filtry */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex rounded-lg bg-[#1a1a2e] p-1">
            {([['all', 'Wszystkie'], ['project', 'Projekty'], ['template', 'Szablony']] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => dispatch({ type: 'SET_FILTER', filter: id })}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors ${s.activeType === id ? 'bg-[#feed01] text-[#143e70]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={reload} className="text-[10px] text-gray-500 hover:text-[#feed01] transition-colors">
            ↺ Odśwież
          </button>
        </div>

        {/* Lista */}
        {s.loading ? (
          <div className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-8 text-center text-sm text-gray-400">Ładowanie…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-8 text-center">
            <div className="mb-2 text-3xl">📭</div>
            <p className="text-sm text-gray-400">Brak projektów w tej kategorii.</p>
            <p className="mt-1 text-[11px] text-gray-600">Zapisz bieżący projekt przyciskiem „💾 Zapisz w bibliotece".</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-0.5">
            {filtered.map(project => (
              <div key={project.id} className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${project.type === 'template' ? 'bg-[#00bcf2] text-white' : 'bg-[#feed01] text-[#143e70]'}`}>
                        {project.type === 'template' ? 'Szablon' : 'Projekt'}
                      </span>
                    </div>
                    <h4 className="truncate text-sm font-bold text-white">{project.title}</h4>
                    <p className="mt-0.5 text-[10px] text-gray-500">Aktualizacja: {fmtDate(project.updatedAt)}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <button type="button" onClick={() => handleLoad(project.id, project.title)}
                      className="rounded-md bg-[#feed01] px-3 py-1.5 text-[10px] font-bold text-[#143e70] hover:brightness-110 active:scale-95">
                      📂 Wczytaj
                    </button>
                    <button type="button" onClick={() => handleToggleVersions(project.id)}
                      className="rounded-md bg-[#143e70] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#1a5a90]">
                      🕒 Historia
                    </button>
                    <button type="button" onClick={() => handleDelete(project)}
                      className="rounded-md bg-red-500/15 px-3 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-500/25">
                      🗑️ Usuń
                    </button>
                  </div>
                </div>

                {/* Historia wersji */}
                {s.versions[project.id] && (
                  <div className="mt-3 rounded-lg bg-black/20 p-2">
                    <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Historia wersji (ostatnie {MAX_VERSIONS_DISPLAY})</h5>
                    {s.versions[project.id].length === 0 ? (
                      <p className="text-[10px] text-gray-500">Brak poprzednich wersji — aktualizacje będą tu zapisywane przy kolejnych zapisach w bibliotece.</p>
                    ) : (
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {s.versions[project.id].map(v => (
                          <button key={v.id} type="button" onClick={() => handleLoadVersion(v)}
                            className="flex w-full items-center justify-between rounded-md bg-white/[0.03] px-2 py-1.5 text-left text-[10px] text-gray-300 hover:bg-white/[0.06]">
                            <span className="truncate">{v.title}</span>
                            <span className="ml-3 shrink-0 text-gray-500">{fmtDate(v.createdAt)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// Stała do wyświetlania w UI — musi zgadzać się z MAX_VERSIONS w localLibrary.ts
const MAX_VERSIONS_DISPLAY = 5;
