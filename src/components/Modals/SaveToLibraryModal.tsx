import { useMemo, useState } from 'react';
import type { NewsletterState, NotificationType } from '@/types';
import { saveRemoteProject, slugifyTitle } from '@/utils/remoteLibrary';
import { CLOUD_PROJECT_SOFT_LIMIT_BYTES, collectLocalImagePaths, formatBytes, getProjectJsonSize, stripLocalImagesForCloud } from '@/utils/cloudProject';
import { Modal } from './Modal';

interface SaveToLibraryModalProps {
  state: NewsletterState;
  onClose: () => void;
  notify: (msg: string, type?: NotificationType) => void;
}

const ADMIN_TOKEN_KEY = 'porr_newsletter_admin_token';

export function SaveToLibraryModal({ state, onClose, notify }: SaveToLibraryModalProps) {
  const [title, setTitle] = useState(state.issueNumber || 'Newsletter');
  const [slugTouched, setSlugTouched] = useState(false);
  const [slug, setSlug] = useState(slugifyTitle(state.issueNumber || 'newsletter'));
  const [type, setType] = useState<'project' | 'template'>('project');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
  const [isSaving, setIsSaving] = useState(false);
  const localImagePaths = useMemo(() => collectLocalImagePaths(state), [state]);
  const originalSize = useMemo(() => getProjectJsonSize(state), [state]);
  const cloudSafeState = useMemo(() => stripLocalImagesForCloud(state), [state]);
  const cloudSafeSize = useMemo(() => getProjectJsonSize(cloudSafeState), [cloudSafeState]);
  const hasLocalImages = localImagePaths.length > 0;
  const [stripLocalImages, setStripLocalImages] = useState(true);

  const suggestedSlug = useMemo(() => slugifyTitle(title), [title]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      notify('Podaj nazwę projektu przed zapisem do biblioteki.', 'warning');
      return;
    }

    const dataToSave = stripLocalImages ? cloudSafeState : state;
    const payloadSize = getProjectJsonSize(dataToSave);

    if (payloadSize > CLOUD_PROJECT_SOFT_LIMIT_BYTES) {
      notify(`Projekt jest za duży do Cloudflare D1 (${formatBytes(payloadSize)}). Usuń lokalne obrazy albo użyj linków HTTPS do grafik.`, 'error');
      return;
    }

    setIsSaving(true);

    try {
      if (adminToken.trim()) {
        localStorage.setItem(ADMIN_TOKEN_KEY, adminToken.trim());
      }

      await saveRemoteProject({
        title: title.trim(),
        slug: slug.trim() || suggestedSlug,
        type,
        data: dataToSave,
        adminToken,
      });

      notify(stripLocalImages && hasLocalImages ? 'Projekt zapisany w bibliotece bez lokalnych obrazów. Użyj linków HTTPS, aby obrazy były wspólne dla zespołu.' : 'Projekt zapisany we wspólnej bibliotece.', 'success');
      onClose();
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Nie udało się zapisać projektu w bibliotece.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal title="💾 Zapisz we wspólnej bibliotece" onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-[#00bcf2]/20 bg-[#00bcf2]/5 p-3 text-[12px] text-gray-300">
          Ten zapis trafia do wspólnej biblioteki projektu, więc będzie widoczny dla wszystkich osób otwierających ten sam link.
        </div>

        <div className="rounded-lg border border-[#feed01]/20 bg-[#feed01]/5 p-3 text-[11px] text-gray-300">
          <p className="font-bold text-[#feed01]">Rozmiar zapisu cloud</p>
          <p className="mt-1">Pełny projekt: <strong>{formatBytes(originalSize)}</strong></p>
          <p>Po usunięciu lokalnych obrazów: <strong>{formatBytes(cloudSafeSize)}</strong></p>
          <p className="mt-1 text-gray-400">Cloudflare D1 ma limit rozmiaru pojedynczego wiersza. Lokalnie wgrane obrazy jako base64 bardzo szybko przekraczają limit.</p>
          {hasLocalImages && (
            <label className="mt-3 flex items-start gap-2 rounded-md bg-black/20 p-2 text-[11px] text-gray-300">
              <input
                type="checkbox"
                checked={stripLocalImages}
                onChange={(event) => setStripLocalImages(event.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong className="block text-white">Usuń lokalne obrazy z zapisu do biblioteki</strong>
                <span className="text-gray-500">Zalecane. Do wspólnej biblioteki najlepiej używać obrazów jako linki HTTPS, np. z PORRtal / SharePoint / CDN.</span>
              </span>
            </label>
          )}
          {hasLocalImages && (
            <p className="mt-2 text-[10px] text-amber-300">Wykryto lokalne obrazy: {localImagePaths.length}. Po ich usunięciu z zapisu trzeba będzie podać publiczne linki HTTPS albo ponownie dodać obrazy lokalnie.</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Nazwa</label>
          <input
            value={title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 text-white outline-none focus:border-[#feed01]"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Slug / identyfikator</label>
          <input
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugifyTitle(event.target.value));
            }}
            className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 font-mono text-white outline-none focus:border-[#feed01]"
          />
          <p className="mt-1 text-[10px] text-gray-500">Jeśli slug już istnieje, projekt zostanie zaktualizowany i dostanie nową wersję w historii.</p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">Typ wpisu</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('project')}
              className={`rounded-md border px-3 py-2 text-left text-[12px] transition-colors ${type === 'project' ? 'border-[#feed01] bg-[#feed01]/10 text-[#feed01]' : 'border-[#253555] bg-[#1a1a2e] text-gray-300'}`}
            >
              <strong className="block">Projekt</strong>
              <span className="text-[10px] text-gray-500">Robocza wersja newslettera</span>
            </button>
            <button
              type="button"
              onClick={() => setType('template')}
              className={`rounded-md border px-3 py-2 text-left text-[12px] transition-colors ${type === 'template' ? 'border-[#feed01] bg-[#feed01]/10 text-[#feed01]' : 'border-[#253555] bg-[#1a1a2e] text-gray-300'}`}
            >
              <strong className="block">Szablon</strong>
              <span className="text-[10px] text-gray-500">Wzór startowy dla zespołu</span>
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">PIN / token administratora</label>
          <input
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            type="password"
            placeholder="Wymagany, jeśli ustawisz ADMIN_TOKEN w Cloudflare"
            className="w-full rounded-md border border-[#253555] bg-[#1a1a2e] px-3 py-2 text-white outline-none focus:border-[#feed01]"
          />
          <p className="mt-1 text-[10px] text-gray-500">Token nie jest wysyłany do użytkowników. Przechowuje się tylko lokalnie w Twojej przeglądarce.</p>
        </div>

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
            {isSaving ? 'Zapisywanie…' : 'Zapisz w bibliotece'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
