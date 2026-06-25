import { useState } from 'react';
import type { SavedProject, NotificationType } from '@/types';
import { Modal } from './Modal';
import { formatBytes } from '@/utils/format';

interface LibraryModalProps {
  onClose: () => void;
  defaultName: string;
  getLibrary: () => SavedProject[];
  getLibraryStats: () => { count: number; bytes: number };
  saveToLibrary: (name: string) => boolean;
  loadFromLibrary: (id: string) => boolean;
  deleteFromLibrary: (id: string) => void;
  renameLibraryEntry: (id: string, name: string) => boolean;
  notify: (msg: string, type?: NotificationType) => void;
}

// Przeglądarki nie udostępniają realnego limitu localStorage — to orientacyjny,
// konserwatywny szacunek (Safari bywa bliżej 5 MB, Chrome/Firefox często więcej).
const ESTIMATED_QUOTA_BYTES = 5 * 1024 * 1024;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pl', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function LibraryModal({
  onClose,
  defaultName,
  getLibrary,
  getLibraryStats,
  saveToLibrary,
  loadFromLibrary,
  deleteFromLibrary,
  renameLibraryEntry,
  notify,
}: LibraryModalProps) {
  const [library, setLibrary] = useState<SavedProject[]>(() => getLibrary());
  const [stats, setStats] = useState(() => getLibraryStats());
  const [saveName, setSaveName] = useState(defaultName || 'Bez nazwy');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const refresh = () => {
    setLibrary(getLibrary());
    setStats(getLibraryStats());
  };

  const usagePercent = Math.min(100, Math.round((stats.bytes / ESTIMATED_QUOTA_BYTES) * 100));
  const usageColor = usagePercent >= 85 ? 'bg-red-500' : usagePercent >= 60 ? 'bg-amber-500' : 'bg-[#00d9a5]';

  const handleSave = () => {
    const ok = saveToLibrary(saveName);
    if (ok) {
      notify(`📚 Projekt „${saveName.trim() || 'Bez nazwy'}” zapisany w bibliotece!`);
      refresh();
      const updated = getLibraryStats();
      if (updated.bytes / ESTIMATED_QUOTA_BYTES >= 0.85) {
        notify('⚠️ Biblioteka zajmuje już większość szacowanego limitu pamięci przeglądarki. Rozważ usunięcie starych projektów.', 'warning');
      }
    } else {
      notify('❌ Brak miejsca w pamięci przeglądarki. Usuń stare projekty z biblioteki albo użyj mniej lokalnie wgranych obrazów.', 'error');
    }
  };

  const handleLoad = (p: SavedProject) => {
    if (loadFromLibrary(p.id)) {
      notify(`✅ Wczytano projekt „${p.name}”!`);
      onClose();
    } else {
      notify('❌ Nie udało się wczytać tego projektu.', 'error');
    }
  };

  const handleDelete = (p: SavedProject) => {
    if (confirm(`Usunąć projekt „${p.name}” z biblioteki?\nTej operacji nie można odwrócić.`)) {
      deleteFromLibrary(p.id);
      notify('🗑️ Projekt usunięty z biblioteki.');
      refresh();
    }
  };

  const startRename = (p: SavedProject) => {
    setEditingId(p.id);
    setEditingName(p.name);
  };

  const confirmRename = (p: SavedProject) => {
    if (renameLibraryEntry(p.id, editingName)) {
      notify('✏️ Nazwa zmieniona.');
      refresh();
    }
    setEditingId(null);
  };

  return (
    <Modal title="📚 Biblioteka projektów" onClose={onClose} maxWidth="max-w-2xl">
      {/* Wykorzystanie pamięci */}
      <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className="font-medium text-gray-400">Wykorzystanie pamięci przeglądarki</span>
          <span className="font-bold text-white">{formatBytes(stats.bytes)} <span className="text-gray-500">/ ~5 MB (orientacyjnie)</span></span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
          <div className={`h-full rounded-full transition-all ${usageColor}`} style={{ width: `${usagePercent}%` }} />
        </div>
        <p className="mt-1 text-[8px] text-gray-600">
          {stats.count}/25 zapisanych projektów. Realny limit zależy od przeglądarki — to tylko orientacyjny szacunek.
        </p>
      </div>

      {/* Zapis bieżącego projektu */}
      <div className="mb-4 rounded-xl border border-[#feed01]/20 bg-[#feed01]/5 p-3">
        <p className="mb-2 text-xs font-bold text-[#feed01]">💾 Zapisz obecny projekt w bibliotece</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Nazwa projektu..."
            className="flex-1 rounded-lg border border-[#253555] bg-[#1a1a2e] px-3 py-2 text-sm text-white focus:border-[#feed01] focus:outline-none"
          />
          <button
            onClick={handleSave}
            className="rounded-lg bg-[#feed01] px-4 py-2 text-sm font-bold text-[#143e70] hover:shadow-lg hover:shadow-[#feed01]/20 transition-all active:scale-95"
          >
            Zapisz
          </button>
        </div>
      </div>

      {/* Lista zapisanych projektów */}
      {library.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <div className="mb-2 text-3xl">📭</div>
          <p className="text-sm">Biblioteka jest pusta. Zapisz pierwszy projekt powyżej.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {library.map(p => (
            <div key={p.id} className="rounded-lg border border-[#253555] bg-[#1a1a2e] p-3">
              <div className="flex items-center justify-between gap-2">
                {editingId === p.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmRename(p); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    className="flex-1 rounded border border-[#feed01]/40 bg-[#0d1b2a] px-2 py-1 text-sm text-white focus:outline-none"
                  />
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {formatDate(p.savedAt)} • {p.state.articles.length} artykuł{p.state.articles.length === 1 ? '' : 'ów'}
                    </p>
                  </div>
                )}

                <div className="flex shrink-0 gap-1">
                  {editingId === p.id ? (
                    <button
                      onClick={() => confirmRename(p)}
                      className="rounded-md bg-[#00d9a5] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#00c495]"
                    >
                      ✓ Zapisz
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleLoad(p)}
                        className="rounded-md bg-[#0078d4] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#006abc]"
                      >
                        📂 Wczytaj
                      </button>
                      <button
                        onClick={() => startRename(p)}
                        aria-label="Zmień nazwę"
                        className="rounded-md border border-[#253555] px-2 py-1 text-[10px] text-gray-300 hover:bg-white/5"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label="Usuń projekt"
                        className="rounded-md border border-[#253555] px-2 py-1 text-[10px] text-gray-300 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[10px] text-gray-600">
        Do przenoszenia projektów między urządzeniami użyj eksportu/importu .json w zakładce Eksport.
      </p>
    </Modal>
  );
}
