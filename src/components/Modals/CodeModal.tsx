import { useState } from 'react';
import { Modal } from './Modal';

interface CodeModalProps { open: boolean; onClose: () => void; code: string; }

export function CodeModal({ open, onClose, code }: CodeModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const sizeKB = (new Blob([code]).size / 1024).toFixed(1);

  return (
    <Modal open={open} onClose={onClose} title="👁️ Kod HTML" size="lg">
      <div className="mb-2 flex flex-wrap items-center gap-1">
        <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-gray-400">{lineCount} linii</span>
        <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[8px] text-gray-400">{sizeKB} KB</span>
        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] text-emerald-400">✓ Outlook OK</span>
        <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[8px] text-blue-400">XHTML 1.0</span>
        <span className="rounded-full bg-purple-500/10 px-1.5 py-0.5 text-[8px] text-purple-400">VML</span>
      </div>

      <div className="relative rounded-xl border border-white/5 bg-[#0d1117] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-2.5 py-1">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#febc2e]/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#28c840]/60" />
          </div>
          <span className="text-[8px] text-gray-600 font-mono">newsletter.html</span>
        </div>
        <pre className="max-h-[35vh] sm:max-h-[45vh] overflow-auto p-2.5 text-[9px] leading-[1.5] text-emerald-400/80 font-mono touch-scroll select-all">
          {code}
        </pre>
      </div>

      <button onClick={handleCopy}
        className={`mt-2 w-full rounded-xl px-3 py-2 text-[11px] font-bold transition-all active:scale-[0.98] ${
          copied ? 'bg-emerald-500 text-white' : 'bg-[#feed01] text-[#0a1628] hover:shadow-lg hover:shadow-[#feed01]/20'
        }`}>
        {copied ? '✓ Skopiowano!' : '📋 Kopiuj do schowka'}
      </button>
    </Modal>
  );
}
