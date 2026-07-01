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

function vmlButton(
  href: string,
  text: string,
  bgColor: string,
  textColor: string,
  fontFamily: string,
  width: number = 150,
  _height: number = 40
): string {
  const url = safeHref(href);
  const safeWidth = Math.max(110, width);

  // Stabilny table-button bez wymuszonej wysokości/line-height równej wysokości.
  // Outlook potrafił robić z przycisków zbyt wysokie bloki przy wklejaniu/forwardowaniu.
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="${safeWidth}" style="width:${safeWidth}px;max-width:${safeWidth}px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;display:inline-table;">
  <tr>
    <td align="center" valign="middle" bgcolor="${bgColor}" style="background-color:${bgColor};border-radius:4px;padding:0;mso-line-height-rule:exactly;">
      <a href="${esc(url)}" target="_blank" style="display:block;padding:10px 14px;font-family:${fontFamily};font-size:13px;font-weight:bold;line-height:16px;color:${textColor} !important;-webkit-text-fill-color:${textColor} !important;text-decoration:none !important;text-decoration-line:none !important;border-bottom:none;text-align:center;mso-line-height-rule:exactly;">
        <span style="color:${textColor} !important;-webkit-text-fill-color:${textColor} !important;text-decoration:none !important;text-decoration-line:none !important;border-bottom:none;">${esc(text)}</span>
      </a>
    </td>
  </tr>
</table>`;
}

function hasUsableHref(href?: string): boolean {
  const value = (href || '').trim();
  return Boolean(value && value !== '#');
}

function dualReadButtons(
  plHref: string,
  enHref: string | undefined,
  bgColor: string,
  textColor: string,
  fontFamily: string,
  singleWidth: number = 150,
  dualWidth: number = 130,
  height: number = 40
): string {
  if (!hasUsableHref(enHref)) {
    return vmlButton(plHref, 'Czytaj dalej', bgColor, textColor, fontFamily, singleWidth, height);
  }

  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
  <tr>
    <td align="left" valign="top" style="padding:0;">
      ${vmlButton(plHref, 'Czytaj dalej', bgColor, textColor, fontFamily, dualWidth, height)}
    </td>
    <td width="10" style="width:10px;font-size:1px;line-height:1px;">&nbsp;</td>
    <td align="left" valign="top" style="padding:0;">
      ${vmlButton(enHref || '#', 'Read more', bgColor, textColor, fontFamily, dualWidth, height)}
    </td>
  </tr>
</table>`;
}

function bilingualHeading(
  plTitle: string,
  enTitle: string | undefined,
  fontFamily: string,
  color: string,
  plFontSize: number,
  plLineHeight: number,
  enFontSize: number,
  enLineHeight: number,
  bottomPadding: number,
  tag: 'h2' | 'h3' = 'h3',
  prefix = ''
): string {
  const normalizedEn = (enTitle || '').trim();
  const mainTitle = `${prefix}${plTitle || ''}`;
  const plBottom = normalizedEn ? 4 : bottomPadding;

  return `<${tag} style="margin:0;padding:0 0 ${plBottom}px 0;font-family:${fontFamily};font-size:${plFontSize}px;font-weight:bold;color:${color};line-height:${plLineHeight}px;mso-line-height-rule:exactly;">
        ${esc(mainTitle)}
      </${tag}>${normalizedEn ? `
      <p style="margin:0;padding:0 0 ${bottomPadding}px 0;font-family:${fontFamily};font-size:${enFontSize}px;font-weight:bold;color:${color};line-height:${enLineHeight}px;mso-line-height-rule:exactly;">
        ${esc(normalizedEn)}
      </p>` : ''}`;
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

  if (externalImages.length > 0) {
    issues.push({
      severity: 'warning',
      message: `Wykryto ${externalImages.length} obraz(ów) zewnętrznych. Outlook może pokazać pasek „Kliknij, aby pobrać obrazy”. To normalne zabezpieczenie Outlooka.`,
    });
  }

  if (s.showSocial) {
    issues.push({
      severity: 'warning',
      message: 'Ikony social media są zewnętrzne, więc Outlook może zablokować ich automatyczne pobranie.',
    });
  }

  if (localImages.length > 0) {
    issues.push({
      severity: localImagesSize > 8 * 1024 * 1024 ? 'error' : 'ok',
      message: `Wykryto ${localImages.length} lokalnie wgrany/e obraz(y). Eksport .EML osadzi je jako CID inline attachments.`,
    });
    issues.push({
      severity: 'warning',
      message: 'Nie używaj funkcji „Prześlij dalej” dla draftu z obrazami CID. Outlook może zgubić osadzone obrazy przy forwardowaniu. Otwórz draft, uzupełnij odbiorców i kliknij „Wyślij”.',
    });
  }

  const englishLinks = Number(Boolean(s.mainLinkEn?.trim())) + Number(Boolean(s.videoReadMoreEn?.trim())) + s.articles.filter((article) => article.linkEn?.trim()).length;
  const englishTitles = Number(Boolean(s.mainTitleEn?.trim())) + Number(Boolean(s.videoTitleEn?.trim())) + s.articles.filter((article) => article.titleEn?.trim()).length;

  if (englishTitles > 0) {
    issues.push({ severity: 'ok', message: `Wykryto ${englishTitles} tytuł(ów) EN. Zostaną pokazane pod tytułami PL.` });
  }

  if (englishLinks > 0) {
    issues.push({ severity: 'ok', message: `Wykryto ${englishLinks} link(ów) EN. Dla tych sekcji zostanie dodany przycisk „Read more”.` });
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
            <a href="#" style="font-family:${ff};font-size:12px;line-height:16px;color:#999999;text-decoration:underline;">Wyświetl online</a>
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
                <td width="380" style="padding:22px 15px 22px 25px;vertical-align:middle;font-family:${ff};font-size:22px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;font-weight:bold;line-height:28px;mso-line-height-rule:exactly;">
                  <font color="#ffffff"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;">${esc(s.issueNumber)}</span></font>
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
      ${bilingualHeading(s.mainTitle, s.mainTitleEn, ff, tc, 20, 26, 16, 22, 15, 'h2')}
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:${tc};line-height:22px;mso-line-height-rule:exactly;">
        ${esc(s.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:10px 20px 25px 20px;">
      ${dualReadButtons(s.mainLink, s.mainLinkEn, ac, btc, ff, 150, 150, 40)}
    </td>
  </tr>
</table>`;

  const articlesHTML = s.articles.map((a) => `
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding:10px 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" style="width:560px;max-width:560px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;" class="responsive">
        <tr>
          <td style="border-top:1px solid #e8e8e8;font-size:1px;line-height:1px;" height="1">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:10px 20px 20px 20px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560" align="center" style="width:560px;max-width:560px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout:fixed;" class="responsive">
        <tr>
          <td width="260" valign="top" style="width:260px;padding:0 20px 0 0;font-size:0;line-height:0;">
            <a href="${esc(safeHref(a.link))}" target="_blank">
              <img src="${esc(a.image)}" width="260" border="0" alt="${esc(a.title)}" class="fluid-img" style="display:block;border:0;outline:none;text-decoration:none;width:260px;max-width:260px;height:auto;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
          <td width="280" valign="top" style="width:280px;padding:0;vertical-align:top;">
            ${bilingualHeading(a.title, a.titleEn, ff, tc, 18, 24, 14, 19, 10, 'h3')}
            <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;mso-line-height-rule:exactly;">
              ${esc(a.description)}
            </p>
            ${dualReadButtons(a.link, a.linkEn, ac, btc, ff, 130, 130, 36)}
          </td>
        </tr>
      </table>
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
      ${bilingualHeading(s.videoTitle, s.videoTitleEn, ff, tc, 18, 24, 14, 19, 10, 'h3', '🎬 ')}
      <p style="margin:0;padding:0 0 15px 0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;mso-line-height-rule:exactly;">
        ${esc(s.videoDescription)}
      </p>
      ${dualReadButtons(s.videoReadMore, s.videoReadMoreEn, ac, btc, ff, 150, 150, 40)}
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
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;" class="responsive" bgcolor="${pc}">
  <tr>
    <td style="padding:25px 25px 5px 25px;" bgcolor="${pc}">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:18px;font-weight:bold;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;line-height:24px;mso-line-height-rule:exactly;">
        <font color="#ffffff"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;">${esc(s.footerTitle)}</span></font>
      </h3>
    </td>
  </tr>
  <tr>
    <td style="padding:15px 25px;" bgcolor="${pc}">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="550" style="width:550px;max-width:550px;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout:fixed;" class="responsive">
        <tr>
          <td width="255" valign="top" style="width:255px;padding:0 20px 0 0;vertical-align:top;">
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;line-height:22px;mso-line-height-rule:exactly;">
              <font color="#ffffff"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;">${esc(s.footerLeft)}</span></font>
            </p>
          </td>
          <td width="255" valign="top" style="width:255px;padding:0;vertical-align:top;">
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;line-height:22px;mso-line-height-rule:exactly;">
              <font color="#ffffff"><span style="color:#ffffff !important;-webkit-text-fill-color:#ffffff !important;">${esc(s.footerRight)}</span></font>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:20px 25px 30px 25px;" bgcolor="${pc}">
      ${vmlButton(normalizeFooterButtonHref(s.footerButtonUrl, s.contactEmail), footerButtonText(s.footerButtonText), ac, btc, ff, 200, 44)}
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
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
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
:root { color-scheme: light; supported-color-schemes: light; }
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
