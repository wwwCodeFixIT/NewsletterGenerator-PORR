import type { NewsletterState } from '@/types';
import { ColorInput, Select, Toggle, Section } from './FormElements';

interface StyleTabProps {
  state: NewsletterState;
  update: (partial: Partial<NewsletterState>) => void;
}

const fontOptions = [
  { value: "'trebuchet ms', tahoma, sans-serif", label: 'Trebuchet MS' },
  { value: "Arial, sans-serif", label: 'Arial' },
  { value: "'Segoe UI', sans-serif", label: 'Segoe UI' },
  { value: "Verdana, sans-serif", label: 'Verdana' },
  { value: "Georgia, serif", label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
];

const presets = [
  { name: 'PORR', primary: '#143e70', accent: '#feed01', text: '#143e70', bg: '#fafafa', btnText: '#143e70' },
  { name: 'Dark', primary: '#0a1628', accent: '#00d9a5', text: '#333333', bg: '#f5f5f5', btnText: '#ffffff' },
  { name: 'Warm', primary: '#2d3436', accent: '#e17055', text: '#2d3436', bg: '#ffeaa7', btnText: '#ffffff' },
  { name: 'Corp', primary: '#2c3e50', accent: '#3498db', text: '#2c3e50', bg: '#ecf0f1', btnText: '#ffffff' },
  { name: 'Green', primary: '#1a5276', accent: '#27ae60', text: '#1a5276', bg: '#f8f9fa', btnText: '#ffffff' },
  { name: 'Bold', primary: '#2c2c54', accent: '#ff6348', text: '#2c2c54', bg: '#ffffff', btnText: '#ffffff' },
];

export function StyleTab({ state, update }: StyleTabProps) {
  const applyPreset = (p: typeof presets[0]) => {
    update({ primaryColor: p.primary, accentColor: p.accent, textColor: p.text, bgColor: p.bg, buttonTextColor: p.btnText });
  };

  return (
    <div className="animate-fade-in">
      <Section title="Szybkie schematy" icon="🎭" badge="Quick">
        <div className="grid grid-cols-3 gap-1">
          {presets.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)}
              className="group rounded-lg border border-white/[0.05] bg-[#0d1b2a]/50 p-1.5 text-center hover:border-white/15 hover:scale-[1.03] active:scale-95 transition-all">
              <div className="mb-1 flex justify-center gap-0.5">
                <div className="h-2.5 w-2.5 rounded-full border border-white/10" style={{ backgroundColor: p.primary }} />
                <div className="h-2.5 w-2.5 rounded-full border border-white/10" style={{ backgroundColor: p.accent }} />
              </div>
              <span className="text-[7px] font-bold text-gray-500 group-hover:text-gray-300 uppercase tracking-wider">{p.name}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Kolory" icon="🎨" collapsible={false}>
        <ColorInput label="Kolor główny" value={state.primaryColor} onChange={v => update({ primaryColor: v })} />
        <ColorInput label="Kolor akcentu" value={state.accentColor} onChange={v => update({ accentColor: v })} />
        <ColorInput label="Tekst przycisków" value={state.buttonTextColor} onChange={v => update({ buttonTextColor: v })} />
        <ColorInput label="Kolor tekstu" value={state.textColor} onChange={v => update({ textColor: v })} />
        <ColorInput label="Tło newslettera" value={state.bgColor} onChange={v => update({ bgColor: v })} />
      </Section>

      <Section title="Typografia" icon="📝">
        <Select label="Czcionka" value={state.fontFamily} onChange={v => update({ fontFamily: v })} options={fontOptions} />
        <div className="mt-1 rounded-lg border border-white/[0.05] bg-[#0d1b2a]/50 p-2">
          <p className="text-[8px] text-gray-600 mb-0.5">Podgląd:</p>
          <p className="text-[12px] text-white" style={{ fontFamily: state.fontFamily }}>PORR Newsletter — Budujemy przyszłość!</p>
          <p className="text-[9px] text-gray-400 mt-0.5" style={{ fontFamily: state.fontFamily }}>Aąę Bb Cc Dd Zżź 0123456789</p>
        </div>
      </Section>

      <Section title="Widoczność sekcji" icon="👁️" collapsible={false}>
        <div className="space-y-0.5">
          <Toggle label="Sekcja wideo" value={state.showVideo} onChange={v => update({ showVideo: v })} description="Osadzony film YouTube" />
          <Toggle label="Social media" value={state.showSocial} onChange={v => update({ showSocial: v })} description="Facebook, LinkedIn, YouTube" />
          <Toggle label="View online" value={state.showViewOnline} onChange={v => update({ showViewOnline: v })} description="Link na górze maila" />
        </div>
      </Section>

      {/* Color scheme preview */}
      <Section title="Podgląd schematu" icon="👀" defaultCollapsed>
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          <div className="flex items-center justify-between p-2" style={{ backgroundColor: state.primaryColor }}>
            <span className="text-[9px] font-bold" style={{ color: state.accentColor }}>Nagłówek</span>
            <div className="h-2.5 w-5 rounded-sm" style={{ backgroundColor: state.accentColor, opacity: 0.4 }} />
          </div>
          <div className="p-2" style={{ backgroundColor: '#ffffff' }}>
            <div className="mb-1 h-1.5 w-3/4 rounded" style={{ backgroundColor: state.textColor, opacity: 0.5 }} />
            <div className="mb-1 h-1.5 w-1/2 rounded" style={{ backgroundColor: state.textColor, opacity: 0.3 }} />
            <div className="mt-1.5 inline-block rounded px-2 py-0.5" style={{ backgroundColor: state.accentColor }}>
              <span className="text-[7px] font-bold" style={{ color: state.buttonTextColor }}>Przycisk CTA</span>
            </div>
          </div>
          <div className="p-1.5" style={{ backgroundColor: state.primaryColor }}>
            <div className="h-1 w-1/3 rounded" style={{ backgroundColor: '#ffffff', opacity: 0.3 }} />
          </div>
        </div>
      </Section>
    </div>
  );
}
