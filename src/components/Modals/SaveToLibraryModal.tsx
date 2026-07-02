import { useMemo, useState } from 'react';
import type { NewsletterState, NotificationType } from '@/types';
import { saveLocalProject, localLibraryBytes } from '@/utils/localLibrary';
import { slugifyTitle } from '@/utils/remoteLibrary';
import { Modal } from './Modal';

interface SaveToLibraryModalProps {
  state: NewsletterState;
  onClose: () => void;
  notify: (msg: string, type?: NotificationType) => void;
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export function SaveToLibraryModal({ state, onClose, notify }: SaveToLibraryModalProps) {
  const [title, setTitle]           = useState(state.issueNumber || 'Newsletter');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug]             = useState(slugifyTitle(state.issueNumber || 'newsletter'));
  const [type, setType]             = useState<'project' | 'template'>('project');
  const [isSaving, setIsSaving]     = useState(false);

  const currentBytes = useMemo(() => localLibraryBytes(), []);
  const currentSize  = useMemo(() => new Blob([JSON.stringify(state)]).size, [state]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugifyTitle(value));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      notify('Podaj nazwę projektu przed zapisem.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await saveLocalProject({ title: title.trim(), slug, type, data: state });
      notify(
        `💾 Zapisano „${title.trim()}" w bibliotece lokalnej.`,
        'success'
      );
      onClose();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Nie udało się zapisać projektu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="💾 Zapisz w bibliotece" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4 text-sm">

        {/* Rozmiar */}
        <div className="rounded-lg border border-[#253555] bg-[#1a1a2e] p-3 text-[11px] text-gray-300">
          <div className="flex justify-between mb-1">
            <span className="text-gray-400">Aktualny projekt</span>
            <span className="font-bold text-[#feed01]">{fmtBytes(currentSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Zajęta biblioteka</span>
            <span className="font-bold text-[#00d9a5]">{fmtBytes(currentBytes)}</span>
          </div>
          <p className="mt-2 text-[10px] text-gray-600">
            Lokalnie wgrane obrazy (base64) znacząco zwiększają rozmiar. Dla najlepszej wydajności używaj linków HTTPS.
          </p>
        </div>

        {/* Nazwa */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa</label>
          <input
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 text-white outline-none focus:border-[#feed01]"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Slug / identyfikator</label>
          <input
            value={slug}
            onChange={e => { setSlugTouched(true); setSlug(slugifyTitle(e.target.value)); }}
            className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 font-mono text-white outline-none focus:border-[#feed01]"
          />
          <p className="mt-1 text-[10px] text-gray-500">
            Jeśli slug już istnieje, projekt zostanie zaktualizowany i poprzednia wersja trafi do historii.
          </p>
        </div>

        {/* Typ */}
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Typ</label>
          <div className="grid grid-cols-2 gap-2">
            {(['project', 'template'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-md border px-3 py-2 text-left text-[12px] transition-colors ${type === t ? 'border-[#feed01] bg-[#feed01]/10 text-[#feed01]' : 'border-[#253555] bg-[#1a1a2e] text-gray-300'}`}
              >
                <strong className="block">{t === 'project' ? 'Projekt' : 'Szablon'}</strong>
                <span className="text-[10px] text-gray-500">{t === 'project' ? 'Robocza wersja newslettera' : 'Wzór startowy'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Akcje */}
        <div className="flex justify-end gap-2 border-t border-[#253555] pt-4">
          <button type="button" onClick={onClose} className="rounded-md bg-white/5 px-4 py-2 text-[12px] font-bold text-gray-300 hover:bg-white/10">
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-[#feed01] px-4 py-2 text-[12px] font-bold text-[#143e70] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Zapisywanie…' : '💾 Zapisz'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
