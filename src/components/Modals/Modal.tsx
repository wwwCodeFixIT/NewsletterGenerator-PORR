import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  if (!open) return null;

  const maxW = size === 'sm' ? 'sm:max-w-[420px]' : size === 'lg' ? 'sm:max-w-[720px]' : 'sm:max-w-[560px]';

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`animate-scale-in w-full ${maxW} max-h-[92vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-white/8 bg-gradient-to-br from-[#14243e] to-[#0a1628] p-4 sm:p-5 shadow-2xl shadow-black/50 touch-scroll`}>
        {/* Mobile drag handle */}
        <div className="flex justify-center mb-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13px] font-bold text-white pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-90"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
