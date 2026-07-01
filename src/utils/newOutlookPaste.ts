import type { Article, NewsletterState } from '@/types';

const BRAND = {
  pageBg: '#f3f5f8',
  white: '#ffffff',
  primary: '#143e70',
  accent: '#feed01',
  text: '#143e70',
  muted: '#6b7280',
  border: '#d7dde8',
  legal: '#9aa6b2',
  imageBg: '#eef2f7',
};

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
  // Outlook / New Outlook w trybie ciemnym potrafi przepisywać kolory.
  // background-image z jednolitym gradientem + bgcolor + inline background-color daje najstabilniejszy efekt po wklejeniu.
  return `background-color:${color};background:${color};background-image:linear-gradient(${color},${color});color-scheme:light only;forced-color-adjust:none;`;
}

function textStyle(color: string): string {
  return `color:${color};-webkit-text-fill-color:${color};mso-style-textfill-fill-color:${color};`;
}

function strictTextStyle(color: string): string {
  // Nowy Outlook potrafi przemalować tekst przy wklejaniu, szczególnie na ciemnym tle.
  // !important + -webkit-text-fill-color + fallback <font color> zwiększają stabilność kontrastu.
  return `color:${color} !important;-webkit-text-fill-color:${color} !important;mso-style-textfill-fill-color:${color};`;
}

function fontColor(color: string, value: string): string {
  return `<font color="${color}"><span style="${strictTextStyle(color)}">${value}</span></font>`;
}

function pasteButton(
  href: string | undefined,
  text: string,
  fontFamily: string,
  minWidth = 132,
  align: 'left' | 'center' = 'left'
): string {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" valign="middle" bgcolor="${BRAND.accent}" style="${bgStyle(BRAND.accent)}border-radius:4px;padding:0;">
      <a href="${esc(safeHref(href))}" target="_blank" style="display:inline-block;min-width:${minWidth}px;padding:11px 18px;font-family:${fontFamily};font-size:13px;line-height:16px;font-weight:bold;${strictTextStyle(BRAND.text)}text-align:center;text-decoration:none;border:0;outline:none;">
        ${esc(text)}
      </a>
    </td>
  </tr>
</table>`;
}

function dualButtons(
  plHref: string | undefined,
  enHref: string | undefined,
  fontFamily: string
): string {
  if (!isUsableUrl(enHref)) {
    return pasteButton(plHref, 'Czytaj dalej', fontFamily, 132);
  }

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="left" valign="top" style="padding:0 8px 0 0;">
      ${pasteButton(plHref, 'Czytaj dalej', fontFamily, 126)}
    </td>
    <td align="left" valign="top" style="padding:0;">
      ${pasteButton(enHref, 'Read more', fontFamily, 126)}
    </td>
  </tr>
</table>`;
}

function heading(
  plTitle: string | undefined,
  enTitle: string | undefined,
  fontFamily: string,
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

  return `<${tag} style="margin:0;padding:0 0 ${cleanEn ? 4 : bottom}px 0;font-family:${fontFamily};font-size:${plSize}px;line-height:${plLine}px;font-weight:bold;${textStyle(BRAND.text)}">
    ${esc(cleanPl)}
  </${tag}>${cleanEn ? `
  <p style="margin:0;padding:0 0 ${bottom}px 0;font-family:${fontFamily};font-size:${enSize}px;line-height:${enLine}px;font-weight:bold;${textStyle(BRAND.text)}">
    ${esc(cleanEn)}
  </p>` : ''}`;
}

function imageBlock(
  src: string | undefined,
  alt: string | undefined,
  width: number,
  heightFallback = 150
): string {
  const safeSrc = imageSource(src);

  if (!safeSrc) {
    return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${width}" bgcolor="${BRAND.imageBg}" style="width:${width}px;border-collapse:collapse;${bgStyle(BRAND.imageBg)}">
  <tr>
    <td align="center" valign="middle" height="${heightFallback}" style="height:${heightFallback}px;padding:12px;font-family:Arial, sans-serif;font-size:12px;line-height:18px;${textStyle('#64748b')}${bgStyle(BRAND.imageBg)}border:1px solid #d9e2ec;">
      Obraz niedostępny po wklejeniu. Użyj linku HTTPS albo eksportu .EML.
    </td>
  </tr>
</table>`;
  }

  return `<img src="${esc(safeSrc)}" width="${width}" border="0" alt="${esc(alt)}" style="display:block;width:${width}px;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;">`;
}

function articleRow(article: Article, index: number, fontFamily: string): string {
  const alt = article.title || article.titleEn || `Artykuł ${index + 1}`;

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="padding:0 20px;${bgStyle(BRAND.white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${BRAND.white}" style="width:560px;border-collapse:collapse;${bgStyle(BRAND.white)}border-top:1px solid ${BRAND.border};mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="height:18px;font-size:1px;line-height:1px;${bgStyle(BRAND.white)}">&nbsp;</td>
        </tr>
        <tr>
          <td width="260" valign="top" style="width:260px;padding:0 20px 20px 0;${bgStyle(BRAND.white)}">
            <a href="${esc(safeHref(article.link))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(article.image, alt, 260, 160)}
            </a>
          </td>
          <td width="280" valign="top" style="width:280px;padding:0 0 20px 0;${bgStyle(BRAND.white)}">
            ${heading(article.title, article.titleEn, fontFamily, 'h3', 17, 22, 14, 19, 10)}
            <p style="margin:0;padding:0 0 14px 0;font-family:${fontFamily};font-size:14px;line-height:20px;${textStyle(BRAND.text)}">
              ${esc(article.description)}
            </p>
            ${dualButtons(article.link, article.linkEn, fontFamily)}
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
  const ff = state.fontFamily || "'trebuchet ms', tahoma, sans-serif";

  const viewOnline = state.showViewOnline ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.pageBg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:12px 20px;font-family:${ff};font-size:12px;line-height:16px;${textStyle(BRAND.muted)}${bgStyle(BRAND.pageBg)}">
      <a href="#" style="${textStyle(BRAND.muted)}text-decoration:underline;">Wyświetl online</a>
    </td>
  </tr>
</table>` : '';

  const hero = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:22px 20px 0 20px;${bgStyle(BRAND.white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${BRAND.white}" style="width:560px;max-width:560px;border-collapse:collapse;${bgStyle(BRAND.white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td bgcolor="${BRAND.primary}" style="${bgStyle(BRAND.primary)}padding:0;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${BRAND.primary}" style="width:560px;max-width:560px;border-collapse:collapse;${bgStyle(BRAND.primary)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tr>
                <td width="390" valign="middle" style="width:390px;padding:22px 15px 22px 24px;font-family:${ff};font-size:22px;line-height:28px;font-weight:bold;${textStyle(BRAND.accent)}${bgStyle(BRAND.primary)}">
                  ${esc(state.issueNumber)}
                </td>
                <td width="170" align="right" valign="middle" style="width:170px;padding:22px 24px 22px 15px;${bgStyle(BRAND.primary)}">
                  ${imageBlock(state.logoUrl, 'PORR', 80, 40)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0;font-size:0;line-height:0;${bgStyle(BRAND.white)}">
            ${imageBlock(state.mainImage, state.mainTitle, 560, 280)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:24px 40px 8px 40px;${bgStyle(BRAND.white)}">
      ${heading(state.mainTitle, state.mainTitleEn, ff, 'h2', 21, 27, 16, 22, 15)}
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;line-height:22px;${textStyle(BRAND.text)}">
        ${esc(state.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 40px 28px 40px;${bgStyle(BRAND.white)}">
      ${dualButtons(state.mainLink, state.mainLinkEn, ff)}
    </td>
  </tr>
</table>`;

  const articles = state.articles.map((article, index) => articleRow(article, index, ff)).join('');

  const video = state.showVideo ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.white}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.white)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td style="padding:14px 20px 10px 20px;${bgStyle(BRAND.white)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" bgcolor="${BRAND.white}" style="width:560px;border-collapse:collapse;${bgStyle(BRAND.white)}border-top:2px solid ${BRAND.accent};mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="padding:18px 0 0 0;${bgStyle(BRAND.white)}">
            <a href="${esc(safeHref(state.videoLink))}" target="_blank" style="text-decoration:none;border:0;">
              ${imageBlock(state.videoThumbnail, state.videoTitle, 560, 260)}
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:14px 40px 30px 40px;${bgStyle(BRAND.white)}">
      ${heading(state.videoTitle, state.videoTitleEn, ff, 'h3', 18, 24, 15, 21, 10, '🎬 ')}
      <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;line-height:20px;${textStyle(BRAND.text)}">
        ${esc(state.videoDescription)}
      </p>
      ${dualButtons(state.videoReadMore || state.videoLink, state.videoReadMoreEn, ff)}
    </td>
  </tr>
</table>` : '';

  const feedback = state.showFeedback ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.primary}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.primary)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td bgcolor="${BRAND.primary}" style="padding:28px 40px 12px 40px;${bgStyle(BRAND.primary)}">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:20px;line-height:26px;font-weight:bold;${strictTextStyle(BRAND.white)}">
        ${fontColor(BRAND.white, esc(state.feedbackTitle || state.footerTitle || 'Cieszymy się, że nas czytasz!'))}
      </h3>
    </td>
  </tr>
  <tr>
    <td bgcolor="${BRAND.primary}" style="padding:12px 40px 24px 40px;${bgStyle(BRAND.primary)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="520" align="center" bgcolor="${BRAND.primary}" style="width:520px;border-collapse:collapse;${bgStyle(BRAND.primary)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td width="250" valign="top" bgcolor="${BRAND.primary}" style="width:250px;padding:0 24px 0 0;font-family:${ff};font-size:15px;line-height:23px;font-weight:bold;${strictTextStyle(BRAND.white)}${bgStyle(BRAND.primary)}">
            ${fontColor(BRAND.white, esc(state.footerLeft).replace(/\n/g, '<br>'))}
          </td>
          <td width="250" valign="top" bgcolor="${BRAND.primary}" style="width:250px;padding:0;font-family:${ff};font-size:15px;line-height:23px;font-weight:bold;${strictTextStyle(BRAND.white)}${bgStyle(BRAND.primary)}">
            ${fontColor(BRAND.white, esc(state.footerRight).replace(/\n/g, '<br>'))}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" bgcolor="${BRAND.primary}" style="padding:0 40px 34px 40px;${bgStyle(BRAND.primary)}">
      ${pasteButton(normalizeFooterButtonHref(state.footerButtonUrl, state.contactEmail), footerButtonText(state.footerButtonText), ff, 190, 'center')}
    </td>
  </tr>
</table>` : '';

  const fallbackFooter = !state.showFeedback ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.primary}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.primary)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td bgcolor="${BRAND.primary}" style="padding:28px 40px 12px 40px;${bgStyle(BRAND.primary)}">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:20px;line-height:26px;font-weight:bold;${strictTextStyle(BRAND.white)}">
        ${fontColor(BRAND.white, esc(state.footerTitle))}
      </h3>
    </td>
  </tr>
  <tr>
    <td bgcolor="${BRAND.primary}" style="padding:12px 40px 24px 40px;${bgStyle(BRAND.primary)}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="520" align="center" bgcolor="${BRAND.primary}" style="width:520px;border-collapse:collapse;${bgStyle(BRAND.primary)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td width="250" valign="top" bgcolor="${BRAND.primary}" style="width:250px;padding:0 24px 0 0;font-family:${ff};font-size:15px;line-height:23px;font-weight:bold;${strictTextStyle(BRAND.white)}${bgStyle(BRAND.primary)}">
            ${fontColor(BRAND.white, esc(state.footerLeft).replace(/\n/g, '<br>'))}
          </td>
          <td width="250" valign="top" bgcolor="${BRAND.primary}" style="width:250px;padding:0;font-family:${ff};font-size:15px;line-height:23px;font-weight:bold;${strictTextStyle(BRAND.white)}${bgStyle(BRAND.primary)}">
            ${fontColor(BRAND.white, esc(state.footerRight).replace(/\n/g, '<br>'))}
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" bgcolor="${BRAND.primary}" style="padding:0 40px 34px 40px;${bgStyle(BRAND.primary)}">
      ${pasteButton(normalizeFooterButtonHref(state.footerButtonUrl, state.contactEmail), footerButtonText(state.footerButtonText), ff, 190, 'center')}
    </td>
  </tr>
</table>` : '';

  const social = state.showSocial ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.pageBg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:24px 0;${bgStyle(BRAND.pageBg)}">
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

  const legal = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" bgcolor="${BRAND.pageBg}" style="width:600px;max-width:600px;border-collapse:collapse;${bgStyle(BRAND.pageBg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:6px 20px 28px 20px;font-family:${ff};font-size:11px;line-height:16px;${textStyle(BRAND.legal)}${bgStyle(BRAND.pageBg)}">
      No longer want these emails? <a href="#" style="${textStyle(BRAND.legal)}text-decoration:underline;">Unsubscribe</a><br>
      © ${new Date().getFullYear()} PORR S.A. Wszelkie prawa zastrzeżone.
    </td>
  </tr>
</table>`;

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${BRAND.pageBg}" style="width:100%;border-collapse:collapse;${bgStyle(BRAND.pageBg)}mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" bgcolor="${BRAND.pageBg}" style="padding:0;${bgStyle(BRAND.pageBg)}">
      ${viewOnline}
      ${hero}
      ${articles}
      ${video}
      ${feedback}
      ${fallbackFooter}
      ${social}
      ${legal}
    </td>
  </tr>
</table>`;
}
