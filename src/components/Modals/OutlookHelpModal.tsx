import { Modal } from './Modal';

interface OutlookHelpModalProps { open: boolean; onClose: () => void; }

export function OutlookHelpModal({ open, onClose }: OutlookHelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="📘 Instrukcja — Outlook" size="md">
      <div className="space-y-2.5">
        {/* Classic */}
        <StepSection number={1} title="Klasyczny Outlook — szablon .OFT" badge="Desktop" badgeColor="bg-blue-500/15 text-blue-400"
          steps={[
            'W Generatorze kliknij "Pobierz .EML"',
            'Otwórz pobrany plik w Outlooku',
            'Plik → Zapisz jako → Szablon Outlooka (.oft)',
            'Gotowe! Używaj szablonu do wysyłki',
          ]} />

        <StepSection number={2} title='Nowy Outlook — "Moje szablony"' badge="Zalecana" badgeColor="bg-emerald-500/15 text-emerald-400"
          steps={[
            'Kliknij "Kopiuj dla Moje szablony"',
            'Otwórz Outlook → Nowa wiadomość',
            'Kliknij ⋯ (Więcej opcji) → Moje szablony',
            'Kliknij + Szablon → Nadaj nazwę',
            'Wklej skopiowany HTML (Ctrl+V) → Zapisz',
          ]} />

        <StepSection number={3} title="Nowy Outlook — Podpis email" badge="Alternatywa" badgeColor="bg-purple-500/15 text-purple-400"
          steps={[
            'Kliknij "Kopiuj jako podpis"',
            'Ustawienia → Poczta → Podpisy',
            'Kliknij "Nowy podpis" → Wklej HTML',
            'Przy tworzeniu nowego maila wybierz ten podpis',
          ]} />

        <StepSection number={4} title="Wersja robocza (X-Unsent)" badge="Zaawans." badgeColor="bg-amber-500/15 text-amber-400"
          steps={[
            'Kliknij "Wersja robocza (X-Unsent)"',
            'Otwórz pobrany plik w Outlooku',
            'Mail otworzy się jako nowa wiadomość do edycji',
            'Dodaj odbiorców i wyślij',
          ]} />

        <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-2.5">
          <div className="flex items-start gap-2">
            <span className="text-sm shrink-0">💡</span>
            <div>
              <strong className="block text-[10px] text-emerald-400 mb-0.5">Powrót do klasycznego Outlooka</strong>
              <p className="text-[9px] text-gray-400 leading-relaxed">
                Ustawienia → Ogólne → Wyłącz przełącznik "Nowy Outlook".<br/>
                Klasyczny Outlook obsługuje pliki .OFT i daje więcej kontroli.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
          <h4 className="text-[10px] font-bold text-white mb-1">🔧 Rozwiązywanie problemów</h4>
          <ul className="ml-3 list-disc space-y-0.5 text-[9px] text-gray-400">
            <li>Obrazki się nie ładują? Użyj URL zamiast Base64</li>
            <li>Layout rozjechany? Generator tworzy tabele, nie div-y</li>
            <li>Nie można zapisać .OFT? Użyj klasycznego Outlooka</li>
            <li>Przyciski kwadratowe? VML je zaokrągli w Outlooku</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

function StepSection({ number, title, steps, badge, badgeColor }: {
  number: number; title: string; steps: string[]; badge?: string; badgeColor?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-[#feed01]/15 text-[9px] font-bold text-[#feed01]">{number}</span>
        <h4 className="text-[10px] font-bold text-white">{title}</h4>
        {badge && <span className={`rounded-full ${badgeColor} px-1.5 py-0.5 text-[7px] font-bold`}>{badge}</span>}
      </div>
      <ol className="space-y-0.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-400">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/5 text-[7px] font-bold text-gray-500 mt-0.5">{i + 1}</span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
