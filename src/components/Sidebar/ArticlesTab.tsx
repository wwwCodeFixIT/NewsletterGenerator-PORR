import type { NewsletterState, Article } from '@/types';
import { Input, TextArea, Section } from './FormElements';
import { ImageUpload } from './ImageUpload';
import { cn } from '@/utils/cn';

interface ArticlesTabProps {
  state: NewsletterState;
  update: (partial: Partial<NewsletterState>) => void;
  addArticle: () => void;
  deleteArticle: (id: number) => void;
  moveArticle: (id: number, dir: -1 | 1) => void;
  updateArticle: (id: number, partial: Partial<Article>) => void;
}

export function ArticlesTab({ state, update, addArticle, deleteArticle, moveArticle, updateArticle }: ArticlesTabProps) {
  const current = state.articles.find(a => a.id === state.currentArticleId);

  return (
    <div className="animate-fade-in">
      <Section title="Lista artykułów" icon="📰" collapsible={false} badge={`${state.articles.length}`}>
        <div className="mb-1.5 max-h-[220px] space-y-1 overflow-y-auto pr-0.5 touch-scroll">
          {state.articles.map((a, i) => (
            <div
              key={a.id}
              onClick={() => update({ currentArticleId: a.id })}
              className={cn(
                'group flex items-center gap-1.5 rounded-lg border p-1.5 cursor-pointer transition-all active:scale-[0.99]',
                a.id === state.currentArticleId
                  ? 'border-[#feed01]/30 bg-[#feed01]/5'
                  : 'border-white/[0.04] bg-[#0d1b2a]/40 hover:border-white/[0.08]'
              )}
            >
              <div className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[8px] font-bold',
                a.id === state.currentArticleId ? 'bg-[#feed01] text-[#0a1628]' : 'bg-white/5 text-gray-500'
              )}>
                {i + 1}
              </div>

              {a.image && !a.image.includes('placeholder') && (
                <div className="h-6 w-9 shrink-0 overflow-hidden rounded bg-gray-800">
                  <img src={a.image} alt="" className="h-full w-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}

              <span className="min-w-0 flex-1 truncate text-[9px] font-medium text-gray-300">{a.title}</span>

              <div className="flex shrink-0 gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); moveArticle(a.id, -1); }}
                  className="rounded p-0.5 text-[9px] text-gray-500 hover:bg-white/10 hover:text-white">▲</button>
                <button onClick={e => { e.stopPropagation(); moveArticle(a.id, 1); }}
                  className="rounded p-0.5 text-[9px] text-gray-500 hover:bg-white/10 hover:text-white">▼</button>
                <button onClick={e => { e.stopPropagation(); if (confirm('Usunąć artykuł?')) deleteArticle(a.id); }}
                  className="rounded p-0.5 text-[9px] text-gray-500 hover:bg-red-500/20 hover:text-red-400">✕</button>
              </div>
            </div>
          ))}

          {state.articles.length === 0 && (
            <div className="flex flex-col items-center py-3 text-center opacity-50">
              <span className="text-xl mb-1">📰</span>
              <p className="text-[9px] text-gray-600">Dodaj pierwszy artykuł</p>
            </div>
          )}
        </div>

        <button onClick={addArticle}
          className="w-full rounded-lg border-2 border-dashed border-[#feed01]/20 bg-transparent px-2 py-1.5 text-[10px] font-semibold text-[#feed01] hover:border-[#feed01]/40 hover:bg-[#feed01]/5 transition-all active:scale-[0.98]">
          ➕ Dodaj artykuł
        </button>
      </Section>

      {current && (
        <Section title={`Edycja: ${current.title.substring(0, 16)}...`} icon="✏️" collapsible={false}>
          <Input label="Tytuł" value={current.title} onChange={v => updateArticle(current.id, { title: v })} icon="✏️" />
          <TextArea label="Opis" value={current.description} onChange={v => updateArticle(current.id, { description: v })} rows={2} />
          <Input label="Obrazek (URL)" value={current.image} onChange={v => updateArticle(current.id, { image: v })} type="url" icon="🖼️" />
          <ImageUpload label="Lub wgraj" currentUrl={current.image} onUpload={v => updateArticle(current.id, { image: v })} />
          <Input label="Link" value={current.link} onChange={v => updateArticle(current.id, { link: v })} type="url" icon="🔗" />
          <button onClick={() => update({ currentArticleId: null })}
            className="mt-1 w-full rounded-lg bg-white/5 px-2 py-1 text-[9px] text-gray-400 hover:bg-white/10 hover:text-white transition-colors active:scale-[0.98]">
            ✓ Zamknij edycję
          </button>
        </Section>
      )}
    </div>
  );
}
