import { Modal } from './Modal';

interface OutlookHelpModalProps { onClose: () => void; }

export function OutlookHelpModal({ onClose }: OutlookHelpModalProps) {
  return (
    <Modal title="📘 Instrukcja - Outlook" onClose={onClose}>
      <div className="space-y-6 text-sm">
        {/* Classic Outlook */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] bg-[#0078d4] text-white px-2 py-0.5 rounded-full font-bold">Outlook Desktop 2007-2019</span>
          </div>
          <h4 className="text-[#feed01] font-bold mb-2">Metoda 1: Przez .EML → .OFT (zalecana)</h4>
          <ol className="list-decimal ml-5 text-gray-300 space-y-2">
            <li>W zakładce Eksport kliknij <strong className="text-white">📧 Pobierz .EML</strong></li>
            <li>Znajdź pobrany plik <code className="bg-[#1a1a2e] px-1 rounded text-[#00d9a5]">newsletter.eml</code> i kliknij dwukrotnie</li>
            <li>Outlook otworzy wiadomość – sprawdź podgląd</li>
            <li>Kliknij <strong className="text-white">Plik → Zapisz jako</strong></li>
            <li>Zmień typ na <strong className="text-[#feed01]">Szablon programu Outlook (.oft)</strong></li>
            <li>Zapisz w wybranej lokalizacji</li>
          </ol>
          <div className="bg-[#1a1a2e] border-l-[3px] border-[#0078d4] p-3 rounded-r-lg mt-3">
            <p className="text-[#0078d4] text-[11px] font-bold mb-1">💡 Jak używać szablonu .OFT:</p>
            <p className="text-gray-400 text-[11px]">Plik → Nowy → Więcej elementów → Wybierz formularz → Szablony użytkownika</p>
          </div>
        </section>

        <div className="h-px bg-[#253555]" />

        {/* New Outlook */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] bg-gradient-to-r from-[#0078d4] to-[#00bcf2] text-white px-2 py-0.5 rounded-full font-bold">Nowy Outlook / Web</span>
          </div>

          <h4 className="text-[#feed01] font-bold mb-2">Opcja 1: Moje szablony (zalecana)</h4>
          <ol className="list-decimal ml-5 text-gray-300 space-y-1.5">
            <li>Kliknij <strong className="text-white">📋 Kopiuj dla "Moje szablony"</strong></li>
            <li>W Outlook kliknij <strong className="text-white">Nowa wiadomość</strong></li>
            <li>Na pasku narzędzi kliknij <strong className="text-white">⋯ (więcej)</strong> → <strong className="text-[#feed01]">Moje szablony</strong></li>
            <li>Kliknij <strong className="text-white">+ Szablon</strong></li>
            <li>Nadaj nazwę i wklej kod <strong className="text-white">(Ctrl+V)</strong></li>
            <li>Zapisz – szablon jest gotowy do wielokrotnego użytku!</li>
          </ol>

          <div className="h-px bg-[#253555] my-4" />

          <h4 className="text-[#feed01] font-bold mb-2">Opcja 2: Podpis HTML</h4>
          <ol className="list-decimal ml-5 text-gray-300 space-y-1.5">
            <li>Kliknij <strong className="text-white">✍️ Kopiuj jako podpis</strong></li>
            <li>Otwórz <strong className="text-white">Ustawienia → Poczta → Podpisy</strong></li>
            <li>Kliknij <strong className="text-white">+ Nowy podpis</strong></li>
            <li>Przełącz na edycję HTML i wklej kod</li>
            <li>Przy tworzeniu maila wybierz ten podpis</li>
          </ol>
        </section>

        <div className="h-px bg-[#253555]" />

        <section>
          <div className="bg-[#1a1a2e] border-l-[3px] border-[#00d9a5] p-4 rounded-r-lg">
            <p className="text-[#00d9a5] font-bold text-xs mb-1">💡 Wskazówka: Powrót do klasycznego Outlooka</p>
            <p className="text-gray-400 text-[11px]">
              Jeśli potrzebujesz pełnej obsługi .OFT: <strong className="text-white">Ustawienia → Ogólne → Wyłącz "Nowy Outlook"</strong>
            </p>
          </div>
        </section>

        <section>
          <div className="bg-[#1a1a2e] border-l-[3px] border-yellow-500 p-4 rounded-r-lg">
            <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ Ważne dla Outlook Desktop</p>
            <ul className="text-gray-400 text-[11px] list-disc ml-4 space-y-1">
              <li>Outlook renderuje HTML używając silnika Word – nie wszystkie style CSS działają</li>
              <li>Generator automatycznie stosuje kompatybilne rozwiązania (tabele, VML, inline styles)</li>
              <li>Obrazki zewnętrzne mogą wymagać odblokowania przez odbiorcę</li>
              <li>Testuj zawsze na docelowej wersji Outlooka przed wysyłką</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
}
