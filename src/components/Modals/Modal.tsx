import type { ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-3xl' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] flex items-center justify-center p-3 md:p-6 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-[#16213e] rounded-xl ${maxWidth} w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50 border border-[#253555]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#253555] flex-shrink-0">
          <h3 className="text-[#feed01] text-base font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#feed01] text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>
        {/* Content */}
        <div className="overflow-y-auto p-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
