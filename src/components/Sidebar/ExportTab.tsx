import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { NewsletterState } from '@/types';
import { generateMHT, downloadFile, checkOutlookCompat } from '@/utils/emailGenerator';
import { generateEml } from '@/utils/emlGenerator';
import { cn } from '@/utils/cn';

interface ExportTabProps {
  state: NewsletterState;
  html: string;
  notify: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onShowCode: () => void;
  onShowOutlookHelp: () => void;
  loadState: (data: Partial<NewsletterState>) => void;
}

function sanitizeFilename(value: string): string {
  return (value || 'newsletter')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function ExportTab({ state, html, notify, onShowCode, onShowOutlookHelp, loadState }: ExportTabProps) {
  const htmlSize = new Blob([html]).size;
  const sizeKB = (htmlSize / 1024).toFixed(1);
  const issues = useMemo(() => checkOutlookCompat(state), [state]);
  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');
  const safeBaseName = sanitizeFilename(state.issueNumber || 'newsletter');

  const exportEml = (draftMode: boolean, externalImageMode: 'keep' | 'remove', suffix: string, successMsg: string) => {
    try {
      const eml = generateEml(html, state, { draftMode, externalImageMode });
      downloadFile(eml, `${safeBaseName}-${suffix}.eml`, 'message/rfc822');
      notify(successMsg, 'info');
    } catch {
      notify('Nie udało się wygenerować pliku .EML.', 'error');
    }
  };

  const handleExportEMLDraftSafe = () =>
    exportEml(true, 'remove', 'draft-outlook-safe', '🛡️ Draft .EML Outlook Safe pobrany! Zewnętrzne obrazy pominięte, lokalne osadzone jako CID.');
  const handleExportEMLDraft = () =>
    exportEml(true, 'keep', 'draft', '📧 Draft .EML pobrany! Otwórz w klasycznym Outlooku i edytuj przed wysyłką.');
  const handleExportEMLSafe = () =>
    exportEml(false, 'remove', 'outlook-safe', '🛡️ .EML Outlook Safe pobrany! Zewnętrzne obrazy pominięte, lokalne osadzone jako CID.');
  const handleExportEMLNewOutlook = () =>
    exportEml(false, 'keep', 'new-outlook', '📧 .EML pobrany! Wersja do otwarcia w nowym Outlooku.');

  const handleExportMHT = () => {
    try {
      const mht = generateMHT(html, state.issueNumber);
      downloadFile(mht, `${safeBaseName}.mht`, 'message/rfc822');
      notify('📄 MHT pobrany!');
    } catch {
      notify('Nie udało się wygenerować pliku MHT.', 'error');
    }
  };

  const handleExportHTML = () => {
    try {
      downloadFile(html, `${safeBaseName}.html`, 'text/html;charset=utf-8', true);
      notify('💾 HTML pobrany!');
    } catch {
      notify('Nie udało się pobrać HTML.', 'error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('📋 HTML skopiowany do schowka!');
    } catch {
      notify('Nie udało się skopiować HTML do schowka.', 'error');
    }
  };

  const handleCopyNewOutlook = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('📋 Skopiowano! Wklej do "Moje szablony" albo bezpośrednio do nowej wiadomości.', 'info');
    } catch {
      notify('Nie udało się skopiować treści dla nowego Outlooka.', 'error');
    }
  };

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('✍️ Skopiowano! Wklej jako nowy podpis w ustawieniach.', 'info');
    } catch {
      notify('Nie udało się skopiować podpisu.', 'error');
    }
  };

  const handleOpenInTab = () => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleExportProject = () => {
    try {
      downloadFile(JSON.stringify(state, null, 2), `${safeBaseName}-projekt.json`, 'application/json', true);
      notify('📦 Projekt wyeksportowany!');
    } catch {
      notify('Nie udało się wyeksportować projektu.', 'error');
    }
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (!data || typeof data !== 'object') throw new Error('invalid');
          loadState(data);
          notify('✅ Projekt wczytany!');
        } catch {
          notify('❌ Błąd wczytywania projektu! Sprawdź format pliku.', 'error');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <div className="animate-fade-in space-y-2">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-gradient-to-r from-[#0f2847]/50 to-[#0a1628]/50 p-2">
        <StatItem value={sizeKB} label="KB" color="text-[#feed01]" />
        <StatItem value={String(state.articles.length)} label="Artykuły" color="text-[#00d9a5]" />
        <StatItem
          value={hasErrors ? '⚠️' : hasWarnings ? '⚡' : '✓'}
          label={hasErrors ? 'Błędy' : hasWarnings ? 'Uwagi' : 'OK'}
          color={hasErrors ? 'text-red-400' : hasWarnings ? 'text-amber-400' : 'text-emerald-400'}
        />
      </div>

      <div
        className={cn(
          'rounded-xl border p-2',
          hasErrors
            ? 'border-red-500/20 bg-red-500/5'
            : hasWarnings
              ? 'border-amber-500/15 bg-amber-500/5'
              : 'border-emerald-500/15 bg-emerald-500/5'
        )}
      >
        <h4 className="mb-1 flex items-center gap-1 text-[10px] font-bold text-white">
          <span className="text-[10px]">{hasErrors ? '❌' : hasWarnings ? '⚠️' : '✅'}</span>
          Kompatybilność Outlook
        </h4>

        <div className="max-h-[100px] space-y-0.5 overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-1 text-[9px]">
              <span className="mt-0.5 shrink-0">
                {issue.severity === 'ok' ? '✅' : issue.severity === 'warning' ? '⚡' : '❌'}
              </span>
              <span
                className={cn(
                  issue.severity === 'ok'
                    ? 'text-emerald-400'
                    : issue.severity === 'warning'
                      ? 'text-amber-400'
                      : 'text-red-400'
                )}
              >
                {issue.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ExportSection icon="🖥️" title="Klasyczny Outlook" subtitle="Desktop 2007-2019" borderColor="border-blue-500/15" bgColor="bg-blue-900/8">
        <div className="mb-1.5 rounded-lg border-l-2 border-blue-400/30 bg-black/20 p-1.5 text-[8px] leading-relaxed text-gray-400">
          <strong className="mb-0.5 block text-[9px] text-[#feed01]">💡 Edytowanie przed wysyłką</strong>
          Te tryby tworzą wiadomość jako draft .EML. Po otwarciu w klasycznym Outlooku możesz edytować treść, temat, odbiorców i dopiero wtedy wysłać.
        </div>

        <div className="space-y-1">
          <ExportBtn onClick={handleExportEMLDraftSafe} icon="🛡️" label="Draft Outlook Safe" badge="Polecane" variant="shield" />
          <ExportBtn onClick={handleExportEMLDraft} icon="📧" label="Draft standardowy" variant="blue" />
          <ExportBtn onClick={handleExportMHT} icon="📄" label="Pobierz .MHT" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection icon="✨" title="Nowy Outlook" subtitle="Windows 11 / Web" borderColor="border-cyan-500/15" bgColor="bg-cyan-900/8">
        <div className="mb-1.5 rounded-lg border-l-2 border-yellow-400/30 bg-black/20 p-1.5 text-[8px] leading-relaxed text-gray-400">
          <strong className="mb-0.5 block text-[9px] text-yellow-400">ℹ️ Ograniczenie nowego Outlooka</strong>
          Nowy Outlook nie wspiera niezawodnie edytowalnych draftów .EML. Najstabilniej działa kopiowanie treści do nowej wiadomości lub „Moje szablony”.
        </div>

        <div className="space-y-1">
          <ExportBtn onClick={handleExportEMLSafe} icon="🛡️" label="Pobierz .EML Outlook Safe" badge="Polecane" variant="shield" />
          <ExportBtn onClick={handleExportEMLNewOutlook} icon="📧" label="Pobierz .EML standardowy" variant="cyan" />
          <ExportBtn onClick={handleCopyNewOutlook} icon="📋" label='Kopiuj do "Moje szablony"' variant="cyan" />
          <ExportBtn onClick={handleCopySignature} icon="✍️" label="Kopiuj jako podpis" variant="cyan" />
          <ExportBtn onClick={onShowOutlookHelp} icon="❓" label="Instrukcja krok po kroku" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection icon="💻" title="Uniwersalne" borderColor="border-white/[0.06]" bgColor="bg-white/[0.01]">
        <div className="space-y-1">
          <ExportBtn onClick={handleExportHTML} icon="💾" label="Pobierz HTML" variant="green" />
          <ExportBtn onClick={handleCopy} icon="📋" label="Kopiuj HTML" variant="ghost" />
          <ExportBtn onClick={onShowCode} icon="👁️" label="Podgląd kodu" variant="ghost" />
          <ExportBtn onClick={handleOpenInTab} icon="🔗" label="Otwórz w przeglądarce" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection icon="💾" title="Projekt" borderColor="border-white/[0.06]" bgColor="bg-white/[0.01]">
        <div className="space-y-1">
          <ExportBtn onClick={handleExportProject} icon="📤" label="Eksportuj (.json)" variant="ghost" />
          <ExportBtn onClick={handleImportProject} icon="📥" label="Importuj projekt" variant="ghost" />
        </div>
        <p className="mt-1.5 text-[8px] leading-relaxed text-gray-600">
          Pliki .json pozwalają udostępniać projekty newsletterów między użytkownikami.
        </p>
      </ExportSection>
    </div>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className={`text-[13px] font-bold ${color}`}>{value}</div>
      <div className="text-[7px] uppercase tracking-wider text-gray-600">{label}</div>
    </div>
  );
}

function ExportSection({
  icon,
  title,
  subtitle,
  borderColor,
  bgColor,
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  borderColor: string;
  bgColor: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-2.5`}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-[11px]">{icon}</span>
        <div className="min-w-0">
          <h4 className="text-[10px] font-bold text-white">{title}</h4>
          {subtitle && <span className="text-[7px] text-gray-500">{subtitle}</span>}
        </div>
      </div>
      {children}
    </div>
  );
}

function ExportBtn({
  onClick,
  icon,
  label,
  variant,
  badge,
}: {
  onClick: () => void;
  icon: string;
  label: string;
  variant: 'blue' | 'cyan' | 'green' | 'ghost' | 'shield';
  badge?: string;
}) {
  const cls: Record<string, string> = {
    blue: 'bg-[#0078d4] text-white hover:bg-[#0068b8]',
    cyan: 'bg-gradient-to-r from-[#0078d4] to-[#00bcf2] text-white hover:brightness-110',
    green: 'bg-gradient-to-r from-[#00d9a5] to-[#00b894] text-white hover:brightness-110',
    shield: 'bg-gradient-to-r from-[#00d9a5] to-[#0078d4] text-white hover:brightness-110 ring-1 ring-white/20',
    ghost: 'border border-white/[0.05] bg-white/[0.03] text-gray-300 hover:border-white/10 hover:bg-white/[0.06]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-[6px] text-[10px] font-semibold transition-all active:scale-[0.98] ${cls[variant]}`}
    >
      <span className="shrink-0 text-[10px]">{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      {badge && (
        <span className="shrink-0 rounded-full bg-black/25 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide">
          {badge}
        </span>
      )}
    </button>
  );
}
