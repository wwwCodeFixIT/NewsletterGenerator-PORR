import { Modal } from './Modal';

interface HelpModalProps { onClose: () => void; }

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <Modal title="📘 Pomoc - Generator Newslettera PORR" onClose={onClose}>
      <div className="space-y-6 text-sm">
        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">🚀 Szybki start</h4>
          <ol className="list-decimal ml-5 text-gray-300 space-y-1.5">
            <li>Wypełnij pola w zakładce <strong className="text-white">Treść</strong> – nagłówek, artykuł główny, wideo, stopka</li>
            <li>Dodaj dodatkowe artykuły w zakładce <strong className="text-white">Artykuły</strong></li>
            <li>Dostosuj kolory i czcionkę w zakładce <strong className="text-white">Styl</strong></li>
            <li>Skonfiguruj sekcję opinii w zakładce <strong className="text-white">Feedback</strong></li>
            <li>Eksportuj gotowy newsletter w zakładce <strong className="text-white">Eksport</strong></li>
          </ol>
        </section>

        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">⌨️ Skróty klawiszowe</h4>
          <div className="bg-[#1a1a2e] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ['Ctrl + S', 'Zapisz projekt lokalnie'],
                  ['Ctrl + E', 'Eksportuj do HTML'],
                  ['Ctrl + P', 'Podgląd w nowej karcie'],
                  ['Ctrl + N', 'Nowy projekt'],
                ].map(([key, desc]) => (
                  <tr key={key} className="border-b border-[#253555] last:border-0">
                    <td className="py-2.5 px-3 text-[#feed01] font-mono text-xs">{key}</td>
                    <td className="py-2.5 px-3 text-gray-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">📧 Kompatybilność z Outlookiem</h4>
          <div className="bg-[#1a1a2e] rounded-lg p-4 space-y-3">
            <div>
              <p className="text-white font-medium text-xs mb-1">✅ Obsługiwane wersje:</p>
              <p className="text-gray-400 text-xs">Outlook 2007, 2010, 2013, 2016, 2019, 365 (desktop), Nowy Outlook, Outlook Web</p>
            </div>
            <div>
              <p className="text-white font-medium text-xs mb-1">🔧 Zastosowane techniki:</p>
              <ul className="text-gray-400 text-xs list-disc ml-4 space-y-0.5">
                <li>Tabele zamiast div (Outlook nie obsługuje float/flexbox)</li>
                <li>Inline styles (brak obsługi class w Outlook)</li>
                <li>VML buttons dla zaokrąglonych rogów</li>
                <li>MSO conditional comments</li>
                <li>bgcolor jako atrybut HTML</li>
                <li>Stałe szerokości (600px)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">💾 Zapisywanie</h4>
          <p className="text-gray-400">
            Projekt zapisuje się <strong className="text-[#00d9a5]">automatycznie</strong> w localStorage przeglądarki. Możesz też eksportować go jako plik <strong className="text-white">.json</strong> aby udostępnić innym lub archiwizować.
          </p>
        </section>

        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">📤 Metody eksportu</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { icon: '📧', title: '.EML', desc: 'Plik e-mail → Otwórz w Outlook → Zapisz jako .OFT' },
              { icon: '📄', title: '.MHT', desc: 'Archiwum webowe, otwierane w starszych Outlookach' },
              { icon: '💾', title: '.HTML', desc: 'Uniwersalny plik, do edycji lub hostingu online' },
              { icon: '📋', title: 'Clipboard', desc: 'Kopiuj HTML do "Moje szablony" lub podpisu' },
            ].map(m => (
              <div key={m.title} className="bg-[#1a1a2e] rounded-lg p-3 border border-[#253555]">
                <div className="flex items-center gap-2 mb-1">
                  <span>{m.icon}</span>
                  <span className="text-white font-bold text-xs">{m.title}</span>
                </div>
                <p className="text-gray-500 text-[10px]">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-[#feed01] font-bold mb-2 text-base">❓ Wsparcie</h4>
          <p className="text-gray-400">Problemy lub sugestie? Napisz na: <strong className="text-white">komunikacja@porr.pl</strong></p>
        </section>
      </div>
    </Modal>
  );
}
