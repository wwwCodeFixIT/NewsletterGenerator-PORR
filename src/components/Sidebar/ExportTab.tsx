import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { NewsletterState } from '@/types';
import { generateEmailHTML, generateMHT, downloadFile, checkOutlookCompat } from '@/utils/emailGenerator';
import { generateEml } from '@/utils/emlGenerator';
import { cn } from '@/utils/cn';

interface ExportTabProps {
  state: NewsletterState;
  notify: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onShowCode: (code: string) => void;
  onShowOutlookHelp: () => void;
  loadState: (data: NewsletterState) => void;
}

function sanitizeFilename(value: string): string {
  return (value || 'newsletter')
    .replace(/[^a-z0-9-_]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function ExportTab({ state, notify, onShowCode, onShowOutlookHelp, loadState }: ExportTabProps) {
  const html = useMemo(() => generateEmailHTML(state), [state]);
  const htmlSize = new Blob([html]).size;
  const sizeKB = (htmlSize / 1024).toFixed(1);
  const issues = useMemo(() => checkOutlookCompat(state), [state]);
  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');

  const safeBaseName = sanitizeFilename(state.issueNumber || 'newsletter');

  const handleExportEMLClassic = () => {
    try {
      const eml = generateEml(html, state, { draftMode: true });
      downloadFile(eml, `${safeBaseName}-classic-draft.eml`, 'message/rfc822');
      notify('EML draft pobrany! Wersja pod klasyczny Outlook.', 'info');
    } catch {
      notify('Nie udało się wygenerować pliku EML dla klasycznego Outlooka.', 'error');
    }
  };

  const handleExportEMLNewOutlook = () => {
    try {
      const eml = generateEml(html, state, { draftMode: false });
      downloadFile(eml, `${safeBaseName}-new-outlook.eml`, 'message/rfc822');
      notify('EML pobrany! Wersja pod nowy Outlook.', 'info');
    } catch {
      notify('Nie udało się wygenerować pliku EML dla nowego Outlooka.', 'error');
    }
  };

  const handleExportMHT = () => {
    try {
      const mht = generateMHT(html, state.issueNumber);
      downloadFile(mht, `${safeBaseName}.mht`, 'message/rfc822');
      notify('MHT pobrany!');
    } catch {
      notify('Nie udało się wygenerować pliku MHT.', 'error');
    }
  };

  const handleExportHTML = () => {
    try {
      downloadFile(html, `${safeBaseName}.html`, 'text/html;charset=utf-8');
      notify('HTML pobrany!');
    } catch {
      notify('Nie udało się pobrać HTML.', 'error');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('HTML skopiowany do schowka!');
    } catch {
      notify('Nie udało się skopiować HTML do schowka.', 'error');
    }
  };

  const handleCopyNewOutlook = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('Skopiowano! Wklej do "Moje szablony".', 'info');
    } catch {
      notify('Nie udało się skopiować treści dla "Moje szablony".', 'error');
    }
  };

  const handleCopySignature = async () => {
    try {
      await navigator.clipboard.writeText(html);
      notify('Skopiowano! Wklej jako nowy podpis.', 'info');
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
      downloadFile(
        JSON.stringify(state, null, 2),
        `${safeBaseName}-projekt.json`,
        'application/json'
      );
      notify('Projekt wyeksportowany!');
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
          loadState(JSON.parse(e.target?.result as string));
          notify('Projekt wczytany!');
        } catch {
          notify('Błąd wczytywania projektu!', 'error');
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

      <ExportSection
        icon="🖥️"
        title="Klasyczny Outlook"
        subtitle="Desktop 2007-2019"
        borderColor="border-blue-500/15"
        bgColor="bg-blue-900/8"
      >
        <div className="mb-1.5 rounded-lg border-l-2 border-blue-400/30 bg-black/20 p-1.5 text-[8px] leading-relaxed text-gray-400">
          <strong className="mb-0.5 block text-[9px] text-[#feed01]">💡 Tworzenie szablonu .OFT:</strong>
          1. Pobierz .EML draft → 2. Otwórz w klasycznym Outlook → 3. Zapisz jako → Szablon (.oft)
        </div>

        <div className="space-y-1">
          <ExportBtn onClick={handleExportEMLClassic} icon="📧" label="Pobierz .EML draft" variant="blue" />
          <ExportBtn onClick={handleExportMHT} icon="📄" label="Pobierz .MHT" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection
        icon="✨"
        title="Nowy Outlook"
        subtitle="Windows 11 / Web"
        borderColor="border-cyan-500/15"
        bgColor="bg-cyan-900/8"
      >
        <div className="mb-1.5 rounded-lg border-l-2 border-yellow-400/30 bg-black/20 p-1.5 text-[8px] leading-relaxed text-gray-400">
          <strong className="mb-0.5 block text-[9px] text-yellow-400">ℹ️ Nowy Outlook</strong>
          Obsługuje .EML, ale nie .OFT. Używaj eksportu .EML dla nowego Outlooka albo "Moje szablony".
        </div>

        <div className="space-y-1">
          <ExportBtn onClick={handleExportEMLNewOutlook} icon="📧" label="Pobierz .EML" variant="cyan" />
          <ExportBtn onClick={handleCopyNewOutlook} icon="📋" label='Kopiuj dla "Moje szablony"' variant="cyan" />
          <ExportBtn onClick={handleCopySignature} icon="✍️" label="Kopiuj jako podpis" variant="cyan" />
          <ExportBtn onClick={onShowOutlookHelp} icon="❓" label="Instrukcja krok po kroku" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection
        icon="💻"
        title="Uniwersalne"
        borderColor="border-white/[0.06]"
        bgColor="bg-white/[0.01]"
      >
        <div className="space-y-1">
          <ExportBtn onClick={handleExportHTML} icon="💾" label="Pobierz HTML" variant="green" />
          <ExportBtn onClick={handleCopy} icon="📋" label="Kopiuj HTML" variant="ghost" />
          <ExportBtn onClick={() => onShowCode(html)} icon="👁️" label="Podgląd kodu" variant="ghost" />
          <ExportBtn onClick={handleOpenInTab} icon="🔗" label="Otwórz w przeglądarce" variant="ghost" />
        </div>
      </ExportSection>

      <ExportSection
        icon="💾"
        title="Projekt"
        borderColor="border-white/[0.06]"
        bgColor="bg-white/[0.01]"
      >
        <div className="space-y-1">
          <ExportBtn onClick={handleExportProject} icon="📤" label="Eksportuj (.json)" variant="ghost" />
          <ExportBtn onClick={handleImportProject} icon="📥" label="Importuj projekt" variant="ghost" />
        </div>
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
}: {
  onClick: () => void;
  icon: string;
  label: string;
  variant: 'blue' | 'cyan' | 'green' | 'ghost';
}) {
  const cls: Record<string, string> = {
    blue: 'bg-[#0078d4] text-white hover:bg-[#0068b8]',
    cyan: 'bg-gradient-to-r from-[#0078d4] to-[#00bcf2] text-white hover:brightness-110',
    green: 'bg-gradient-to-r from-[#00d9a5] to-[#00b894] text-white hover:brightness-110',
    ghost:
      'border border-white/[0.05] bg-white/[0.03] text-gray-300 hover:border-white/10 hover:bg-white/[0.06]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-[6px] text-[10px] font-semibold transition-all active:scale-[0.98] ${cls[variant]}`}
    >
      <span className="shrink-0 text-[10px]">{icon}</span>
      <span className="truncate text-left">{label}</span>
    </button>
  );
}
