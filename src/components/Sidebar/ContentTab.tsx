import type { NewsletterState } from '@/types';
import { Input, TextArea, Section } from './FormElements';
import { ImageUpload } from './ImageUpload';

interface ContentTabProps {
  state: NewsletterState;
  update: (partial: Partial<NewsletterState>) => void;
}

export function ContentTab({ state, update }: ContentTabProps) {
  return (
    <div className="animate-fade-in">
      <Section title="Nagłówek" icon="📌" badge="Header">
        <Input label="Numer wydania" value={state.issueNumber} onChange={v => update({ issueNumber: v })} icon="🏷️" />
        <Input label="Preheader (tekst w skrzynce)" value={state.preheader} onChange={v => update({ preheader: v })} placeholder="Podgląd w kliencie email..." icon="👁️" />
        <Input label="Logo (URL)" value={state.logoUrl} onChange={v => update({ logoUrl: v })} type="url" icon="🔗" />
        <ImageUpload label="Lub wgraj logo" currentUrl={state.logoUrl} onUpload={v => update({ logoUrl: v })} />
      </Section>

      <Section title="Artykuł główny" icon="⭐" badge="Hero">
        <Input label="Tytuł" value={state.mainTitle} onChange={v => update({ mainTitle: v })} icon="✏️" />
        <TextArea label="Opis" value={state.mainDescription} onChange={v => update({ mainDescription: v })} rows={2} />
        <Input label="URL obrazka" value={state.mainImage} onChange={v => update({ mainImage: v })} type="url" icon="🖼️" />
        <ImageUpload label="Lub wgraj obrazek" currentUrl={state.mainImage} onUpload={v => update({ mainImage: v })} />
        <Input label="Link CTA" value={state.mainLink} onChange={v => update({ mainLink: v })} type="url" icon="🔗" />
      </Section>

      <Section title="Wideo" icon="🎬" defaultCollapsed>
        <Input label="Miniaturka (URL)" value={state.videoThumbnail} onChange={v => update({ videoThumbnail: v })} type="url" icon="🖼️" />
        <Input label="Link do wideo" value={state.videoLink} onChange={v => update({ videoLink: v })} type="url" icon="▶️" />
        <Input label="Tytuł" value={state.videoTitle} onChange={v => update({ videoTitle: v })} icon="✏️" />
        <TextArea label="Opis" value={state.videoDescription} onChange={v => update({ videoDescription: v })} rows={2} />
        <Input label="Link CTA" value={state.videoReadMore} onChange={v => update({ videoReadMore: v })} type="url" icon="🔗" />
      </Section>

      <Section title="Stopka" icon="📧" defaultCollapsed>
        <Input label="Tytuł" value={state.footerTitle} onChange={v => update({ footerTitle: v })} icon="✏️" />
        <TextArea label="Tekst lewy" value={state.footerLeft} onChange={v => update({ footerLeft: v })} rows={2} />
        <TextArea label="Tekst prawy" value={state.footerRight} onChange={v => update({ footerRight: v })} rows={2} />
        <Input label="Email kontaktowy" value={state.contactEmail} onChange={v => update({ contactEmail: v })} icon="📧" />
        <div className="grid grid-cols-2 gap-1">
          <Input label="Facebook" value={state.facebookUrl} onChange={v => update({ facebookUrl: v })} type="url" />
          <Input label="LinkedIn" value={state.linkedinUrl} onChange={v => update({ linkedinUrl: v })} type="url" />
        </div>
        <Input label="YouTube" value={state.youtubeUrl} onChange={v => update({ youtubeUrl: v })} type="url" />
      </Section>
    </div>
  );
}
