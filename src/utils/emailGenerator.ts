import type { NewsletterState } from '@/types';

type OutlookIssueSeverity = 'ok' | 'warning' | 'error';

export interface OutlookCompatIssue {
  severity: OutlookIssueSeverity;
  message: string;
}

function esc(t: string): string {
  if (!t) return '';
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHref(href: string): string {
  const value = (href || '').trim();
  return value || '#';
}

function safeColor(color: string, fallback: string): string {
  return /^#[0-9a-f]{3,8}$/i.test(color || '') ? color : fallback;
}

function vmlButton(
  href: string,
  text: string,
  bgColor: string,
  textColor: string,
  fontFamily: string,
  width: number = 150,
  height: number = 40
): string {
  const url = safeHref(href);

  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(url)}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="13%" strokecolor="${bgColor}" fillcolor="${bgColor}">
  <w:anchorlock/>
  <center style="color:${textColor};font-family:${fontFamily};font-size:14px;font-weight:bold;">
    ${esc(text)}
  </center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${esc(url)}" style="display:inline-block;padding:12px 25px;background-color:${bgColor};color:${textColor};font-family:${fontFamily};font-size:14px;font-weight:bold;line-height:16px;text-decoration:none;border-radius:5px;mso-hide:all;">
  ${esc(text)}
</a>
<!--<![endif]-->`;
}

function dataUrlByteSize(value: string): number {
  if (!value?.startsWith('data:')) return 0;
  const base64 = value.split(',')[1] || '';
  return Math.ceil((base64.length * 3) / 4);
}

function allImageSources(s: NewsletterState): string[] {
  const sources = [
    s.logoUrl,
    s.mainImage,
    s.videoThumbnail,
    ...s.articles.map((article) => article.image),
  ].filter(Boolean);

  if (s.showSocial) {
    sources.push(
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png',
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png',
      'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png'
    );
  }

  return sources;
}

function isExternalImage(src: string): boolean {
  return /^https?:\/\//i.test(src || '');
}

// ===== WCAG: kontrast kolorów =====

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = (hex || '').replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number | null {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return null;
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastIssue(label: string, fg: string, bg: string): OutlookCompatIssue {
  const ratio = contrastRatio(fg, bg);
  if (ratio === null) {
    return { severity: 'warning', message: `${label}: nie można sprawdzić kontrastu (nieprawidłowy format koloru).` };
  }
  const rounded = ratio.toFixed(1);
  if (ratio >= 4.5) {
    return { severity: 'ok', message: `${label}: kontrast ${rounded}:1 — zgodne z WCAG AA.` };
  }
  if (ratio >= 3) {
    return { severity: 'warning', message: `${label}: kontrast ${rounded}:1 — czytelne, ale poniżej zalecanych 4.5:1.` };
  }
  return { severity: 'error', message: `${label}: kontrast ${rounded}:1 — prawdopodobnie nieczytelne, popraw kolory.` };
}

// ===== Dobre praktyki: temat, preheader, dostępność kolorów =====

export function checkContentQuality(s: NewsletterState): OutlookCompatIssue[] {
  const issues: OutlookCompatIssue[] = [];

  issues.push(contrastIssue('Tekst treści na tle', s.textColor, s.bgColor));
  issues.push(contrastIssue('Tekst na przycisku', s.buttonTextColor, s.accentColor));
  issues.push(contrastIssue('Numer wydania w nagłówku', s.accentColor, s.primaryColor));
  issues.push(contrastIssue('Tekst stopki (biały) na tle stopki', '#ffffff', s.primaryColor));

  const subjectLen = (s.issueNumber || '').trim().length;
  if (subjectLen === 0) {
    issues.push({ severity: 'error', message: 'Temat (numer wydania) jest pusty.' });
  } else if (subjectLen > 60) {
    issues.push({ severity: 'warning', message: `Temat ma ${subjectLen} znaków — w wielu skrzynkach zostanie obcięty już po ok. 50–60 znakach.` });
  } else {
    issues.push({ severity: 'ok', message: `Temat: ${subjectLen} znaków — bezpieczna długość.` });
  }

  const preheaderLen = (s.preheader || '').trim().length;
  if (preheaderLen === 0) {
    issues.push({ severity: 'warning', message: 'Brak preheadera — klient pocztowy pokaże przypadkowy fragment treści maila.' });
  } else if (preheaderLen > 150) {
    issues.push({ severity: 'warning', message: `Preheader ma ${preheaderLen} znaków — warto skrócić do ok. 100–130.` });
  } else if (preheaderLen < 40) {
    issues.push({ severity: 'warning', message: `Preheader ma ${preheaderLen} znaków — można rozwinąć do ok. 60–130 dla lepszego efektu w skrzynce.` });
  } else {
    issues.push({ severity: 'ok', message: `Preheader: ${preheaderLen} znaków — dobra długość.` });
  }

  return issues;
}

export function checkOutlookCompat(s: NewsletterState): OutlookCompatIssue[] {
  const issues: OutlookCompatIssue[] = [];
  const images = allImageSources(s);
  const localImages = images.filter((src) => src.startsWith('data:'));
  const localImagesSize = localImages.reduce((sum, src) => sum + dataUrlByteSize(src), 0);
  const externalImages = images.filter(isExternalImage);

  if (!s.issueNumber?.trim()) {
    issues.push({ severity: 'warning', message: 'Brakuje numeru wydania / tematu wiadomości.' });
  }

  if (!s.mainImage?.trim()) {
    issues.push({ severity: 'warning', message: 'Brakuje głównego obrazka newslettera.' });
  }

  if (s.showViewOnline && !s.viewOnlineUrl?.trim()) {
    issues.push({ severity: 'warning', message: 'Sekcja „Wyświetl online” jest włączona, ale link jest pusty — prowadzi do nikąd. Wpisz adres albo wyłącz sekcję.' });
  }

  if (externalImages.length > 0) {
    issues.push({
      severity: 'warning',
      message: `Wykryto ${externalImages.length} obraz(ów) zewnętrznych. Outlook może pokazać pasek „Kliknij, aby pobrać obrazy”. Użyj eksportu Outlook Safe albo wgraj obrazy lokalnie.`,
    });
  }

  if (s.showSocial) {
    issues.push({
      severity: 'warning',
      message: 'Ikony social media są zewnętrzne. W trybie Outlook Safe zostaną pominięte, żeby ograniczyć blokadę pobierania obrazów.',
    });
  }

  if (localImages.length > 0) {
    issues.push({
      severity: localImagesSize > 8 * 1024 * 1024 ? 'error' : 'ok',
      message: `Wykryto ${localImages.length} lokalnie wgrany/e obraz(y). Eksport .EML osadzi je jako CID inline attachments.`,
    });
  }

  if (s.articles.length > 8) {
    issues.push({ severity: 'warning', message: 'Duża liczba artykułów może zwiększyć wagę i wysokość wiadomości.' });
  }

  if (images.some((src) => src.startsWith('http://'))) {
    issues.push({ severity: 'warning', message: 'Część obrazów używa HTTP. Lepiej stosować HTTPS albo wgrać obrazy lokalnie.' });
  }

  if (issues.length === 0) {
    issues.push({ severity: 'ok', message: 'Newsletter ma poprawną strukturę pod Outlooka.' });
  }

  return issues;
}

export function generateEmailHTML(s: NewsletterState): string {
  const ff = s.fontFamily || "Arial, sans-serif";
  const pc = safeColor(s.primaryColor, '#143e70');
  const ac = safeColor(s.accentColor, '#feed01');
  const btc = safeColor(s.buttonTextColor, '#143e70');
  const tc = safeColor(s.textColor, '#143e70');
  const bg = safeColor(s.bgColor, '#fafafa');
  const fbg = safeColor(s.feedbackBgColor, '#f0f4f8');

  const preheaderHTML = s.preheader
    ? `<div style="display:none;font-size:1px;color:${bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(s.preheader)}${'&zwnj;&nbsp;'.repeat(20)}</div>`
    : '';

  const viewOnlineHTML = s.showViewOnline
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;">
        <tr>
          <td align="center" style="padding:15px 20px;">
            <a href="${esc(safeHref(s.viewOnlineUrl))}" style="font-family:${ff};font-size:12px;line-height:16px;color:#999999;text-decoration:underline;">Wyświetl online</a>
          </td>
        </tr>
      </table>`
    : '';

  // Header + hero image in one nested 560px table. This prevents Outlook/browser gaps
  // between the navy header block and the main image.
  const heroHTML = `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td align="center" style="padding:20px 20px 0 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;max-width:560px;border-collapse:collapse;" class="responsive">
        <tr>
          <td bgcolor="${pc}" style="background-color:${pc};padding:0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;max-width:560px;border-collapse:collapse;" class="responsive">
              <tr>
                <td width="380" style="padding:22px 15px 22px 25px;vertical-align:middle;font-family:${ff};font-size:22px;color:${ac};font-weight:bold;line-height:28px;mso-line-height-rule:exactly;">
                  ${esc(s.issueNumber)}
                </td>
                <td width="180" align="right" style="padding:22px 25px 22px 15px;vertical-align:middle;font-size:0;line-height:0;">
                  <img src="${esc(s.logoUrl)}" width="80" border="0" alt="PORR" style="display:block;width:80px;max-width:80px;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0;margin:0;font-size:0;line-height:0;mso-line-height-rule:exactly;">
            <img src="${esc(s.mainImage)}" width="560" border="0" alt="${esc(s.mainTitle)}" class="fluid-img" style="display:block;width:560px;max-width:560px;height:auto;margin:0;padding:0;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;vertical-align:top;">
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:25px 20px 10px 20px;">
      <h2 style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:20px;font-weight:bold;color:${tc};line-height:26px;mso-line-height-rule:exactly;">
        ${esc(s.mainTitle)}
      </h2>
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:${tc};line-height:22px;mso-line-height-rule:exactly;">
        ${esc(s.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 20px 25px 20px;">
      ${vmlButton(s.mainLink, 'Czytaj więcej', ac, btc, ff)}
    </td>
  </tr>
</table>`;

  const articlesHTML = s.articles.map((a) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding:10px 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="border-top:1px solid #e8e8e8;font-size:1px;line-height:1px;" height="1">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 20px 20px 20px;">
      <!--[if mso]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="270" valign="top">
      <![endif]-->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="270" align="left" class="stack-col" style="display:inline-block;vertical-align:top;width:270px;max-width:270px;">
        <tr>
          <td style="padding:0 10px 0 0;">
            <a href="${esc(safeHref(a.link))}">
              <img src="${esc(a.image)}" width="270" border="0" alt="${esc(a.title)}" class="fluid-img" style="display:block;border:0;outline:none;width:270px;max-width:270px;height:auto;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </td>
        <td width="20" style="font-size:1px;line-height:1px;">&nbsp;</td>
        <td width="270" valign="top">
      <![endif]-->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="270" align="right" class="stack-col" style="display:inline-block;vertical-align:top;width:270px;max-width:270px;">
        <tr>
          <td style="padding-top:5px;">
            <h3 style="margin:0;padding:0 0 10px 0;font-family:${ff};font-size:18px;font-weight:bold;color:${tc};line-height:24px;mso-line-height-rule:exactly;">
              ${esc(a.title)}
            </h3>
            <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;mso-line-height-rule:exactly;">
              ${esc(a.description)}
            </p>
            ${vmlButton(a.link, 'Czytaj więcej', ac, btc, ff, 130, 36)}
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </td>
      </tr></table>
      <![endif]-->
    </td>
  </tr>
</table>`).join('\n');

  const videoHTML = s.showVideo ? `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding:10px 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="border-top:2px solid ${ac};font-size:1px;line-height:1px;" height="1">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:15px 20px 10px 20px;font-size:0;line-height:0;">
      <a href="${esc(safeHref(s.videoLink))}">
        <img src="${esc(s.videoThumbnail)}" width="560" border="0" alt="${esc(s.videoTitle)}" class="fluid-img" style="display:block;border:0;outline:none;width:560px;max-width:560px;height:auto;-ms-interpolation-mode:bicubic;">
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding:15px 20px 30px 20px;">
      <h3 style="margin:0;padding:0 0 10px 0;font-family:${ff};font-size:18px;font-weight:bold;color:${tc};line-height:24px;mso-line-height-rule:exactly;">
        🎬 ${esc(s.videoTitle)}
      </h3>
      <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;mso-line-height-rule:exactly;">
        ${esc(s.videoDescription)}
      </p>
      ${vmlButton(s.videoReadMore, 'Czytaj więcej', ac, btc, ff)}
    </td>
  </tr>
</table>` : '';

  const feedbackHTML = s.showFeedback ? `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;" class="responsive" bgcolor="${fbg}">
        <tr>
          <td align="center" style="padding:35px 20px 10px 20px;">
            <h2 style="margin:0;padding:0;font-family:${ff};font-size:22px;font-weight:bold;color:${pc};line-height:28px;mso-line-height-rule:exactly;">
              ${esc(s.feedbackTitle)}
            </h2>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:5px 20px 25px 20px;">
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;mso-line-height-rule:exactly;">
              ${esc(s.feedbackSubtitle)}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0 10px 25px 10px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
                ${s.feedbackOptions.map((o) => `
                <td align="center" style="padding:10px 12px;">
                  <a href="${esc(safeHref(o.link))}" style="text-decoration:none;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="font-size:32px;line-height:36px;padding-bottom:8px;">
                          ${o.emoji}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-family:${ff};font-size:12px;color:${tc};line-height:16px;">
                          ${esc(o.label)}
                        </td>
                      </tr>
                    </table>
                  </a>
                </td>`).join('')}
              </tr>
            </table>
          </td>
        </tr>
        ${s.feedbackSurveyLink ? `
        <tr>
          <td align="center" style="padding:5px 20px 20px 20px;">
            <a href="${esc(s.feedbackSurveyLink)}" style="font-family:${ff};font-size:14px;color:${pc};text-decoration:underline;">
              ${esc(s.feedbackSurveyText)}
            </a>
          </td>
        </tr>` : ''}
        <tr>
          <td style="height:35px;font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  const footerHTML = `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;" class="responsive" bgcolor="${pc}">
  <tr>
    <td style="padding:25px 25px 5px 25px;" bgcolor="${pc}">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:18px;font-weight:bold;color:#ffffff;line-height:24px;mso-line-height-rule:exactly;">
        ${esc(s.footerTitle)}
      </h3>
    </td>
  </tr>
  <tr>
    <td style="padding:15px 25px;" bgcolor="${pc}">
      <!--[if mso]>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="255" valign="top">
      <![endif]-->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="255" align="left" class="stack-col" style="display:inline-block;vertical-align:top;width:255px;max-width:255px;">
        <tr>
          <td>
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff;line-height:22px;mso-line-height-rule:exactly;">
              ${esc(s.footerLeft)}
            </p>
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </td>
        <td width="40" style="font-size:1px;line-height:1px;">&nbsp;</td>
        <td width="255" valign="top">
      <![endif]-->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="255" align="right" class="stack-col" style="display:inline-block;vertical-align:top;width:255px;max-width:255px;">
        <tr>
          <td>
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff;line-height:22px;mso-line-height-rule:exactly;">
              ${esc(s.footerRight)}
            </p>
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </td>
      </tr></table>
      <![endif]-->
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:20px 25px 30px 25px;" bgcolor="${pc}">
      ${vmlButton(`mailto:${s.contactEmail}`, 'Napisz do nas ✉️', ac, btc, ff, 200, 44)}
    </td>
  </tr>
</table>`;

  const socialHTML = s.showSocial ? `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding:25px 0;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 15px;">
            <a href="${esc(safeHref(s.facebookUrl))}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png" alt="Facebook" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
          <td style="padding:0 15px;">
            <a href="${esc(safeHref(s.linkedinUrl))}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png" alt="LinkedIn" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
          <td style="padding:0 15px;">
            <a href="${esc(safeHref(s.youtubeUrl))}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png" alt="YouTube" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  const unsubHTML = `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding:15px 20px 25px 20px;">
      <p style="margin:0;padding:0;font-size:11px;color:#bbbbbb;font-family:${ff};line-height:16px;mso-line-height-rule:exactly;">
        No longer want these emails? <a href="#" style="color:#bbbbbb;text-decoration:underline;">Unsubscribe</a>
        <br>© ${new Date().getFullYear()} PORR S.A. Wszelkie prawa zastrzeżone.
      </p>
    </td>
  </tr>
</table>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pl">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
<meta name="x-apple-disable-message-reformatting" />
<title>${esc(s.issueNumber)}</title>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<style type="text/css">
  table {border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
  img {border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
  a {text-decoration:none;}
</style>
<![endif]-->
<style type="text/css">
body, #bodyTable { margin:0 !important; padding:0 !important; width:100% !important; height:100% !important; }
body { background-color:${bg}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
a { text-decoration:none; }
@media only screen and (max-width:620px) {
  table.responsive { width:100% !important; max-width:100% !important; }
  table.stack-col { display:block !important; width:100% !important; max-width:100% !important; }
  img.fluid-img { width:100% !important; max-width:100% !important; height:auto !important; }
  td.hide-mobile { display:none !important; width:0 !important; height:0 !important; overflow:hidden !important; }
}
@media (prefers-color-scheme: dark) {
  body, #bodyTable { background-color:${bg} !important; }
}
</style>
</head>
<body style="margin:0;padding:0;background-color:${bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preheaderHTML}
<!--[if mso]>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}"><tr><td align="center">
<![endif]-->
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" id="bodyTable" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding:0;">
      ${viewOnlineHTML}
      ${heroHTML}
      ${articlesHTML}
      ${videoHTML}
    </td>
  </tr>
</table>
${feedbackHTML}
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center">
      ${footerHTML}
    </td>
  </tr>
</table>
${socialHTML}
${unsubHTML}
<!--[if mso]>
</td></tr></table>
<![endif]-->
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, type: string, addBom = false) {
  const blob = new Blob([addBom ? '\uFEFF' + content : content], { type });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateMHT(html: string, subject = 'Newsletter'): string {
  const boundary = `----=_NextPart_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return [
    'From: <PORR Newsletter Generator>',
    `Subject: ${subject.replace(/[\r\n]/g, ' ')}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/related; boundary="${boundary}"; type="text/html"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: 8bit',
    'Content-Location: file:///newsletter.html',
    '',
    html,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}
