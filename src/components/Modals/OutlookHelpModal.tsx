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
            <span className="rounded-full bg-gradient-to-r from-[#0078d4] to-[#00bcf2] px-2 py-0.5 text-[10px] font-bold text-white">
              Nowy Outlook / Web — zalecane
            </span>
          </div>

          <h4 className="mb-2 font-bold text-[#feed01]">Najstabilniejszy flow: kopiowanie do nowej wiadomości</h4>

          <ol className="ml-5 list-decimal space-y-2 text-gray-300">
            <li>W generatorze kliknij <strong className="text-white">📋 Kopiuj jako treść maila</strong>.</li>
            <li>W nowym Outlooku kliknij <strong className="text-white">Nowa wiadomość</strong>.</li>
            <li>Kliknij w treść wiadomości i wklej <strong className="text-white">Ctrl+V</strong>.</li>
            <li>Uzupełnij odbiorców, sprawdź obrazy i linki.</li>
            <li>Edytuj treść bezpośrednio w oknie tworzenia wiadomości.</li>
            <li>Kliknij <strong className="text-white">Wyślij</strong>.</li>
          </ol>

          <div className="mt-3 rounded-r-lg border-l-[3px] border-[#00bcf2] bg-[#1a1a2e] p-3">
            <p className="mb-1 text-[11px] font-bold text-[#00bcf2]">💡 Dlaczego tak?</p>
            <p className="text-[11px] text-gray-400">
              Nowy Outlook obsługuje otwieranie plików .EML, ale edytowanie i dalsze forwardowanie gotowego .EML potrafi przepisać HTML, zgubić grafiki albo zmienić układ. Kopiowanie jako treść HTML do nowej wiadomości jest najbezpieczniejsze dla codziennej pracy. Generator kopiuje HTML przygotowany do wklejenia w oknie nowej wiadomości: bez &lt;head&gt;, bez VML, bez CID i z maksymalnie inline’owanymi stylami.
            </p>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full bg-[#0078d4] px-2 py-0.5 text-[10px] font-bold text-white">
              Pliki .EML w nowym Outlooku
            </span>
          </div>

          <h4 className="mb-2 font-bold text-[#feed01]">Kiedy używać .EML?</h4>

          <ul className="ml-5 list-disc space-y-1.5 text-gray-300">
            <li>Do otwarcia lub importu wiadomości.</li>
            <li>Do podglądu finalnego newslettera.</li>
            <li>Nie jako główny sposób edycji i forwardowania newslettera.</li>
          </ul>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="rounded-r-lg border-l-[3px] border-amber-500 bg-[#1a1a2e] p-4">
            <p className="mb-1 text-xs font-bold text-amber-400">🖼️ Obrazy przy kopiowaniu do nowego Outlooka</p>
            <ul className="ml-4 list-disc space-y-1 text-[11px] text-gray-400">
              <li>Najstabilniejsze są obrazy podane jako publiczne linki HTTPS.</li>
              <li>Lokalne obrazy data:image mogą zostać wycięte przez nowego Outlooka podczas wklejania.</li>
              <li>Jeśli zdjęcie znika po Ctrl+V, użyj adresu HTTPS do obrazka albo eksportu .EML do podglądu/importu.</li>
            </ul>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="rounded-r-lg border-l-[3px] border-yellow-500 bg-[#1a1a2e] p-4">
            <p className="mb-1 text-xs font-bold text-yellow-400">⚠️ Pasek „Kliknij tutaj, aby pobrać obrazy”</p>
            <ul className="ml-4 list-disc space-y-1 text-[11px] text-gray-400">
              <li>To zabezpieczenie Outlooka dla obrazów ładowanych z internetu.</li>
              <li>Nie da się go wyłączyć samym kodem HTML wiadomości.</li>
              <li>Można go ograniczyć przez zaufanych nadawców, polityki organizacji albo używanie grafik już zaakceptowanych przez Outlooka.</li>
              <li>Przy wysyłce newsletterów do wielu osób to zachowanie Outlooka jest normalne.</li>
            </ul>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="rounded-r-lg border-l-[3px] border-[#0078d4] bg-[#1a1a2e] p-4">
            <p className="mb-1 text-xs font-bold text-[#0078d4]">🖥️ Klasyczny Outlook — tylko opcjonalnie</p>
            <p className="text-[11px] text-gray-400">
              Jeśli ktoś pracuje w klasycznym Outlooku Desktop, może użyć .EML draft do edycji przed wysyłką. Dla Waszego workflow w nowym Outlooku traktuj to jako opcję dodatkową, nie główną.
            </p>
          </div>
        </section>
      </div>
    </Modal>
  );
}
