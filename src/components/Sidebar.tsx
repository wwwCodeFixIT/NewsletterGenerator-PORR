import { useRef, useState, useCallback, type ReactNode } from 'react';
import type { useNewsletterStore } from '@/hooks/useNewsletterStore';
import type { TabId, FeedbackStyle, NotificationType } from '@/types';

type Store = ReturnType<typeof useNewsletterStore>;

export interface SidebarProps {
  store: Store;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onShowTemplates: () => void;
  onLoadProjectFromFile: (file: File) => void;
  onExportHTML: () => void;
  onExportEML: () => void;
  onExportMHT: () => void;
  onCopyHTML: () => void;
  onCopyForNewOutlook: () => void;
  onCopyAsSignature: () => void;
  onShowCode: () => void;
  onOpenInNewTab: () => void;
  onSaveProjectToFile: () => void;
  onShowOutlookHelp: () => void;
  notify: (msg: string, type?: NotificationType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const tabsList: { id: TabId; label: string; icon: string }[] = [
  { id: 'content', label: 'Treść', icon: '📝' },
  { id: 'articles', label: 'Artykuły', icon: '📰' },
  { id: 'feedback', label: 'Feedback', icon: '💬' },
  { id: 'style', label: 'Styl', icon: '🎨' },
  { id: 'export', label: 'Eksport', icon: '📤' },
];

// ========== Reusable UI Components ==========

function Input({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div className="mb-2">
      <label className="block text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2.5 py-1.5 bg-[#1a1a2e] border border-[#253555] rounded-md text-white text-[12px] focus:border-[#feed01] focus:ring-1 focus:ring-[#feed01]/30 transition-all placeholder:text-gray-600"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div className="mb-2">
      <label className="block text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wider">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-2.5 py-1.5 bg-[#1a1a2e] border border-[#253555] rounded-md text-white text-[12px] resize-y focus:border-[#feed01] focus:ring-1 focus:ring-[#feed01]/30 transition-all min-h-[38px]"
      />
    </div>
  );
}

function ColorInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-2">
      <label className="block text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wider">{label}</label>
      <div className="flex gap-1.5 items-center">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-7 rounded cursor-pointer flex-shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-2.5 py-1.5 bg-[#1a1a2e] border border-[#253555] rounded-md text-white text-[12px] focus:border-[#feed01] focus:ring-1 focus:ring-[#feed01]/30 font-mono"
        />
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0 ${
          checked ? 'bg-[#00d9a5]' : 'bg-[#253555]'
        }`}
      >
        <span className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition-all duration-200 shadow ${
          checked ? 'left-[19px]' : 'left-[3px]'
        }`} />
      </button>
      <span className="text-[12px] text-gray-300 group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

function Section({ title, children, defaultOpen = true }: {
  title: string; children: ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0f3460]/80 rounded-lg mb-2 border-l-[3px] border-[#feed01] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 cursor-pointer select-none hover:bg-white/5 transition-colors"
      >
        <h3 className="text-[#feed01] text-[11px] font-bold tracking-wide">{title}</h3>
        <span className={`text-[#feed01] text-[10px] transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}>▼</span>
      </button>
      <div className={`transition-all duration-200 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-3 pb-3">{children}</div>
      </div>
    </div>
  );
}

function ImageUpload({ onUpload }: { onUpload: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { onUpload(ev.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="mb-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[#253555] rounded-lg p-2 text-center cursor-pointer bg-[#1a1a2e] hover:border-[#feed01] hover:bg-[#feed01]/5 transition-all group"
      >
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        <div className="text-base group-hover:scale-110 transition-transform">🖼️</div>
        <p className="text-[9px] text-gray-500 group-hover:text-gray-400">Kliknij aby wgrać</p>
      </div>
    </div>
  );
}

function Btn({ onClick, children, variant = 'primary', className = '' }: {
  onClick: () => void; children: ReactNode; variant?: 'primary' | 'secondary' | 'success' | 'outlook' | 'outlook-new' | 'add' | 'danger'; className?: string;
}) {
  const base = 'w-full py-2 px-3 rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all mb-1.5 active:scale-[0.98]';
  const variants: Record<string, string> = {
    primary: 'bg-[#feed01] text-[#143e70] hover:shadow-lg hover:shadow-[#feed01]/20 hover:brightness-110',
    secondary: 'bg-[#143e70] text-white border border-[#feed01]/30 hover:bg-[#1a5a90] hover:border-[#feed01]',
    success: 'bg-[#00d9a5] text-white hover:bg-[#00c495]',
    outlook: 'bg-[#0078d4] text-white hover:bg-[#006abc]',
    'outlook-new': 'bg-gradient-to-r from-[#0078d4] to-[#00bcf2] text-white hover:from-[#006abc] hover:to-[#00a8d9]',
    add: 'bg-transparent border-2 border-dashed border-[#feed01]/50 text-[#feed01] hover:bg-[#feed01]/10 hover:border-[#feed01]',
    danger: 'bg-[#e94560] text-white hover:bg-[#d63b55]',
  };
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
}

function Divider() {
  return <div className="h-px bg-[#253555] my-2" />;
}

// ========== Tab Contents ==========

function ContentTab({ store }: { store: Store }) {
  const { state, updateField } = store;
  return (
    <>
      <Section title="📌 NAGŁÓWEK">
        <Input label="Numer wydania" value={state.issueNumber} onChange={v => updateField('issueNumber', v)} />
        <Input label="Preheader" value={state.preheader} onChange={v => updateField('preheader', v)} placeholder="Tekst widoczny w skrzynce..." />
        <Input label="Logo (URL)" value={state.logoUrl} onChange={v => updateField('logoUrl', v)} type="url" />
        <ImageUpload onUpload={v => updateField('logoUrl', v)} />
      </Section>

      <Section title="⭐ ARTYKUŁ GŁÓWNY">
        <Input label="Tytuł" value={state.mainTitle} onChange={v => updateField('mainTitle', v)} />
        <TextArea label="Opis" value={state.mainDescription} onChange={v => updateField('mainDescription', v)} rows={3} />
        <Input label="Obrazek (URL)" value={state.mainImage} onChange={v => updateField('mainImage', v)} type="url" />
        <ImageUpload onUpload={v => updateField('mainImage', v)} />
        <Input label="Link" value={state.mainLink} onChange={v => updateField('mainLink', v)} type="url" />
      </Section>

      <Section title="🎬 WIDEO" defaultOpen={false}>
        <Input label="Miniaturka" value={state.videoThumbnail} onChange={v => updateField('videoThumbnail', v)} type="url" />
        <Input label="Link do wideo" value={state.videoLink} onChange={v => updateField('videoLink', v)} type="url" />
        <Input label="Tytuł" value={state.videoTitle} onChange={v => updateField('videoTitle', v)} />
        <TextArea label="Opis" value={state.videoDescription} onChange={v => updateField('videoDescription', v)} />
        <Input label="Link CTA" value={state.videoReadMore} onChange={v => updateField('videoReadMore', v)} type="url" />
      </Section>

      <Section title="📧 STOPKA" defaultOpen={false}>
        <Input label="Tytuł" value={state.footerTitle} onChange={v => updateField('footerTitle', v)} />
        <TextArea label="Opis lewy" value={state.footerLeft} onChange={v => updateField('footerLeft', v)} />
        <TextArea label="Opis prawy" value={state.footerRight} onChange={v => updateField('footerRight', v)} />
        <Input label="Email kontaktowy" value={state.contactEmail} onChange={v => updateField('contactEmail', v)} />
        <div className="grid grid-cols-2 gap-1.5">
          <Input label="Facebook" value={state.facebookUrl} onChange={v => updateField('facebookUrl', v)} type="url" />
          <Input label="LinkedIn" value={state.linkedinUrl} onChange={v => updateField('linkedinUrl', v)} type="url" />
        </div>
        <Input label="YouTube" value={state.youtubeUrl} onChange={v => updateField('youtubeUrl', v)} type="url" />
      </Section>
    </>
  );
}

function ArticlesTab({ store }: { store: Store }) {
  const { state, addArticle, removeArticle, updateArticle, moveArticle, updateField } = store;

  return (
    <>
      <Section title="📰 LISTA ARTYKUŁÓW">
        <div className="text-[10px] text-gray-500 mb-2">
          {state.articles.length} artykuł{state.articles.length === 1 ? '' : state.articles.length < 5 ? 'y' : 'ów'} • Kliknij aby edytować
        </div>
        <div className="max-h-[280px] overflow-y-auto mb-2 space-y-1 pr-0.5">
          {state.articles.map((a, i) => (
            <div
              key={a.id}
              className={`bg-[#1a1a2e] rounded-lg p-2.5 border-2 transition-all cursor-pointer group ${
                a.id === state.currentArticleId
                  ? 'border-[#feed01] bg-[#feed01]/5'
                  : 'border-transparent hover:border-[#253555]'
              }`}
              onClick={() => updateField('currentArticleId', a.id)}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-5 h-5 rounded bg-[#feed01]/20 text-[#feed01] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[11px] text-white/90 font-medium truncate">{a.title}</span>
                </div>
                <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => { e.stopPropagation(); moveArticle(a.id, -1); }}
                    className="text-gray-500 hover:text-[#feed01] text-[10px] w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
                    title="W górę"
                  >▲</button>
                  <button
                    onClick={e => { e.stopPropagation(); moveArticle(a.id, 1); }}
                    className="text-gray-500 hover:text-[#feed01] text-[10px] w-5 h-5 flex items-center justify-center rounded hover:bg-white/5"
                    title="W dół"
                  >▼</button>
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm('Usunąć ten artykuł?')) removeArticle(a.id); }}
                    className="text-gray-500 hover:text-[#e94560] text-[10px] w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10"
                    title="Usuń"
                  >✕</button>
                </div>
              </div>
              {a.image && a.id === state.currentArticleId && (
                <div className="mt-2 rounded overflow-hidden">
                  <img src={a.image} alt="" className="w-full h-16 object-cover opacity-60" />
                </div>
              )}
            </div>
          ))}
          {state.articles.length === 0 && (
            <div className="text-center py-6 text-gray-500 text-[11px]">
              <div className="text-2xl mb-1">📭</div>
              Brak artykułów. Dodaj pierwszy!
            </div>
          )}
        </div>
        <Btn variant="add" onClick={addArticle}>➕ Dodaj artykuł</Btn>
      </Section>

      {state.currentArticleId !== null && (() => {
        const article = state.articles.find(a => a.id === state.currentArticleId);
        if (!article) return null;
        return (
          <Section title="✏️ EDYCJA ARTYKUŁU">
            <Input label="Tytuł" value={article.title} onChange={v => updateArticle(article.id, { title: v })} />
            <TextArea label="Opis" value={article.description} onChange={v => updateArticle(article.id, { description: v })} />
            <Input label="Obrazek (URL)" value={article.image} onChange={v => updateArticle(article.id, { image: v })} type="url" />
            <ImageUpload onUpload={v => updateArticle(article.id, { image: v })} />
            <Input label="Link" value={article.link} onChange={v => updateArticle(article.id, { link: v })} type="url" />
            {article.image && (
              <div className="rounded-lg overflow-hidden mt-1 border border-[#253555]">
                <img src={article.image} alt="Podgląd" className="w-full h-24 object-cover" />
              </div>
            )}
          </Section>
        );
      })()}
    </>
  );
}

function FeedbackTab({ store }: { store: Store }) {
  const { state, updateField, setFeedbackStyle, addFeedbackOption, removeFeedbackOption, updateFeedbackOption } = store;

  const emojiSets: Record<FeedbackStyle, string[]> = {
    emoji: ['😍', '😊', '🙂', '😐', '😕', '😞', '👍', '👎'],
    stars: ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐', '⭐⭐', '⭐'],
    thumbs: ['👍👍', '👍', '🤷', '👎', '👎👎'],
  };

  return (
    <Section title="💬 SEKCJA FEEDBACK">
      <Toggle checked={state.showFeedback} onChange={v => updateField('showFeedback', v)} label="Pokaż sekcję feedback" />

      {state.showFeedback && (
        <>
          <Divider />
          <Input label="Tytuł" value={state.feedbackTitle} onChange={v => updateField('feedbackTitle', v)} />
          <Input label="Podtytuł" value={state.feedbackSubtitle} onChange={v => updateField('feedbackSubtitle', v)} />

          <Divider />
          <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Styl reakcji</label>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {(['emoji', 'stars', 'thumbs'] as FeedbackStyle[]).map(style => (
              <button
                key={style}
                onClick={() => setFeedbackStyle(style)}
                className={`bg-[#1a1a2e] border-2 rounded-lg p-2.5 text-center transition-all ${
                  state.feedbackStyle === style
                    ? 'border-[#feed01] bg-[#feed01]/5 shadow-md shadow-[#feed01]/10'
                    : 'border-[#253555] hover:border-[#feed01]/50'
                }`}
              >
                <div className="text-lg mb-0.5">{style === 'emoji' ? '😀' : style === 'stars' ? '⭐' : '👍'}</div>
                <span className="text-[9px] text-gray-400 font-medium">
                  {style === 'emoji' ? 'Emoji' : style === 'stars' ? 'Gwiazdki' : 'Kciuki'}
                </span>
              </button>
            ))}
          </div>

          <Divider />
          <label className="block text-[10px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">
            Opcje ({state.feedbackOptions.length}/7)
          </label>
          <div className="space-y-2">
            {state.feedbackOptions.map((o, i) => (
              <div key={o.id} className="bg-[#1a1a2e] rounded-lg p-2.5 border border-[#253555]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#feed01] text-[10px] font-bold">Opcja {i + 1}</span>
                  {state.feedbackOptions.length > 2 && (
                    <button
                      onClick={() => removeFeedbackOption(o.id)}
                      className="text-[9px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                    >✕ Usuń</button>
                  )}
                </div>
                <div className="grid grid-cols-[48px_1fr_1fr] gap-1.5 mb-2">
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-0.5">Ikona</label>
                    <input
                      type="text"
                      value={o.emoji}
                      onChange={e => updateFeedbackOption(o.id, { emoji: e.target.value })}
                      className="w-full px-1 py-1 bg-[#0f3460] border border-[#253555] rounded text-white text-center text-sm focus:border-[#feed01] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-0.5">Etykieta</label>
                    <input
                      type="text"
                      value={o.label}
                      onChange={e => updateFeedbackOption(o.id, { label: e.target.value })}
                      className="w-full px-2 py-1 bg-[#0f3460] border border-[#253555] rounded text-white text-[11px] focus:border-[#feed01] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-500 mb-0.5">Link</label>
                    <input
                      type="url"
                      value={o.link}
                      onChange={e => updateFeedbackOption(o.id, { link: e.target.value })}
                      className="w-full px-2 py-1 bg-[#0f3460] border border-[#253555] rounded text-white text-[11px] focus:border-[#feed01] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {emojiSets[state.feedbackStyle].map(e => (
                    <button
                      key={e}
                      onClick={() => updateFeedbackOption(o.id, { emoji: e })}
                      className={`bg-[#0f3460] border-2 rounded px-1.5 py-0.5 text-sm cursor-pointer transition-all ${
                        o.emoji === e ? 'border-[#feed01] scale-110' : 'border-transparent hover:bg-[#143e70] hover:scale-105'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Btn variant="add" onClick={addFeedbackOption} className="mt-2">➕ Dodaj opcję</Btn>

          <Divider />
          <Input label="Link do ankiety" value={state.feedbackSurveyLink} onChange={v => updateField('feedbackSurveyLink', v)} type="url" placeholder="https://forms.office.com/..." />
          <Input label="Tekst linku" value={state.feedbackSurveyText} onChange={v => updateField('feedbackSurveyText', v)} />
          <ColorInput label="Kolor tła sekcji" value={state.feedbackBgColor} onChange={v => updateField('feedbackBgColor', v)} />
        </>
      )}
    </Section>
  );
}

function StyleTab({ store }: { store: Store }) {
  const { state, updateField } = store;
  return (
    <>
      <Section title="🎨 KOLORY">
        <div className="grid grid-cols-2 gap-x-2">
          <ColorInput label="Główny" value={state.primaryColor} onChange={v => updateField('primaryColor', v)} />
          <ColorInput label="Akcent" value={state.accentColor} onChange={v => updateField('accentColor', v)} />
          <ColorInput label="Tekst przycisków" value={state.buttonTextColor} onChange={v => updateField('buttonTextColor', v)} />
          <ColorInput label="Tekst treści" value={state.textColor} onChange={v => updateField('textColor', v)} />
        </div>
        <ColorInput label="Tło" value={state.bgColor} onChange={v => updateField('bgColor', v)} />

        {/* Color preview */}
        <div className="flex gap-1 mt-2 p-2 bg-[#1a1a2e] rounded-lg">
          {[state.primaryColor, state.accentColor, state.buttonTextColor, state.textColor, state.bgColor].map((c, i) => (
            <div
              key={i}
              className="flex-1 h-6 rounded border border-white/10"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </Section>

      <Section title="📝 CZCIONKA">
        <label className="block text-[10px] text-gray-400 mb-0.5 font-medium uppercase tracking-wider">Rodzina czcionek</label>
        <select
          value={state.fontFamily}
          onChange={e => updateField('fontFamily', e.target.value)}
          className="w-full px-2.5 py-1.5 bg-[#1a1a2e] border border-[#253555] rounded-md text-white text-[12px] focus:border-[#feed01] focus:outline-none cursor-pointer"
        >
          <option value="'trebuchet ms', tahoma, sans-serif">Trebuchet MS</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Segoe UI', sans-serif">Segoe UI</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="'Times New Roman', Times, serif">Times New Roman</option>
        </select>
        <p className="text-[9px] text-gray-600 mt-1">Dla Outlooka najlepiej: Arial, Verdana, Trebuchet MS</p>
      </Section>

      <Section title="⚙️ WIDOCZNOŚĆ SEKCJI">
        <Toggle checked={state.showVideo} onChange={v => updateField('showVideo', v)} label="Sekcja wideo" />
        <Toggle checked={state.showSocial} onChange={v => updateField('showSocial', v)} label="Social media" />
        <Toggle checked={state.showViewOnline} onChange={v => updateField('showViewOnline', v)} label="Link 'Wyświetl online'" />
        <Toggle checked={state.showFeedback} onChange={v => updateField('showFeedback', v)} label="Sekcja feedback" />
      </Section>
    </>
  );
}

function ExportTab(props: {
  store: Store;
  onExportHTML: () => void;
  onExportEML: () => void;
  onExportMHT: () => void;
  onCopyHTML: () => void;
  onCopyForNewOutlook: () => void;
  onCopyAsSignature: () => void;
  onShowCode: () => void;
  onOpenInNewTab: () => void;
  onSaveProjectToFile: () => void;
  onLoadProjectFromFile: (file: File) => void;
  onShowOutlookHelp: () => void;
}) {
  const importRef = useRef<HTMLInputElement>(null);
  void props.store;

  return (
    <>
      {/* Classic Outlook */}
      <div className="border-2 border-[#0078d4] rounded-lg p-3 mb-2 bg-[#0078d4]/5">
        <h4 className="text-white text-[11px] font-bold mb-2 flex items-center gap-2">
          🖥️ Klasyczny Outlook
          <span className="text-[8px] bg-[#0078d4] text-white px-1.5 py-0.5 rounded-full font-normal">2007-2019</span>
        </h4>
        <div className="bg-[#1a1a2e] border-l-[3px] border-[#0078d4] p-2 rounded-r-md mb-2">
          <p className="text-[#feed01] text-[10px] font-bold mb-1">📋 Jak utworzyć szablon .OFT:</p>
          <ol className="text-[9px] text-gray-400 list-decimal ml-3 space-y-0.5">
            <li>Pobierz plik .EML poniżej</li>
            <li>Otwórz go w Outlook Desktop</li>
            <li>Plik → Zapisz jako → Szablon Outlook (.oft)</li>
            <li>Gotowe! Używaj z: Nowy element → Więcej → Formularze</li>
          </ol>
        </div>
        <Btn variant="outlook" onClick={props.onExportEML}>📧 Pobierz .EML</Btn>
        <Btn variant="outlook" onClick={props.onExportMHT}>📄 Pobierz .MHT</Btn>
      </div>

      {/* New Outlook */}
      <div className="border-2 border-[#00bcf2] rounded-lg p-3 mb-2 bg-[#00bcf2]/5">
        <h4 className="text-white text-[11px] font-bold mb-2 flex items-center gap-2">
          ✨ Nowy Outlook
          <span className="text-[8px] bg-gradient-to-r from-[#0078d4] to-[#00bcf2] text-white px-1.5 py-0.5 rounded-full font-normal">Win 11 / Web</span>
        </h4>
        <div className="bg-[#1a1a2e] border-l-[3px] border-yellow-500 p-2 rounded-r-md mb-2">
          <p className="text-yellow-400 text-[10px] font-bold">⚠️ Nowy Outlook nie obsługuje .OFT</p>
          <p className="text-[9px] text-gray-500 mt-0.5">Użyj "Moje szablony" lub podpisu HTML</p>
        </div>
        <Btn variant="outlook-new" onClick={props.onCopyForNewOutlook}>📋 Kopiuj dla "Moje szablony"</Btn>
        <Btn variant="outlook-new" onClick={props.onCopyAsSignature}>✍️ Kopiuj jako podpis</Btn>
        <Btn variant="secondary" onClick={props.onShowOutlookHelp}>❓ Instrukcja krok po kroku</Btn>
      </div>

      {/* Universal exports */}
      <Section title="💻 UNIWERSALNE">
        <Btn variant="success" onClick={props.onExportHTML}>💾 Pobierz plik HTML</Btn>
        <Btn variant="secondary" onClick={props.onCopyHTML}>📋 Kopiuj kod HTML</Btn>
        <Btn variant="secondary" onClick={props.onShowCode}>👁️ Podgląd kodu źródłowego</Btn>
        <Btn variant="secondary" onClick={props.onOpenInNewTab}>🔗 Otwórz w nowej karcie</Btn>
      </Section>

      {/* Project management */}
      <Section title="💾 ZARZĄDZANIE PROJEKTEM">
        <Btn variant="secondary" onClick={props.onSaveProjectToFile}>📦 Eksportuj projekt (.json)</Btn>
        <Btn variant="secondary" onClick={() => importRef.current?.click()}>📂 Importuj projekt</Btn>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) props.onLoadProjectFromFile(f); e.target.value = ''; }}
        />
        <div className="bg-[#1a1a2e] border-l-[3px] border-[#00d9a5] p-2 rounded-r-md mt-2">
          <p className="text-[#00d9a5] text-[10px] font-bold mb-0.5">💡 Wskazówka</p>
          <p className="text-[9px] text-gray-500">Pliki .json pozwalają udostępniać projekty newsletterów między użytkownikami.</p>
        </div>
      </Section>
    </>
  );
}

// ========== Main Sidebar Component ==========

export function Sidebar(props: SidebarProps) {
  const { store, activeTab, onTabChange, onNewProject, onSaveProject, onShowTemplates, onLoadProjectFromFile, isOpen, onClose } = props;
  const loadRef = useRef<HTMLInputElement>(null);

  const recentProjects = store.getRecentProjects();

  const handleLoadRecent = useCallback((projectState: typeof store.state) => {
    store.loadState(projectState);
    props.notify('Projekt wczytany!');
  }, [store, props]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-[320px] lg:w-80 bg-[#16213e] flex flex-col border-r-2 border-[#143e70] flex-shrink-0 min-h-0
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:transform-none
      `}>
        {/* Quick actions bar */}
        <div className="flex-shrink-0 p-2 pb-0">
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {[
              { icon: '📄', label: 'Nowy', action: onNewProject },
              { icon: '📂', label: 'Otwórz', action: () => loadRef.current?.click() },
              { icon: '💾', label: 'Zapisz', action: onSaveProject },
              { icon: '📋', label: 'Szablony', action: onShowTemplates },
            ].map(a => (
              <button
                key={a.label}
                onClick={a.action}
                className="bg-[#0f3460] rounded-lg py-2 px-1 text-gray-400 hover:bg-[#143e70] hover:text-[#feed01] transition-all text-center group active:scale-95"
              >
                <span className="text-base block group-hover:scale-110 transition-transform">{a.icon}</span>
                <span className="text-[8px] font-medium mt-0.5 block">{a.label}</span>
              </button>
            ))}
            <input
              ref={loadRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onLoadProjectFromFile(f); e.target.value = ''; }}
            />
          </div>

          {/* Recent projects - collapsible */}
          {recentProjects.length > 0 && (
            <div className="bg-[#0f3460]/60 rounded-lg p-2 mb-2">
              <h4 className="text-[#feed01] text-[9px] font-bold mb-1 uppercase tracking-wider">📁 Ostatnie projekty</h4>
              <div className="space-y-0.5">
                {recentProjects.slice(0, 3).map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handleLoadRecent(p.state)}
                    className="flex items-center justify-between px-2 py-1 bg-[#1a1a2e] rounded cursor-pointer hover:bg-[#143e70] transition-colors group"
                  >
                    <span className="text-white/80 text-[10px] truncate flex-1 group-hover:text-white">{p.name}</span>
                    <span className="text-gray-600 text-[8px] ml-2 flex-shrink-0">{new Date(p.date).toLocaleDateString('pl')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex bg-[#1a1a2e] rounded-lg overflow-hidden mb-2">
            {tabsList.map(t => (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 py-1.5 text-[9px] text-center transition-all flex flex-col items-center gap-0.5 ${
                  activeTab === t.id
                    ? 'bg-[#143e70] text-[#feed01] font-bold shadow-inner'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <span className="text-xs">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable tab content */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0">
          {activeTab === 'content' && <ContentTab store={store} />}
          {activeTab === 'articles' && <ArticlesTab store={store} />}
          {activeTab === 'feedback' && <FeedbackTab store={store} />}
          {activeTab === 'style' && <StyleTab store={store} />}
          {activeTab === 'export' && (
            <ExportTab
              store={store}
              onExportHTML={props.onExportHTML}
              onExportEML={props.onExportEML}
              onExportMHT={props.onExportMHT}
              onCopyHTML={props.onCopyHTML}
              onCopyForNewOutlook={props.onCopyForNewOutlook}
              onCopyAsSignature={props.onCopyAsSignature}
              onShowCode={props.onShowCode}
              onOpenInNewTab={props.onOpenInNewTab}
              onSaveProjectToFile={props.onSaveProjectToFile}
              onLoadProjectFromFile={props.onLoadProjectFromFile}
              onShowOutlookHelp={props.onShowOutlookHelp}
            />
          )}
        </div>
      </aside>
    </>
  );
}
