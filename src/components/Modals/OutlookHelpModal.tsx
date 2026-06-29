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
              Klasyczny Outlook Desktop
            </span>
          </div>

          <h4 className="mb-2 font-bold text-[#feed01]">Edycja przed wysyłką: .EML draft</h4>

          <ol className="ml-5 list-decimal space-y-2 text-gray-300">
            <li>W zakładce Eksport kliknij <strong className="text-white">📧 Edytuj przed wysyłką (.EML draft)</strong></li>
            <li>Otwórz pobrany plik w klasycznym Outlooku</li>
            <li>Uzupełnij odbiorców, sprawdź treść i grafiki</li>
            <li>W razie potrzeby popraw tekst bezpośrednio w oknie wiadomości</li>
            <li>Kliknij <strong className="text-white">Wyślij</strong></li>
          </ol>

          <div className="mt-3 rounded-r-lg border-l-[3px] border-[#0078d4] bg-[#1a1a2e] p-3">
            <p className="mb-1 text-[11px] font-bold text-[#0078d4]">💡 Obrazy lokalne</p>
            <p className="text-[11px] text-gray-400">
              Obrazy wgrane z dysku są w .EML przenoszone do załączników inline CID. Dzięki temu HTML wiadomości jest lżejszy niż przy data:image/base64 w treści.
            </p>
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
            <li>Do otwarcia / importu użyj <strong className="text-white">📧 Pobierz .EML do nowego Outlooka</strong></li>
            <li>Do edycji przed wysyłką najstabilniejsze jest <strong className="text-white">📋 Kopiuj jako treść maila / szablon</strong></li>
            <li>Nowy Outlook nie obsługuje tak stabilnie draftów .EML z <code className="rounded bg-[#1a1a2e] px-1 text-[#00d9a5]">X-Unsent: 1</code> jak klasyczny Outlook</li>
          </ol>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="rounded-r-lg border-l-[3px] border-yellow-500 bg-[#1a1a2e] p-4">
            <p className="mb-1 text-xs font-bold text-yellow-400">⚠️ Pasek „Kliknij tutaj, aby pobrać obrazy”</p>
            <ul className="ml-4 list-disc space-y-1 text-[11px] text-gray-400">
              <li>To zabezpieczenie Outlooka dla obrazów ładowanych z internetu.</li>
              <li>Nie da się go wyłączyć samym kodem HTML wiadomości.</li>
              <li>Można go ograniczyć, używając obrazów lokalnie wgranych do generatora albo ustawień zaufanych nadawców po stronie Outlooka/organizacji.</li>
              <li>Ikony social media i inne grafiki z URL HTTPS mogą nadal wywoływać ten pasek.</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
}
