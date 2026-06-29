import type { Article, NewsletterState } from '@/types';

export type AuditSeverity = 'ok' | 'info' | 'warning' | 'error';

export interface AuditIssue {
  severity: AuditSeverity;
  message: string;
  fix?: string;
}

export interface NewsletterAudit {
  status: Exclude<AuditSeverity, 'info'>;
  htmlBytes: number;
  localImageBytes: number;
  estimatedEmlBytes: number;
  totalImages: number;
  localImages: number;
  externalImages: number;
  httpImages: number;
  dataUrlImages: number;
  issues: AuditIssue[];
}

const MB = 1024 * 1024;

function byteSize(value: string): number {
  return new TextEncoder().encode(value || '').length;
}

function dataUrlByteSize(value: string): number {
  if (!value?.startsWith('data:')) return 0;
  const base64 = value.split(',')[1] || '';
  return Math.ceil((base64.replace(/\s+/g, '').length * 3) / 4);
}

function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value || '');
}

function isHttpUrl(value: string): boolean {
  return /^http:\/\//i.test(value || '');
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(value || '');
}

function isEmptyUrl(value: string): boolean {
  const normalized = (value || '').trim();
  return !normalized || normalized === '#';
}

function allImageSources(state: NewsletterState): string[] {
  const sources = [
    state.logoUrl,
    state.mainImage,
    state.showVideo ? state.videoThumbnail : '',
    ...state.articles.map((article) => article.image),
  ].filter(Boolean);

  if (state.showSocial) {
    sources.push(
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png',
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png',
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png'
    );
  }

  return sources;
}

function articleLabel(article: Article, index: number): string {
  return article.title?.trim() || `Artykuł ${index + 1}`;
}

function estimateEmlBytes(htmlBytes: number, localImageBytes: number): number {
  const base64Overhead = 1.38;
  const mimeOverhead = 12 * 1024;
  return Math.round((htmlBytes + localImageBytes) * base64Overhead + mimeOverhead);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
}

export function analyzeNewsletter(state: NewsletterState, html: string): NewsletterAudit {
  const issues: AuditIssue[] = [];
  const images = allImageSources(state);
  const localImages = images.filter(isDataUrl);
  const externalImages = images.filter(isExternalUrl);
  const httpImages = images.filter(isHttpUrl);
  const localImageBytes = localImages.reduce((sum, source) => sum + dataUrlByteSize(source), 0);
  const htmlBytes = byteSize(html);
  const estimatedEmlBytes = estimateEmlBytes(htmlBytes, localImageBytes);

  if (!state.issueNumber?.trim()) {
    issues.push({ severity: 'error', message: 'Brakuje numeru wydania / tematu wiadomości.', fix: 'Uzupełnij pole „Numer wydania”.' });
  }

  if (!state.preheader?.trim()) {
    issues.push({ severity: 'warning', message: 'Brakuje preheadera.', fix: 'Dodaj krótki tekst widoczny w podglądzie skrzynki.' });
  }

  if (!state.logoUrl?.trim()) {
    issues.push({ severity: 'warning', message: 'Brakuje logo.', fix: 'Wgraj lokalne logo albo podaj stabilny URL HTTPS.' });
  }

  if (!state.mainTitle?.trim()) {
    issues.push({ severity: 'error', message: 'Brakuje tytułu artykułu głównego.', fix: 'Uzupełnij tytuł w sekcji artykułu głównego.' });
  }

  if (!state.mainImage?.trim()) {
    issues.push({ severity: 'error', message: 'Brakuje głównego obrazka.', fix: 'Wgraj obrazek główny albo podaj URL HTTPS.' });
  }

  if (isEmptyUrl(state.mainLink)) {
    issues.push({ severity: 'warning', message: 'Link CTA „Czytaj dalej” w artykule głównym jest pusty.', fix: 'Podaj docelowy URL zamiast pustego linku.' });
  }

  if (state.mainLinkEn?.trim()) {
    issues.push({ severity: 'info', message: 'Artykuł główny ma dodatkowy link EN — zostanie pokazany przycisk „Read more”.' });
  }

  state.articles.forEach((article, index) => {
    const label = articleLabel(article, index);

    if (!article.title?.trim()) {
      issues.push({ severity: 'warning', message: `${label}: brakuje tytułu.`, fix: 'Uzupełnij tytuł albo usuń pusty artykuł.' });
    }

    if (!article.image?.trim()) {
      issues.push({ severity: 'warning', message: `${label}: brakuje obrazka.`, fix: 'Wgraj obrazek lub podaj URL HTTPS.' });
    }

    if (isEmptyUrl(article.link)) {
      issues.push({ severity: 'warning', message: `${label}: link „Czytaj dalej” jest pusty.`, fix: 'Podaj docelowy URL.' });
    }

    if (article.linkEn?.trim()) {
      issues.push({ severity: 'info', message: `${label}: ma dodatkowy link EN — zostanie pokazany przycisk „Read more”.` });
    }
  });

  if (state.showVideo && !state.videoThumbnail?.trim()) {
    issues.push({ severity: 'warning', message: 'Sekcja wideo jest włączona, ale brakuje miniatury.', fix: 'Dodaj miniaturę albo wyłącz sekcję wideo.' });
  }

  if (state.showVideo && isEmptyUrl(state.videoLink)) {
    issues.push({ severity: 'warning', message: 'Sekcja wideo ma pusty link.', fix: 'Dodaj URL do wideo.' });
  }

  if (state.showVideo && state.videoReadMoreEn?.trim()) {
    issues.push({ severity: 'info', message: 'Sekcja wideo ma dodatkowy link EN — zostanie pokazany przycisk „Read more”.' });
  }

  if (state.showFeedback) {
    state.feedbackOptions.forEach((option) => {
      if (isEmptyUrl(option.link)) {
        issues.push({ severity: 'warning', message: `Feedback „${option.label || option.emoji}” ma pusty link.`, fix: 'Dodaj URL ankiety/reakcji.' });
      }
    });
  }

  if (externalImages.length > 0) {
    issues.push({
      severity: 'info',
      message: `${externalImages.length} obraz(ów) ładuje się z internetu. Outlook może pokazać pasek pobierania obrazów.`,
      fix: 'To normalne zabezpieczenie Outlooka. Dla draftu możesz wgrywać kluczowe obrazy lokalnie.',
    });
  }

  if (httpImages.length > 0) {
    issues.push({ severity: 'warning', message: `${httpImages.length} obraz(ów) używa HTTP zamiast HTTPS.`, fix: 'Zmień linki obrazów na HTTPS.' });
  }

  if (state.showSocial) {
    issues.push({ severity: 'info', message: 'Ikony social media są obrazami zewnętrznymi.', fix: 'Outlook może je zablokować do czasu kliknięcia „Pobierz obrazy”.' });
  }

  if (localImageBytes > 8 * MB) {
    issues.push({ severity: 'error', message: `Lokalne obrazy ważą około ${formatBytes(localImageBytes)}.`, fix: 'Skompresuj zdjęcia albo użyj mniejszej liczby grafik.' });
  } else if (localImageBytes > 4 * MB) {
    issues.push({ severity: 'warning', message: `Lokalne obrazy ważą około ${formatBytes(localImageBytes)}.`, fix: 'Warto skompresować zdjęcia przed eksportem do Outlooka.' });
  }

  if (estimatedEmlBytes > 12 * MB) {
    issues.push({ severity: 'error', message: `Szacowana waga EML to ${formatBytes(estimatedEmlBytes)}.`, fix: 'Zmniejsz obrazy lub liczbę sekcji przed eksportem.' });
  } else if (estimatedEmlBytes > 7 * MB) {
    issues.push({ severity: 'warning', message: `Szacowana waga EML to ${formatBytes(estimatedEmlBytes)}.`, fix: 'Przetestuj wysyłkę na sobie przed wysłaniem do grupy.' });
  }

  if (state.articles.length > 8) {
    issues.push({ severity: 'warning', message: 'Newsletter ma dużo artykułów.', fix: 'Rozważ skrócenie wydania, żeby poprawić czytelność i wagę wiadomości.' });
  }

  if (issues.length === 0) {
    issues.push({ severity: 'ok', message: 'Newsletter wygląda poprawnie do eksportu.', fix: 'Możesz wykonać testowy eksport.' });
  }

  const hasErrors = issues.some((issue) => issue.severity === 'error');
  const hasWarnings = issues.some((issue) => issue.severity === 'warning');

  return {
    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok',
    htmlBytes,
    localImageBytes,
    estimatedEmlBytes,
    totalImages: images.length,
    localImages: localImages.length,
    externalImages: externalImages.length,
    httpImages: httpImages.length,
    dataUrlImages: localImages.length,
    issues,
  };
}
