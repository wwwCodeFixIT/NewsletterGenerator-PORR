import type { Article, NewsletterState } from '@/types';

function esc(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHref(value: string | undefined): string {
  const normalized = (value || '').trim();
  return normalized || '#';
}

function safeColor(value: string | undefined, fallback: string): string {
  return /^#[0-9a-f]{3,8}$/i.test(value || '') ? value as string : fallback;
}

function normalizeFooterButtonHref(rawHref: string | undefined, contactEmail: string | undefined): string {
  const value = (rawHref || '').trim();
  if (value) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
    return value;
  }

  const email = (contactEmail || '').trim();
  return email ? `mailto:${email}` : '#';
}

function footerButtonText(value: string | undefined): string {
  return (value || '').trim() || 'Napisz do nas ✉️';
}

function isUsableUrl(value: string | undefined): boolean {
  const normalized = (value || '').trim();
  return Boolean(normalized && normalized !== '#');
}

function isImageDataUrl(value: string | undefined): boolean {
  return /^data:image\//i.test(value || '');
}

function isHttpImage(value: string | undefined): boolean {
  return /^https?:\/\//i.test(value || '');
}

function imageSource(value: string | undefined): string {
  const normalized = (value || '').trim();
  if (isHttpImage(normalized) || isImageDataUrl(normalized)) return normalized;
  return '';
}

function pasteButton(
  href: string | undefined,
  text: string,
  bgColor: string,
  textColor: string,
  fontFamily: string,
  minWidth = 132
): string {
  // New Outlook lepiej radzi sobie z prostym <a> niż z buttonem złożonym z tabel
  // i wymuszonej wysokości. Unikamy line-height: 40px, bo potrafi zrobić duże bloki po wklejeniu.
  return `<a href="${esc(safeHref(href))}" target="_blank" style="display:inline-block;min-width:${minWidth}px;background-color:${bgColor};border:1px solid ${bgColor};border-radius:4px;padding:10px 16px;font-family:${fontFamily};font-size:13px;line-height:16px;font-weight:bold;color:${textColor};text-align:center;text-decoration:none;white-space:nowrap;">
  ${esc(text)}
</a>`;
}

function dualButtons(
  plHref: string | undefined,
  enHref: string | undefined,
  bgColor: string,
  textColor: string,
  fontFamily: string
): string {
  if (!isUsableUrl(enHref)) {
    return pasteButton(plHref, 'Czytaj dalej', bgColor, textColor, fontFamily, 132);
  }

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td align="left" valign="top" style="padding:0 8px 0 0;">
      ${pasteButton(plHref, 'Czytaj dalej', bgColor, textColor, fontFamily, 126)}
    </td>
    <td align="left" valign="top" style="padding:0;">
      ${pasteButton(enHref, 'Read more', bgColor, textColor, fontFamily, 126)}
    </td>
  </tr>
</table>`;
}

function heading(
  plTitle: string | undefined,
  enTitle: string | undefined,
  fontFamily: string,
  color: string,
  tag: 'h2' | 'h3',
  plSize: number,
  plLine: number,
  enSize: number,
  enLine: number,
  bottom = 12,
  prefix = ''
): string {
  const cleanEn = (enTitle || '').trim();
  const cleanPl = `${prefix}${plTitle || ''}`;

  return `<${tag} style="margin:0;padding:0 0 ${cleanEn ? 4 : bottom}px 0;font-family:${fontFamily};font-size:${plSize}px;line-height:${plLine}px;font-weight:bold;color:${color};">
    ${esc(cleanPl)}
  </${tag}>${cleanEn ? `
  <p style="margin:0;padding:0 0 ${bottom}px 0;font-family:${fontFamily};font-size:${enSize}px;line-height:${enLine}px;font-weight:bold;color:${color};">
    ${esc(cleanEn)}
  </p>` : ''}`;
}

function imageBlock(
  src: string | undefined,
  alt: string | undefined,
  width: number,
  heightFallback = 150,
  bgColor = '#eef2f7',
  textColor = '#64748b'
): string {
  const safeSrc = imageSource(src);

  if (!safeSrc) {
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}" style="width:${width}px;border-collapse:collapse;background-color:${bgColor};">
  <tr>
    <td align="center" valign="middle" height="${heightFallback}" style="height:${heightFallback}px;padding:12px;font-family:Arial, sans-serif;font-size:12px;line-height:18px;color:${textColor};background-color:${bgColor};border:1px solid #d9e2ec;">
      Obraz niedostępny po wklejeniu. Użyj linku HTTPS albo eksportu .EML.
    </td>
  </tr>
</table>`;
  }

  return `<img src="${esc(safeSrc)}" width="${width}" border="0" alt="${esc(alt)}" style="display:block;width:${width}px;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;">`;
}

function articleRow(article: Article, index: number, colors: { ff: string; pc: string; ac: string; btc: string; tc: string }): string {
  const alt = article.title || article.titleEn || `Artykuł ${index + 1}`;

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="#ffffff" style="width:600px;max-width:600px;border-collapse:collapse;background-color:#ffffff;">
  <tr>
    <td style="padding:0 20px;background-color:#ffffff;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;border-collapse:collapse;background-color:#ffffff;border-top:1px solid #d7dde8;">
        <tr>
          <td style="height:18px;font-size:1px;line-height:1px;">&nbsp;</td>
        </tr>
        <tr>
          <td width="260" valign="top" style="width:260px;padding:0 20px 20px 0;background-color:#ffffff;">
            <a href="${esc(safeHref(article.link))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(article.image, alt, 260, 160)}
            </a>
          </td>
          <td width="280" valign="top" style="width:280px;padding:0 0 20px 0;background-color:#ffffff;">
            ${heading(article.title, article.titleEn, colors.ff, colors.tc, 'h3', 17, 22, 14, 19, 10)}
            <p style="margin:0;padding:0 0 14px 0;font-family:${colors.ff};font-size:14px;line-height:20px;color:${colors.tc};">
              ${esc(article.description)}
            </p>
            ${dualButtons(article.link, article.linkEn, colors.ac, colors.btc, colors.ff)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function getNewOutlookPasteWarnings(state: NewsletterState): string[] {
  const imageSources = [
    state.logoUrl,
    state.mainImage,
    state.showVideo ? state.videoThumbnail : '',
    ...state.articles.map((article) => article.image),
  ].filter(Boolean);

  const dataImages = imageSources.filter(isImageDataUrl).length;
  const missingImages = imageSources.filter((src) => src && !isImageDataUrl(src) && !isHttpImage(src)).length;
  const httpImages = imageSources.filter((src) => /^http:\/\//i.test(src)).length;
  const warnings: string[] = [];

  if (dataImages > 0) {
    warnings.push(`${dataImages} lokalny/e obraz(y) zostaną wklejone jako data:image. Nowy Outlook może je wyciąć — najstabilniej użyć URL HTTPS.`);
  }

  if (missingImages > 0) {
    warnings.push(`${missingImages} obraz(ów) nie ma URL HTTPS/data:image i zostanie zastąpione placeholderem.`);
  }

  if (httpImages > 0) {
    warnings.push(`${httpImages} obraz(ów) używa HTTP. Zamień na HTTPS przed wysyłką.`);
  }

  return warnings;
}

export function generateNewOutlookPasteHTML(state: NewsletterState): string {
  const ff = state.fontFamily || 'Arial, sans-serif';
  const pc = safeColor(state.primaryColor, '#143e70');
  const ac = safeColor(state.accentColor, '#feed01');
  const btc = safeColor(state.buttonTextColor, '#143e70');
  const tc = safeColor(state.textColor, '#143e70');
  const pageBg = '#f3f5f8';
  const fbg = safeColor(state.feedbackBgColor, '#f0f4f8');
  const colors = { ff, pc, ac, btc, tc };

  const viewOnline = state.showViewOnline ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${pageBg};">
  <tr>
    <td align="center" style="padding:12px 20px;font-family:${ff};font-size:12px;line-height:16px;color:#6b7280;background-color:${pageBg};">
      <a href="#" style="color:#6b7280;text-decoration:underline;">Wyświetl online</a>
    </td>
  </tr>
</table>` : '';

  const hero = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="#ffffff" style="width:600px;max-width:600px;border-collapse:collapse;background-color:#ffffff;">
  <tr>
    <td align="center" style="padding:22px 20px 0 20px;background-color:#ffffff;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;max-width:560px;border-collapse:collapse;background-color:#ffffff;">
        <tr>
          <td bgcolor="${pc}" style="background-color:${pc};padding:0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;max-width:560px;border-collapse:collapse;">
              <tr>
                <td width="390" valign="middle" style="width:390px;padding:22px 15px 22px 24px;font-family:${ff};font-size:22px;line-height:28px;font-weight:bold;color:${ac};">
                  ${esc(state.issueNumber)}
                </td>
                <td width="170" align="right" valign="middle" style="width:170px;padding:22px 24px 22px 15px;">
                  ${imageBlock(state.logoUrl, 'PORR', 80, 40, pc, ac)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-size:0;line-height:0;background-color:#ffffff;">
            ${imageBlock(state.mainImage, state.mainTitle, 560, 280)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 40px 8px 40px;background-color:#ffffff;">
      ${heading(state.mainTitle, state.mainTitleEn, ff, tc, 'h2', 21, 27, 16, 22, 15)}
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;line-height:22px;color:${tc};">
        ${esc(state.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 40px 28px 40px;background-color:#ffffff;">
      ${dualButtons(state.mainLink, state.mainLinkEn, ac, btc, ff)}
    </td>
  </tr>
</table>`;

  const articles = state.articles.map((article, index) => articleRow(article, index, colors)).join('');

  const video = state.showVideo ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="#ffffff" style="width:600px;max-width:600px;border-collapse:collapse;background-color:#ffffff;">
  <tr>
    <td style="padding:14px 20px 10px 20px;background-color:#ffffff;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;border-collapse:collapse;border-top:2px solid ${ac};">
        <tr>
          <td style="padding:18px 0 0 0;background-color:#ffffff;">
            <a href="${esc(safeHref(state.videoLink))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(state.videoThumbnail, state.videoTitle, 560, 260)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 40px 30px 40px;background-color:#ffffff;">
      ${heading(state.videoTitle, state.videoTitleEn, ff, tc, 'h3', 18, 24, 15, 21, 10, '🎬 ')}
      <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;line-height:20px;color:${tc};">
        ${esc(state.videoDescription)}
      </p>
      ${dualButtons(state.videoReadMore || state.videoLink, state.videoReadMoreEn, ac, btc, ff)}
    </td>
  </tr>
</table>` : '';

  const feedback = state.showFeedback ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${fbg}" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${fbg};">
  <tr>
    <td align="center" style="padding:30px 40px 8px 40px;background-color:${fbg};">
      <h2 style="margin:0;padding:0;font-family:${ff};font-size:22px;line-height:28px;font-weight:bold;color:${pc};">${esc(state.feedbackTitle)}</h2>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:5px 40px 20px 40px;background-color:${fbg};">
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;line-height:20px;color:${tc};">${esc(state.feedbackSubtitle)}</p>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 20px 28px 20px;background-color:${fbg};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;">
        <tr>
          ${state.feedbackOptions.map((option) => `<td align="center" style="padding:8px 12px;">
            <a href="${esc(safeHref(option.link))}" target="_blank" style="text-decoration:none;color:${tc};">
              <span style="display:block;font-size:28px;line-height:32px;">${esc(option.emoji)}</span>
              <span style="display:block;font-family:${ff};font-size:12px;line-height:16px;color:${tc};">${esc(option.label)}</span>
            </a>
          </td>`).join('')}
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  const footer = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${pc}" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${pc};">
  <tr>
    <td style="padding:26px 40px 10px 40px;background-color:${pc};">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:18px;line-height:24px;font-weight:bold;color:#ffffff;">${esc(state.footerTitle)}</h3>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 40px 20px 40px;background-color:${pc};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="520" align="center" style="width:520px;border-collapse:collapse;">
        <tr>
          <td width="250" valign="top" style="width:250px;padding:0 20px 0 0;font-family:${ff};font-size:14px;line-height:22px;color:#ffffff;">
            ${esc(state.footerLeft).replace(/\n/g, '<br>')}
          </td>
          <td width="250" valign="top" style="width:250px;padding:0;font-family:${ff};font-size:14px;line-height:22px;color:#ffffff;">
            ${esc(state.footerRight).replace(/\n/g, '<br>')}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 40px 32px 40px;background-color:${pc};">
      ${pasteButton(normalizeFooterButtonHref(state.footerButtonUrl, state.contactEmail), footerButtonText(state.footerButtonText), ac, btc, ff, 170)}
    </td>
  </tr>
</table>`;

  const social = state.showSocial ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${pageBg};">
  <tr>
    <td align="center" style="padding:24px 0;background-color:${pageBg};">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;">
        <tr>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.facebookUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png" alt="Facebook" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.linkedinUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png" alt="LinkedIn" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.youtubeUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png" alt="YouTube" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  const legal = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;background-color:${pageBg};">
  <tr>
    <td align="center" style="padding:6px 20px 28px 20px;font-family:${ff};font-size:11px;line-height:16px;color:#9aa6b2;background-color:${pageBg};">
      No longer want these emails? <a href="#" style="color:#9aa6b2;text-decoration:underline;">Unsubscribe</a><br>
      © ${new Date().getFullYear()} PORR S.A. Wszelkie prawa zastrzeżone.
    </td>
  </tr>
</table>`;

  return `<div style="margin:0;padding:0;background-color:${pageBg};">
${viewOnline}
${hero}
${articles}
${video}
${feedback}
${footer}
${social}
${legal}
</div>`;
}
