import { Modal } from './Modal';

interface OutlookHelpModalProps {
  onClose: () => void;
}

export function OutlookHelpModal({ onClose }: OutlookHelpModalProps) {
  return (
    <Modal title="📘 Instrukcja - Outlook" onClose={onClose}>
      <div className="space-y-6 text-sm">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#0078d4] px-2 py-0.5 text-[10px] font-bold text-white">
              Outlook Desktop 2007-2019
            </span>
          </div>

          <h4 className="mb-2 font-bold text-[#feed01]">Najlepsza metoda: .EML draft Outlook Safe</h4>

          <ol className="ml-5 list-decimal space-y-2 text-gray-300">
            <li>W zakładce Eksport kliknij <strong className="text-white">🛡️ .EML draft Outlook Safe</strong></li>
            <li>Otwórz pobrany plik w klasycznym Outlooku</li>
            <li>Możesz edytować temat, treść, odbiorców i dopiero potem wysłać</li>
            <li>Lokalnie wgrane obrazy są osadzane jako <strong className="text-white">CID inline attachments</strong></li>
            <li>Zewnętrzne obrazy HTTPS są pomijane, żeby ograniczyć pasek „Kliknij, aby pobrać obrazy”</li>
          </ol>

          <div className="mt-3 rounded-r-lg border-l-[3px] border-[#0078d4] bg-[#1a1a2e] p-3">
            <p className="mb-1 text-[11px] font-bold text-[#0078d4]">💡 Jeśli chcesz mieć wszystkie obrazy widoczne od razu:</p>
            <p className="text-[11px] text-gray-400">
              wgraj logo, zdjęcie główne i zdjęcia artykułów lokalnie w generatorze. Nie wklejaj ich jako URL HTTPS.
            </p>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <h4 className="mb-2 font-bold text-[#feed01]">Różnica między eksportami</h4>

          <div className="space-y-2 text-[11px] text-gray-300">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <strong className="text-white">🛡️ Outlook Safe</strong>
              <p className="mt-1 text-gray-400">
                Najlepszy do klasycznego Outlooka, gdy nie chcesz paska pobierania obrazów. Lokalnie wgrane obrazy zostają, zewnętrzne obrazy są pomijane.
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-3">
              <strong className="text-white">📧 Standard</strong>
              <p className="mt-1 text-gray-400">
                Zachowuje wszystkie obrazy, także zewnętrzne HTTPS. Outlook może wtedy pokazać komunikat o pobieraniu obrazów — to normalne zabezpieczenie.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-[#0078d4] to-[#00bcf2] px-2 py-0.5 text-[10px] font-bold text-white">
              Nowy Outlook / Web
            </span>
          </div>

          <h4 className="mb-2 font-bold text-[#feed01]">Zalecany flow</h4>

          <ol className="ml-5 list-decimal space-y-1.5 text-gray-300">
            <li>Do podglądu użyj <strong className="text-white">🛡️ Pobierz .EML Outlook Safe</strong> albo standardowego .EML</li>
            <li>Do edycji przed wysyłką najstabilniejsze jest <strong className="text-white">📋 Kopiuj dla "Moje szablony"</strong></li>
            <li>Nowy Outlook nie obsługuje niezawodnie draftów .EML z <code className="rounded bg-[#1a1a2e] px-1 text-[#00d9a5]">X-Unsent: 1</code></li>
          </ol>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="rounded-r-lg border-l-[3px] border-yellow-500 bg-[#1a1a2e] p-4">
            <p className="mb-1 text-xs font-bold text-yellow-400">⚠️ Ważne o pasku „Kliknij, aby pobrać obrazy”</p>
            <ul className="ml-4 list-disc space-y-1 text-[11px] text-gray-400">
              <li>Nie da się go wyłączyć z poziomu samego HTML-a, jeśli mail zawiera zewnętrzne obrazki.</li>
              <li>Najlepsze obejście: wgrać obrazy lokalnie i eksportować przez Outlook Safe.</li>
              <li>Ikony social media są zewnętrzne, więc w trybie Outlook Safe są pomijane.</li>
              <li>Wysyłkę produkcyjną zawsze testuj na docelowej wersji Outlooka.</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
}
