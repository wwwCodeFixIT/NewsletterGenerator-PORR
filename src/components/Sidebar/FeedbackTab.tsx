import type { NewsletterState, FeedbackStyle, FeedbackOption } from '@/types';
import { Input, Toggle, ColorInput, Section } from './FormElements';
import { cn } from '@/utils/cn';

interface FeedbackTabProps {
  state: NewsletterState;
  update: (partial: Partial<NewsletterState>) => void;
  setFeedbackStyle: (style: FeedbackStyle) => void;
  addFeedbackOption: () => void;
  deleteFeedbackOption: (id: number) => void;
  updateFeedbackOption: (id: number, partial: Partial<FeedbackOption>) => void;
}

const emojiSets: Record<FeedbackStyle, string[]> = {
  emoji: ['😍', '😊', '🙂', '😐', '😕', '😞', '👍', '👎'],
  stars: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'],
  thumbs: ['👍👍', '👍', '🤷', '👎', '👎👎'],
};

const styleOptions: { id: FeedbackStyle; icon: string; label: string }[] = [
  { id: 'emoji', icon: '😀', label: 'Emoji' },
  { id: 'stars', icon: '⭐', label: 'Gwiazdki' },
  { id: 'thumbs', icon: '👍', label: 'Kciuki' },
];

export function FeedbackTab({ state, update, setFeedbackStyle, addFeedbackOption, deleteFeedbackOption, updateFeedbackOption }: FeedbackTabProps) {
  return (
    <div className="animate-fade-in">
      <Section title="Sekcja feedback" icon="💬" collapsible={false} badge={state.showFeedback ? 'ON' : 'OFF'}>
        <Toggle label="Pokaż sekcję feedback" value={state.showFeedback} onChange={v => update({ showFeedback: v })} />

        <div className="my-1.5 h-px bg-white/5" />

        <Input label="Tytuł" value={state.feedbackTitle} onChange={v => update({ feedbackTitle: v })} icon="✏️" />
        <Input label="Podtytuł" value={state.feedbackSubtitle} onChange={v => update({ feedbackSubtitle: v })} icon="💬" />

        <div className="my-1.5 h-px bg-white/5" />

        {/* Style selector */}
        <label className="mb-1 block text-[9px] font-medium text-gray-500 uppercase tracking-wider">Styl reakcji</label>
        <div className="mb-1.5 grid grid-cols-3 gap-1">
          {styleOptions.map(so => (
            <button key={so.id} onClick={() => setFeedbackStyle(so.id)}
              className={cn(
                'rounded-lg border-2 p-1.5 text-center transition-all active:scale-95',
                state.feedbackStyle === so.id
                  ? 'border-[#feed01]/40 bg-[#feed01]/8'
                  : 'border-white/[0.04] bg-[#0d1b2a]/40 hover:border-white/[0.08]'
              )}>
              <div className="text-base">{so.icon}</div>
              <div className={cn('text-[8px] font-medium mt-0.5', state.feedbackStyle === so.id ? 'text-[#feed01]' : 'text-gray-500')}>{so.label}</div>
            </button>
          ))}
        </div>

        <div className="my-1.5 h-px bg-white/5" />

        <label className="mb-1 block text-[9px] font-medium text-gray-500 uppercase tracking-wider">
          Opcje ({state.feedbackOptions.length}/7)
        </label>
        <div className="space-y-1.5">
          {state.feedbackOptions.map((o, i) => (
            <div key={o.id} className="rounded-lg border border-white/[0.04] bg-[#0d1b2a]/40 p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] font-bold text-gray-600">#{i + 1}</span>
                {state.feedbackOptions.length > 2 && (
                  <button onClick={() => deleteFeedbackOption(o.id)}
                    className="rounded bg-red-500/10 px-1 py-0.5 text-[8px] text-red-400 hover:bg-red-500/20 active:scale-95">✕</button>
                )}
              </div>
              <div className="grid grid-cols-[36px_1fr_1fr] gap-1 mb-1">
                <div>
                  <label className="block text-[7px] text-gray-600 mb-0.5">Emoji</label>
                  <input type="text" value={o.emoji} onChange={e => updateFeedbackOption(o.id, { emoji: e.target.value })}
                    className="w-full rounded border border-white/[0.06] bg-black/20 px-0.5 py-1 text-center text-sm text-white focus:border-[#feed01]/40 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[7px] text-gray-600 mb-0.5">Etykieta</label>
                  <input type="text" value={o.label} onChange={e => updateFeedbackOption(o.id, { label: e.target.value })}
                    className="w-full rounded border border-white/[0.06] bg-black/20 px-1 py-1 text-[9px] text-white focus:border-[#feed01]/40 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[7px] text-gray-600 mb-0.5">Link</label>
                  <input type="url" value={o.link} onChange={e => updateFeedbackOption(o.id, { link: e.target.value })}
                    className="w-full rounded border border-white/[0.06] bg-black/20 px-1 py-1 text-[9px] text-white focus:border-[#feed01]/40 focus:outline-none" />
                </div>
              </div>
              <div className="flex flex-wrap gap-0.5">
                {emojiSets[state.feedbackStyle].map(e => (
                  <button key={e} onClick={() => updateFeedbackOption(o.id, { emoji: e })}
                    className={cn(
                      'rounded border px-1 py-0.5 text-[10px] transition-all active:scale-90',
                      o.emoji === e ? 'border-[#feed01]/40 bg-[#feed01]/10' : 'border-white/[0.04] bg-black/20 hover:bg-white/5'
                    )}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={addFeedbackOption}
          className="mt-1 w-full rounded-lg border-2 border-dashed border-[#feed01]/20 bg-transparent px-2 py-1 text-[9px] font-semibold text-[#feed01] hover:border-[#feed01]/40 hover:bg-[#feed01]/5 transition-all active:scale-[0.98]">
          ➕ Dodaj opcję
        </button>

        <div className="my-1.5 h-px bg-white/5" />

        <Input label="Link ankiety" value={state.feedbackSurveyLink} onChange={v => update({ feedbackSurveyLink: v })} type="url" placeholder="https://forms.office.com/..." icon="🔗" />
        <Input label="Tekst linku" value={state.feedbackSurveyText} onChange={v => update({ feedbackSurveyText: v })} icon="📝" />
        <ColorInput label="Kolor tła" value={state.feedbackBgColor} onChange={v => update({ feedbackBgColor: v })} />
      </Section>
    </div>
  );
}
