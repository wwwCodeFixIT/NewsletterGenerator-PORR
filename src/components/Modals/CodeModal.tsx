import { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';

interface CodeModalProps {
  html: string;
  onClose: () => void;
  onCopy: () => void;
}

export function CodeModal({ html, onClose, onCopy }: CodeModalProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const lineCount = html.split('\n').length;
  const charCount = html.length;

  useEffect(() => {
    if (copied) {
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
  };

  return (
    <Modal title="👁️ Kod HTML" onClose={onClose} maxWidth="max-w-4xl">
      {/* Stats */}
      <div className="flex gap-3 mb-3">
        <span className="text-[10px] bg-[#1a1a2e] text-gray-400 px-2 py-1 rounded-full">
          📝 {lineCount} linii
        </span>
        <span className="text-[10px] bg-[#1a1a2e] text-gray-400 px-2 py-1 rounded-full">
          📦 {(charCount / 1024).toFixed(1)} KB
        </span>
        <span className="text-[10px] bg-[#0078d4]/20 text-[#00bcf2] px-2 py-1 rounded-full">
          ✅ Outlook-compatible
        </span>
      </div>

      {/* Code block */}
      <pre
        ref={preRef}
        className="bg-[#0d1117] p-4 rounded-lg overflow-auto text-[11px] text-[#00d9a5] max-h-[50vh] font-mono leading-relaxed border border-[#253555]"
      >
        {html}
      </pre>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCopy}
          className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
            copied
              ? 'bg-[#00d9a5] text-white'
              : 'bg-[#feed01] text-[#143e70] hover:shadow-lg hover:shadow-[#feed01]/20'
          }`}
        >
          {copied ? '✅ Skopiowano!' : '📋 Kopiuj do schowka'}
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[#143e70] text-white rounded-lg font-bold text-sm border border-[#253555] hover:bg-[#1a5a90] transition-colors"
        >
          Zamknij
        </button>
      </div>
    </Modal>
  );
}
