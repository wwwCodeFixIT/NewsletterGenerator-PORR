import { Modal } from './Modal';

interface TemplatesModalProps {
  onClose: () => void;
  onLoad: (type: string) => void;
}

const templates = [
  {
    id: 'default',
    icon: '📰',
    title: 'Espinacz Standard',
    desc: 'Klasyczny newsletter z 4 artykułami, wideo i feedbackiem',
    badge: 'Domyślny',
    badgeColor: 'bg-[#feed01] text-[#143e70]',
  },
  {
    id: 'minimal',
    icon: '✨',
    title: 'Minimalistyczny',
    desc: 'Uproszczony layout z 1-2 artykułami, bez wideo',
    badge: 'Prosty',
    badgeColor: 'bg-[#00d9a5] text-white',
  },
  {
    id: 'kdp-lodz',
    icon: '🚇',
    title: 'Tunnel connects us',
    desc: 'Drugi szablon Espinacza z tytułami i linkami PL/EN oraz przyciskami „Czytaj dalej” / „Read more”.',
    badge: 'PL/EN',
    badgeColor: 'bg-[#00bcf2] text-white',
  },
  {
    id: 'event',
    icon: '🎉',
    title: 'Wydarzenie',
    desc: 'Zaproszenie na event firmowy z głównym CTA',
    badge: 'Event',
    badgeColor: 'bg-[#0078d4] text-white',
  },
  {
    id: 'empty',
    icon: '📄',
    title: 'Pusty szablon',
    desc: 'Czysta karta – zacznij projekt od zera',
    badge: 'Czysty',
    badgeColor: 'bg-gray-600 text-white',
  },
];

export function TemplatesModal({ onClose, onLoad }: TemplatesModalProps) {
  return (
    <Modal title="📋 Szablony startowe" onClose={onClose} maxWidth="max-w-2xl">
      <p className="text-gray-400 text-sm mb-4">Wybierz szablon aby szybko rozpocząć pracę nad newsletterem.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onLoad(t.id)}
            className="bg-[#1a1a2e] border-2 border-[#253555] rounded-xl p-5 text-left hover:border-[#feed01] hover:bg-[#feed01]/5 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl group-hover:scale-110 transition-transform">{t.icon}</span>
              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
            </div>
            <h5 className="text-white font-bold text-sm mb-1 group-hover:text-[#feed01] transition-colors">{t.title}</h5>
            <p className="text-gray-500 text-[11px] leading-relaxed">{t.desc}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
