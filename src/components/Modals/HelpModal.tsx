import { Modal } from './Modal';

interface HelpModalProps { open: boolean; onClose: () => void; }

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="📘 Pomoc — PORR Newsletter Generator" size="lg">
      <div className="space-y-3">
        <HelpSection icon="🚀" title="Szybki start">
          <ol className="ml-3 list-decimal space-y-1 text-[11px] text-gray-400 leading-relaxed">
            <li>Wypełnij pola w <Badge>Treść</Badge></li>
            <li>Dodaj artykuły w <Badge>Artykuły</Badge></li>
            <li>Skonfiguruj ankietę w <Badge>Feedback</Badge></li>
            <li>Dostosuj wygląd w <Badge>Styl</Badge></li>
            <li>Eksportuj w <Badge>Eksport</Badge></li>
          </ol>
        </HelpSection>

        <HelpSection icon="⌨️" title="Skróty klawiszowe">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {[
              ['Ctrl+S', 'Zapisz projekt'],
              ['Ctrl+E', 'Eksportuj HTML'],
              ['Ctrl+P', 'Podgląd w nowej karcie'],
              ['Ctrl+N', 'Nowy projekt'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-1.5 rounded-lg bg-black/20 p-1.5">
                <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] text-[#feed01]">{key}</kbd>
                <span className="text-[9px] text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </HelpSection>

        <HelpSection icon="📧" title="Kompatybilność z Outlookiem">
          <ul className="ml-3 list-disc space-y-0.5 text-[11px] text-gray-400">
            <li>Layout oparty wyłącznie na <strong className="text-[#feed01]">&lt;table&gt;</strong></li>
            <li>Inline styles (bez shorthand CSS)</li>
            <li>VML buttons dla zaokrąglonych przycisków</li>
            <li>MSO conditional comments</li>
            <li>Obrazki z width, height, border="0", display:block</li>
            <li>DOCTYPE XHTML 1.0 Transitional</li>
            <li>Namespace VML: xmlns:v, xmlns:o</li>
          </ul>
        </HelpSection>

        <HelpSection icon="📤" title="Eksport do Outlooka">
          <div className="space-y-1.5">
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-2">
              <p className="text-[10px] text-blue-400 font-semibold mb-0.5">Klasyczny Outlook (Desktop)</p>
              <p className="text-[9px] text-gray-400">Pobierz .EML → Otwórz w Outlook → Plik → Zapisz jako → Szablon Outlooka (.oft)</p>
            </div>
            <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 p-2">
              <p className="text-[10px] text-cyan-400 font-semibold mb-0.5">Nowy Outlook (Win11/Web)</p>
              <p className="text-[9px] text-gray-400">Skopiuj HTML → Nowa wiadomość → ⋯ → Moje szablony → + Szablon → Wklej</p>
            </div>
          </div>
        </HelpSection>

        <HelpSection icon="💾" title="Zapisywanie">
          <p className="text-[11px] text-gray-400">
            Projekt zapisuje się <strong className="text-emerald-400">automatycznie</strong> do localStorage.
            Eksportuj jako .json, aby udostępnić lub archiwizować.
          </p>
        </HelpSection>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-center">
          <p className="text-[11px] text-gray-400">
            Kontakt: <strong className="text-[#feed01]">komunikacja@porr.pl</strong>
          </p>
        </div>
      </div>
    </Modal>
  );
}

function HelpSection({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
      <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-white">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#feed01]/10 text-[10px]">{icon}</span>
        {title}
      </h4>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-[#feed01]/15 px-1 py-0.5 text-[10px] font-semibold text-[#feed01]">{children}</span>;
}
