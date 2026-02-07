import { Modal } from './Modal';
import type { NewsletterState } from '@/types';

interface TemplatesModalProps {
  open: boolean;
  onClose: () => void;
  loadState: (data: Partial<NewsletterState>) => void;
  notify: (msg: string) => void;
}

const templates = [
  { id: 'default', icon: '📰', title: 'Espinacz Standard', desc: 'Klasyczny newsletter z 4 artykułami', border: 'border-blue-500/15', bg: 'hover:bg-blue-500/5' },
  { id: 'minimal', icon: '✨', title: 'Minimalistyczny', desc: 'Prosty layout z 1 artykułem', border: 'border-emerald-500/15', bg: 'hover:bg-emerald-500/5' },
  { id: 'event', icon: '🎉', title: 'Wydarzenie', desc: 'Zaproszenie na event firmowy', border: 'border-purple-500/15', bg: 'hover:bg-purple-500/5' },
  { id: 'empty', icon: '📄', title: 'Pusty', desc: 'Zacznij od zera', border: 'border-gray-500/15', bg: 'hover:bg-gray-500/5' },
];

export function TemplatesModal({ open, onClose, loadState, notify }: TemplatesModalProps) {
  const handleLoad = (id: string) => {
    switch (id) {
      case 'empty':
        loadState({ articles: [], currentArticleId: null, showVideo: false, showFeedback: false } as Partial<NewsletterState>);
        break;
      case 'minimal':
        loadState({
          articles: [{ id: 1, title: 'Artykuł główny', description: 'Opis artykułu...', image: '', link: '#' }],
          showVideo: false, showFeedback: false, currentArticleId: null, nextArticleId: 2,
        } as Partial<NewsletterState>);
        break;
      case 'event':
        loadState({
          issueNumber: 'Zaproszenie na wydarzenie',
          mainTitle: 'Nazwa wydarzenia',
          mainDescription: 'Zapraszamy na wyjątkowe wydarzenie firmowe!',
          articles: [], showVideo: false, showFeedback: true, currentArticleId: null,
        } as Partial<NewsletterState>);
        break;
      default:
        break;
    }
    onClose();
    notify('Szablon wczytany!');
  };

  return (
    <Modal open={open} onClose={onClose} title="📋 Szablony startowe" size="sm">
      <p className="mb-2 text-[10px] text-gray-500">Wybierz szablon jako punkt wyjścia.</p>
      <div className="grid grid-cols-2 gap-1.5">
        {templates.map(t => (
          <button key={t.id} onClick={() => handleLoad(t.id)}
            className={`group rounded-xl border ${t.border} ${t.bg} bg-white/[0.01] p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}>
            <div className="mb-1.5 text-xl group-hover:scale-110 transition-transform">{t.icon}</div>
            <h5 className="mb-0.5 text-[11px] font-bold text-white">{t.title}</h5>
            <p className="text-[8px] text-gray-500 leading-relaxed">{t.desc}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
}
