import { useMemo } from 'react';
import type { NewsletterState } from '@/types';
import { generateEmailHTML, generateEML, generateMSG, generateMHT, downloadFile, checkOutlookCompat } from '@/utils/emailGenerator';
import { cn } from '@/utils/cn';

interface ExportTabProps {
  state: NewsletterState;
  notify: (msg: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  onShowCode: (code: string) => void;
  onShowOutlookHelp: () => void;
  loadState: (data: NewsletterState) => void;
}

export function ExportTab({ state, notify, onShowCode, onShowOutlookHelp, loadState }: ExportTabProps) {
  const html = useMemo(() => generateEmailHTML(state), [state]);
  const htmlSize = new Blob([html]).size;
  const sizeKB = (htmlSize / 1024).toFixed(1);
  const issues = useMemo(() => checkOutlookCompat(state), [state]);
  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');

  const handleExportEML = () => {
    const eml = generateEML(html, state.issueNumber);
    downloadFile(eml, 'newsletter.eml', 'message/rfc822');
    notify('EML pobrany! Otwórz w Outlook → Zapisz jako .OFT', 'info');
  };

  const handleExportMSG = () => {
    const msg = generateMSG(html, state.issueNumber);
    downloadFile(msg, 'newsletter.eml', 'message/rfc822');
    notify('Plik gotowy! Otwórz w Outlooku, aby utworzyć wersję roboczą.', 'info');
  };

  const handleExportMHT = () => {
    const mht = generateMHT(html, state.issueNumber);
    downloadFile(mht, 'newsletter.mht', 'message/rfc822');
    notify('MHT pobrany!');
  };

  const handleExportHTML = () => {
    downloadFile(html, 'newsletter.html', 'text/html;charset=utf-8');
    notify('HTML pobrany!');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    notify('HTML skopiowany do schowka!');
  };

  const handleCopyNewOutlook = async () => {
    await navigator.clipboard.writeText(html);
    notify('Skopiowano! Wklej do "Moje szablony"', 'info');
  };

  const handleCopySignature = async () => {
    await navigator.clipboard.writeText(html);
    notify('Skopiowano! Wklej jako nowy podpis', 'info');
  };

  const handleOpenInTab = () => {
    window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank');
  };

  const handleExportProject = () => {
    downloadFile(JSON.stringify(state, null, 2), `${state.issueNumber || 'newsletter'}-projekt.json`, 'application/json');
    notify('Projekt wyeksportowany!');
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try { loadState(JSON.parse(e.target?.result as string)); notify('Projekt wczytany!'); }
        catch { notify('Błąd wczytywania!', 'error'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="animate-fade-in space-y-2">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[0.05] bg-gradient-to-r from-[#0f2847]/50 to-[#0a1628]/50 p-2">
        <StatItem value={sizeKB} label="KB" color="text-[#feed01]" />
        <StatItem value={String(state.articles.length)} label="Artykuły" color="text-[#00d9a5]" />
        <StatItem
          value={hasErrors ? '⚠️' : hasWarnings ? '⚡' : '✓'}
          label={hasErrors ? 'Błędy' : hasWarnings ? 'Uwagi' : 'OK'}
          color={hasErrors ? 'text-red-400' : hasWarnings ? 'text-amber-400' : 'text-emerald-400'}
        />
      </div>

      {/* Outlook compatibility */}
      <div className={cn(
        'rounded-xl border p-2',
        hasErrors ? 'border-red-500/20 bg-red-500/5' : hasWarnings ? 'border-amber-500/15 bg-amber-500/5' : 'border-emerald-500/15 bg-emerald-500/5'
      )}>
        <h4 className="text-[10px] font-bold text-white mb-1 flex items-center gap-1">
          <span className="text-[10px]">{hasErrors ? '❌' : hasWarnings ? '⚠️' : '✅'}</span>
          Kompatybilność Outlook
        </h4>
        <div className="space-y-0.5 max-h-[100px] overflow-y-auto">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-1 text-[9px]">
              <span className="shrink-0 mt-0.5">
                {issue.severity === 'ok' ? '✅' : issue.severity === 'warning' ? '⚡' : '❌'}
              </span>
              <span className={cn(
                issue.severity === 'ok' ? 'text-emerald-400' : issue.severity === 'warning' ? 'text-amber-400' : 'text-red-400'
              )}>
                {issue.message}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Classic Outlook */}
      <ExportSection
        icon="🖥️"
        title="Klasyczny Outlook"
        subtitle="Desktop 2007-2019"
        borderColor="border-blue-500/15"
        bgColor="bg-blue-900/8"
      >
        <div className="mb-1.5 rounded-lg border-l-2 border-blue-400/30 bg-black/20 p-1.5 text-[8px] text-gray-400 leading-relaxed">
          <strong className="text-[#feed01] block text-[9px] mb-0.5">💡 Tworzenie szablonu .OFT:</strong>
          1. Pobierz .EML → 2. Otwórz w Outlook → 3. Zapisz jako → Szablon (.oft)
        </div>
        <div className="space-y-1">
          <ExportBtn onClick={handleExportEML} icon="📧" label="Pobierz .EML" variant="blue" />
          <ExportBtn onClick={handleExportMSG} icon="📨" label="Wersja robocza (X-Unsent)" variant="blue" />
          <ExportBtn onClick={handleExportMHT} icon="📄" label="Pobierz .MHT" variant="ghost" />
        </div>
      </ExportSection>

      {/* New Outlook */}
      <ExportSection
        icon="✨"
        title="Nowy Outlook"
        subtitle="Windows 11 / Web"
        borderColor="border-cyan-500/15"
        bgColor="bg-cyan-900/8"
      >
        <div className="space-y-1">
          <ExportBtn onClick={handleCopyNewOutlook} icon="📋" label='Kopiuj dla "Moje szablony"' variant="cyan" />
          <ExportBtn onClick={handleCopySignature} icon="✍️" label="Kopiuj jako podpis" variant="cyan" />
          <ExportBtn onClick={onShowOutlookHelp} icon="❓" label="Instrukcja krok po kroku" variant="ghost" />
        </div>
      </ExportSection>

      {/* Universal */}
      <ExportSection icon="💻" title="Uniwersalne" borderColor="border-white/[0.06]" bgColor="bg-white/[0.01]">
        <div className="space-y-1">
          <ExportBtn onClick={handleExportHTML} icon="💾" label="Pobierz HTML" variant="green" />
          <ExportBtn onClick={handleCopy} icon="📋" label="Kopiuj HTML" variant="ghost" />
          <ExportBtn onClick={() => onShowCode(html)} icon="👁️" label="Podgląd kodu" variant="ghost" />
          <ExportBtn onClick={handleOpenInTab} icon="🔗" label="Otwórz w przeglądarce" variant="ghost" />
        </div>
      </ExportSection>

      {/* Project */}
      <ExportSection icon="💾" title="Projekt" borderColor="border-white/[0.06]" bgColor="bg-white/[0.01]">
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
      <div className="text-[7px] text-gray-600 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function ExportSection({ icon, title, subtitle, borderColor, bgColor, children }: {
  icon: string; title: string; subtitle?: string; borderColor: string; bgColor: string; children: React.ReactNode;
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

function ExportBtn({ onClick, icon, label, variant }: { onClick: () => void; icon: string; label: string; variant: 'blue' | 'cyan' | 'green' | 'ghost' }) {
  const cls: Record<string, string> = {
    blue: 'bg-[#0078d4] hover:bg-[#0068b8] text-white',
    cyan: 'bg-gradient-to-r from-[#0078d4] to-[#00bcf2] hover:brightness-110 text-white',
    green: 'bg-gradient-to-r from-[#00d9a5] to-[#00b894] hover:brightness-110 text-white',
    ghost: 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-300 border border-white/[0.05] hover:border-white/10',
  };
  return (
    <button onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-lg px-2 py-[6px] text-[10px] font-semibold transition-all active:scale-[0.98] ${cls[variant]}`}
    >
      <span className="text-[10px] shrink-0">{icon}</span>
      <span className="truncate text-left">{label}</span>
    </button>
  );
}
