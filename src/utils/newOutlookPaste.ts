import type { Article, NewsletterState } from '@/types';

/**
 * Generuje HTML zoptymalizowany do wklejenia w nowym Outlooku (Windows 11 / web).
 * Używa kolorów ze stanu newslettera (nie hardkodowanych stałych), więc jest
 * wizualnie spójny z podglądem i eksportem emailGenerator.ts.
 *
 * Różni się od emailGenerator.ts brakiem MSO conditionals i VML (nowy Outlook
 * renderuje HTML bezpośrednio jak przeglądarka, nie przez Word engine).
 */

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

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

function bgStyle(color: string): string {
  return `background-color:${color};background:${color};background-image:linear-gradient(${color},${color});color-scheme:light only;forced-color-adjust:none;`;
}

function textStyle(color: string): string {
  return `color:${color};-webkit-text-fill-color:${color};mso-style-textfill-fill-color:${color};mso-line-height-rule:exactly;`;
}

function strictTextStyle(color: string): string {
  return `color:${color} !important;-webkit-text-fill-color:${color} !important;mso-style-textfill-fill-color:${color};mso-line-height-rule:exactly;`;
}

function fontColor(color: string, value: string): string {
  return `<font color="${color}" style="color:${color} !important;-webkit-text-fill-color:${color} !important;text-decoration:none !important;">${value}</font>`;
}

// ────────────────────────────────────────────────────────────────
// UI Primitives
// ────────────────────────────────────────────────────────────────

function pasteButton(
  href: string | undefined,
  text: string,
  accentColor: string,
  buttonTextColor: string,
  fontFamily: string,
  minWidth = 132,
  align: 'left' | 'center' = 'left'
): string {
  const label = esc(text);
  const url = esc(safeHref(href));

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" valign="middle" bgcolor="${accentColor}" style="${bgStyle(accentColor)}border-radius:4px;padding:0;">
      <a href="${url}" target="_blank" style="display:block;min-width:${minWidth}px;padding:11px 18px;font-family:${fontFamily};font-size:13px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:${buttonTextColor} !important;-webkit-text-fill-color:${buttonTextColor} !important;text-decoration:none !important;text-decoration-line:none !important;-webkit-text-decoration-line:none !important;border:0 !important;outline:none !important;border-bottom:none !important;">
        <span style="display:inline-block;font-family:${fontFamily};font-size:13px;line-height:16px;mso-line-height-rule:exactly;font-weight:bold;color:${buttonTextColor} !important;-webkit-text-fill-color:${buttonTextColor} !important;text-decoration:none !important;">${label}</span>
      </a>
    </td>
  </tr>
</table>`;
}

function dualButtons(
  plHref: string | undefined,
  enHref: string | undefined,
  accentColor: string,
  buttonTextColor: string,
  fontFamily: string
): string {
  if (!isUsableUrl(enHref)) {
    return pasteButton(plHref, 'Czytaj dalej', accentColor, buttonTextColor, fontFamily, 132);
  }

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="left" valign="top" style="padding:0 8px 0 0;">
      ${pasteButton(plHref, 'Czytaj dalej', accentColor, buttonTextColor, fontFamily, 126)}
    </td>
    <td align="left" valign="top" style="padding:0;">
      ${pasteButton(enHref, 'Read more', accentColor, buttonTextColor, fontFamily, 126)}
    </td>
  </tr>
</table>`;
}

function heading(
  plTitle: string | undefined,
  enTitle: string | undefined,
  fontFamily: string,
  textColor: string,
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

  return `<div role="heading" aria-level="${tag === 'h2' ? 2 : 3}" style="margin:0;padding:0 0 ${cleanEn ? 4 : bottom}px 0;font-family:${fontFamily};font-size:${plSize}px;line-height:${plLine}px;mso-line-height-rule:exactly;font-weight:bold;${textStyle(textColor)}">
    ${esc(cleanPl)}
  </div>${cleanEn ? `
  <div style="margin:0;padding:0 0 ${bottom}px 0;font-family:${fontFamily};font-size:${enSize}px;line-height:${enLine}px;mso-line-height-rule:exactly;font-weight:bold;${textStyle(textColor)}">
    ${esc(cleanEn)}
  </div>` : ''}`;
}

function imageBlock(
  src: string | undefined,
  alt: string | undefined,
  width: number,
  bgColor: string,
  heightFallback = 150
): string {
  const safeSrc = imageSource(src);

  if (!safeSrc) {
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}" bgcolor="${bgColor}" style="width:${width}px;border-collapse:collapse;${bgStyle(bgColor)}">
  <tr>
    <td align="center" valign="middle" height="${heightFallback}" style="height:${heightFallback}px;padding:12px;font-family:Arial, sans-serif;font-size:12px;line-height:18px;${textStyle('#64748b')}${bgStyle(bgColor)}border:1px solid #d9e2ec;">
      Obraz niedostępny po wklejeniu. Użyj linku HTTPS albo eksportu .EML.
    </td>
  </tr>
</table>`;
  }

  return `<img src="${esc(safeSrc)}" width="${width}" border="0" alt="${esc(alt)}" style="display:block;width:${width}px;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;">`;
}

// ────────────────────────────────────────────────────────────────
// Sections
// ────────────────────────────────────────────────────────────────

function articleRow(article: Article, index: number, state: NewsletterState): string {
  const ff = state.fontFamily || 'Arial, sans-serif';
  const tc = state.textColor || '#143e70';
  const ac = state.accentColor || '#feed01';
  const btc = state.buttonTextColor || '#143e70';
  const white = '#ffffff';
  const imageBg = '#eef2f7';
  const alt = article.title || article.titleEn || `Artykuł ${index + 1}`;

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="padding:0 20px;${bgStyle(white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${white}" style="width:560px;border-collapse:collapse;${bgStyle(white)}border-top:1px solid #d7dde8;mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="height:18px;font-size:1px;line-height:1px;${bgStyle(white)}">&nbsp;</td>
        </tr>
        <tr>
          <td width="260" valign="top" style="width:260px;padding:0 20px 20px 0;${bgStyle(white)}">
            <a href="${esc(safeHref(article.link))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(article.image, alt, 260, imageBg, 160)}
            </a>
          </td>
          <td width="280" valign="top" style="width:280px;padding:0 0 20px 0;${bgStyle(white)}">
            ${heading(article.title, article.titleEn, ff, tc, 'h3', 17, 22, 14, 19, 10)}
            <p style="margin:0;padding:0 0 14px 0;font-family:${ff};font-size:14px;line-height:20px;mso-line-height-rule:exactly;${textStyle(tc)}">
              ${esc(article.description)}
            </p>
            ${dualButtons(article.link, article.linkEn, ac, btc, ff)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ────────────────────────────────────────────────────────────────
// Public exports
// ────────────────────────────────────────────────────────────────

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
  // Kolory ze stanu — nie hardkodowane stałe
  const ff = state.fontFamily || 'Arial, sans-serif';
  const pc = state.primaryColor || '#143e70';
  const ac = state.accentColor || '#feed01';
  const btc = state.buttonTextColor || '#143e70';
  const tc = state.textColor || '#143e70';
  const bg = state.bgColor || '#f3f5f8';
  const white = '#ffffff';
  const imageBg = '#eef2f7';

  // ── View Online ────────────────────────────────────────────────
  const viewOnline = state.showViewOnline
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${bg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(bg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:12px 20px;font-family:${ff};font-size:12px;line-height:16px;mso-line-height-rule:exactly;${textStyle('#9aa6b2')}${bgStyle(bg)}">
      <a href="${esc(safeHref(state.viewOnlineUrl || '#'))}" style="${textStyle('#9aa6b2')}text-decoration:none !important;">Wyświetl online</a>
    </td>
  </tr>
</table>` : '';

  // ── Hero ───────────────────────────────────────────────────────
  const hero = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:22px 20px 0 20px;${bgStyle(white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${white}" style="width:560px;max-width:560px;border-collapse:collapse;${bgStyle(white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td bgcolor="${pc}" style="${bgStyle(pc)}padding:0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${pc}" style="width:560px;max-width:560px;border-collapse:collapse;${bgStyle(pc)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tr>
                <td width="390" valign="middle" bgcolor="${pc}" style="width:390px;padding:22px 15px 22px 24px;font-family:${ff};font-size:22px;line-height:28px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}${bgStyle(pc)}">
                  ${fontColor(white, `<b style="color:${white} !important;-webkit-text-fill-color:${white} !important;">${esc(state.issueNumber)}</b>`)}
                </td>
                <td width="170" align="right" valign="middle" style="width:170px;padding:22px 24px 22px 15px;${bgStyle(pc)}">
                  ${imageBlock(state.logoUrl, 'PORR', 80, pc, 40)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-size:0;line-height:0;${bgStyle(white)}">
            ${imageBlock(state.mainImage, state.mainTitle, 560, imageBg, 280)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 40px 8px 40px;${bgStyle(white)}">
      ${heading(state.mainTitle, state.mainTitleEn, ff, tc, 'h2', 21, 27, 16, 22, 15)}
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;line-height:22px;mso-line-height-rule:exactly;${textStyle(tc)}">
        ${esc(state.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 40px 28px 40px;${bgStyle(white)}">
      ${dualButtons(state.mainLink, state.mainLinkEn, ac, btc, ff)}
    </td>
  </tr>
</table>`;

  // ── Articles ───────────────────────────────────────────────────
  const articles = state.articles.map((article, index) => articleRow(article, index, state)).join('');

  // ── Video ──────────────────────────────────────────────────────
  const video = state.showVideo
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="padding:14px 20px 10px 20px;${bgStyle(white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${white}" style="width:560px;border-collapse:collapse;${bgStyle(white)}border-top:2px solid ${ac};mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="padding:18px 0 0 0;${bgStyle(white)}">
            <a href="${esc(safeHref(state.videoLink))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(state.videoThumbnail, state.videoTitle, 560, imageBg, 260)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 40px 30px 40px;${bgStyle(white)}">
      ${heading(state.videoTitle, state.videoTitleEn, ff, tc, 'h3', 18, 24, 15, 21, 10, '🎬 ')}
      <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;line-height:20px;mso-line-height-rule:exactly;${textStyle(tc)}">
        ${esc(state.videoDescription)}
      </p>
      ${dualButtons(state.videoReadMore || state.videoLink, state.videoReadMoreEn, ac, btc, ff)}
    </td>
  </tr>
</table>` : '';

  // ── Feedback (emoji) ───────────────────────────────────────────
  // Sekcja z opcjami oceny newslettera — wizualnie taka sama jak w emailGenerator.ts.
  const feedbackBg = state.feedbackBgColor || '#f0f4f8';
  const feedback = state.showFeedback
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${feedbackBg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(feedbackBg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:35px 20px 10px 20px;${bgStyle(feedbackBg)}">
      <div style="margin:0;padding:0;font-family:${ff};font-size:22px;font-weight:bold;line-height:28px;mso-line-height-rule:exactly;${textStyle(pc)}">
        ${esc(state.feedbackTitle)}
      </div>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:5px 20px 25px 20px;${bgStyle(feedbackBg)}">
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;line-height:20px;mso-line-height-rule:exactly;${textStyle(tc)}">
        ${esc(state.feedbackSubtitle)}
      </p>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:0 10px 25px 10px;${bgStyle(feedbackBg)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          ${state.feedbackOptions.map((o) => `
          <td align="center" style="padding:10px 12px;">
            <a href="${esc(safeHref(o.link))}" style="text-decoration:none;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:32px;line-height:36px;padding-bottom:8px;">
                    ${o.emoji}
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:${ff};font-size:12px;line-height:16px;${textStyle(tc)}">
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
  ${state.feedbackSurveyLink
    ? `<tr>
      <td align="center" style="padding:5px 20px 20px 20px;${bgStyle(feedbackBg)}">
        <a href="${esc(state.feedbackSurveyLink)}" style="font-family:${ff};font-size:14px;${textStyle(pc)}text-decoration:underline;">
          ${esc(state.feedbackSurveyText)}
        </a>
      </td>
    </tr>` : ''}
  <tr>
    <td style="height:35px;font-size:1px;line-height:1px;${bgStyle(feedbackBg)}">&nbsp;</td>
  </tr>
</table>` : '';

  // ── Footer ─────────────────────────────────────────────────────
  // Stopka jest ZAWSZE widoczna (niezależnie od showFeedback).
  const footer = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${pc}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(pc)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td bgcolor="${pc}" style="padding:28px 40px 12px 40px;${bgStyle(pc)}">
      <div style="margin:0;padding:0;font-family:${ff};font-size:20px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}">
        ${fontColor(white, `<b>${esc(state.footerTitle)}</b>`)}
      </div>
    </td>
  </tr>
  <tr>
    <td bgcolor="${pc}" style="padding:12px 40px 24px 40px;${bgStyle(pc)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="520" align="center" bgcolor="${pc}" style="width:520px;border-collapse:collapse;${bgStyle(pc)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td width="250" valign="top" bgcolor="${pc}" style="width:250px;padding:0 24px 0 0;font-family:${ff};font-size:15px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}${bgStyle(pc)}">
            <div style="margin:0;font-family:${ff};font-size:15px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}">
              ${fontColor(white, esc(state.footerLeft).replace(/\n/g, '<br>'))}
            </div>
          </td>
          <td width="250" valign="top" bgcolor="${pc}" style="width:250px;padding:0;font-family:${ff};font-size:15px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}${bgStyle(pc)}">
            <div style="margin:0;font-family:${ff};font-size:15px;line-height:23px;mso-line-height-rule:exactly;font-weight:bold;${strictTextStyle(white)}">
              ${fontColor(white, esc(state.footerRight).replace(/\n/g, '<br>'))}
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" bgcolor="${pc}" style="padding:0 40px 34px 40px;${bgStyle(pc)}">
      ${pasteButton(normalizeFooterButtonHref(state.footerButtonUrl, state.contactEmail), footerButtonText(state.footerButtonText), ac, btc, ff, 190, 'center')}
    </td>
  </tr>
</table>`;

  // ── Social ─────────────────────────────────────────────────────
  const social = state.showSocial
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${bg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(bg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:24px 0;${bgStyle(bg)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.facebookUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png" alt="Facebook" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.linkedinUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png" alt="LinkedIn" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
          <td style="padding:0 14px;"><a href="${esc(safeHref(state.youtubeUrl))}" target="_blank"><img width="34" height="34" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png" alt="YouTube" style="display:block;border:0;outline:none;text-decoration:none;"></a></td>
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  // ── Legal ──────────────────────────────────────────────────────
  const legal = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${bg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(bg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:6px 20px 28px 20px;font-family:${ff};font-size:11px;line-height:16px;mso-line-height-rule:exactly;${textStyle('#9aa6b2')}${bgStyle(bg)}">
      © ${new Date().getFullYear()} PORR S.A. Wszelkie prawa zastrzeżone.
    </td>
  </tr>
</table>`;

  // ── Style override ─────────────────────────────────────────────
  const pasteStyle = `<style type="text/css">
    .porr-mail-root a,
    .porr-mail-root a:link,
    .porr-mail-root a:visited,
    .porr-mail-root a:hover,
    .porr-mail-root a span,
    .porr-mail-root a u {
      text-decoration: none !important;
      text-decoration-line: none !important;
      -webkit-text-decoration-line: none !important;
      border-bottom: 0 !important;
    }
  </style>`;

  return `${pasteStyle}<div class="porr-mail-root" style="margin:0;padding:0;background-color:${bg};">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="width:100%;border-collapse:collapse;${bgStyle(bg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" bgcolor="${bg}" style="padding:0;${bgStyle(bg)}">
      ${viewOnline}
      ${hero}
      ${articles}
      ${video}
      ${feedback}
      ${footer}
      ${social}
      ${legal}
    </td>
  </tr>
</table>
</div>`;
}
