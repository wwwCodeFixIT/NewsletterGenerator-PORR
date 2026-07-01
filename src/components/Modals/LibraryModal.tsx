import { useEffect, useState } from 'react';
import type { NewsletterState, NotificationType } from '@/types';
import {
  deleteRemoteProject,
  getRemoteProject,
  listRemoteProjects,
  listRemoteProjectVersions,
  type RemoteProjectSummary,
  type RemoteProjectVersion,
} from '@/utils/remoteLibrary';
import { Modal } from './Modal';

interface LibraryModalProps {
  onClose: () => void;
  onLoad: (state: NewsletterState) => void;
  notify: (msg: string, type?: NotificationType) => void;
}

const ADMIN_TOKEN_KEY = 'porr_newsletter_admin_token';

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (_error) {
    return value;
  }
}

export function LibraryModal({ onClose, onLoad, notify }: LibraryModalProps) {
  const [projects, setProjects] = useState<RemoteProjectSummary[]>([]);
  const [versions, setVersions] = useState<Record<string, RemoteProjectVersion[]>>({});
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<'all' | 'template' | 'project'>('all');

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      setProjects(await listRemoteProjects());
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Nie udało się pobrać biblioteki projektów.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const filteredProjects = projects.filter((project) => activeType === 'all' || project.type === activeType);

  const handleLoad = async (id: string) => {
    try {
      const project = await getRemoteProject(id);
      onLoad(project.data);
      notify(`Wczytano: ${project.title}`, 'success');
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Nie udało się wczytać projektu.', 'error');
    }
  };

  const handleDelete = async (project: RemoteProjectSummary) => {
    if (!confirm(`Usunąć ze wspólnej biblioteki: ${project.title}?`)) {
      return;
    }

    try {
      if (adminToken.trim()) {
        localStorage.setItem(ADMIN_TOKEN_KEY, adminToken.trim());
      }

      await deleteRemoteProject(project.id, adminToken);
      notify('Projekt usunięty ze wspólnej biblioteki.', 'success');
      await loadProjects();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Nie udało się usunąć projektu.', 'error');
    }
  };

  const handleVersions = async (projectId: string) => {
    if (versions[projectId]) {
      setVersions((prev) => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      return;
    }

    try {
      const result = await listRemoteProjectVersions(projectId);
      setVersions((prev) => ({ ...prev, [projectId]: result }));
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Nie udało się pobrać historii wersji.', 'error');
    }
  };

  const handleLoadVersion = (version: RemoteProjectVersion) => {
    onLoad(version.data);
    notify(`Wczytano wersję z ${formatDate(version.createdAt)}`, 'success');
    onClose();
  };

  return (
    <Modal title="📚 Wspólna biblioteka projektów" onClose={onClose} maxWidth="max-w-5xl">
      <div className="space-y-4">
        <div className="rounded-lg border border-[#feed01]/20 bg-[#feed01]/5 p-3 text-[12px] text-gray-300">
          To jest biblioteka współdzielona. Po wdrożeniu Cloudflare D1 wszyscy użytkownicy tego samego linku zobaczą tę samą listę projektów i szablonów.
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex rounded-lg bg-[#1a1a2e] p-1">
            {[
              ['all', 'Wszystkie'],
              ['template', 'Szablony'],
              ['project', 'Projekty'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveType(id as 'all' | 'template' | 'project')}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors ${activeType === id ? 'bg-[#feed01] text-[#143e70]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-gray-500">PIN / token administratora do usuwania</label>
            <input
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 text-[12px] text-white outline-none focus:border-[#feed01]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-8 text-center text-sm text-gray-400">Ładowanie biblioteki…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-8 text-center text-sm text-gray-400">
            Brak projektów w tej kategorii albo API biblioteki nie jest jeszcze skonfigurowane.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div key={project.id} className="rounded-xl border border-[#253555] bg-[#1a1a2e] p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${project.type === 'template' ? 'bg-[#00bcf2] text-white' : 'bg-[#feed01] text-[#143e70]'}`}>
                        {project.type === 'template' ? 'Szablon' : 'Projekt'}
                      </span>
                      <span className="text-[10px] text-gray-500">{project.slug}</span>
                    </div>
                    <h4 className="truncate text-sm font-bold text-white">{project.title}</h4>
                    <p className="mt-1 text-[10px] text-gray-500">Aktualizacja: {formatDate(project.updatedAt)}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <button type="button" onClick={() => handleLoad(project.id)} className="rounded-md bg-[#feed01] px-3 py-1.5 text-[10px] font-bold text-[#143e70] hover:brightness-110">
                      Wczytaj
                    </button>
                    <button type="button" onClick={() => handleVersions(project.id)} className="rounded-md bg-[#143e70] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#1a5a90]">
                      Historia
                    </button>
                    <button type="button" onClick={() => handleDelete(project)} className="rounded-md bg-red-500/15 px-3 py-1.5 text-[10px] font-bold text-red-300 hover:bg-red-500/25">
                      Usuń
                    </button>
                  </div>
                </div>

                {versions[project.id] && (
                  <div className="mt-3 rounded-lg bg-black/20 p-2">
                    <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Historia wersji</h5>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {versions[project.id].length === 0 ? (
                        <p className="text-[10px] text-gray-500">Brak zapisanych wersji.</p>
                      ) : (
                        versions[project.id].map((version) => (
                          <button
                            key={version.id}
                            type="button"
                            onClick={() => handleLoadVersion(version)}
                            className="flex w-full items-center justify-between rounded-md bg-white/[0.03] px-2 py-1.5 text-left text-[10px] text-gray-300 hover:bg-white/[0.06]"
                          >
                            <span className="truncate">{version.title}</span>
                            <span className="ml-3 shrink-0 text-gray-500">{formatDate(version.createdAt)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between border-t border-[#253555] pt-4">
          <button type="button" onClick={loadProjects} className="rounded-md bg-[#143e70] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#1a5a90]">
            Odśwież
          </button>
          <button type="button" onClick={onClose} className="rounded-md bg-white/5 px-4 py-2 text-[12px] font-bold text-gray-300 hover:bg-white/10">
            Zamknij
          </button>
        </div>
      </div>
    </Modal>
  );
}
