import type { NewsletterState } from '@/types';

function esc(t: string): string {
  if (!t) return '';
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function nl2br(t: string): string {
  return esc(t).replace(/\n/g, '<br>');
}

export function generateEmailHTML(s: NewsletterState): string {
  const {
    issueNumber, preheader, logoUrl,
    mainTitle, mainDescription, mainImage, mainLink,
    videoThumbnail, videoLink, videoTitle, videoDescription, videoReadMore,
    footerTitle, footerLeft, footerRight, contactEmail,
    facebookUrl, linkedinUrl, youtubeUrl,
    primaryColor, accentColor, buttonTextColor, textColor, bgColor, fontFamily,
    showVideo, showSocial, showViewOnline, showFeedback,
    feedbackTitle, feedbackSubtitle, feedbackBgColor, feedbackSurveyLink, feedbackSurveyText,
    feedbackOptions, articles,
  } = s;

  const ff = fontFamily;

  // Preheader - hidden text for email clients
  const preheaderHTML = preheader
    ? `<!--[if !mso]><!--><div style="display:none;font-size:1px;color:${bgColor};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${esc(preheader)}${'&zwnj;&nbsp;'.repeat(30)}</div><!--<![endif]-->`
    : '';

  // View online link
  const viewOnlineHTML = showViewOnline
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td align="center" style="padding-top:12px;padding-bottom:12px;padding-left:20px;padding-right:20px;font-family:${ff};font-size:11px;line-height:16px;color:#999999;"><a href="#" target="_blank" style="font-family:${ff};font-size:11px;line-height:16px;color:#999999;text-decoration:underline;">Wyświetl w przeglądarce</a></td></tr></table>`
    : '';

  // VML button helper for Outlook
  const vmlButton = (href: string, text: string, width: number, bgCol: string, txtCol: string) => `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:40px;v-text-anchor:middle;width:${width}px;" arcsize="13%" fillcolor="${bgCol}" strokecolor="${bgCol}" strokeweight="0px">
<w:anchorlock/>
<center style="color:${txtCol};font-family:${ff};font-size:14px;font-weight:bold;">${esc(text)}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!--><a href="${esc(href)}" target="_blank" style="display:inline-block;padding-top:12px;padding-right:28px;padding-bottom:12px;padding-left:28px;background-color:${bgCol};color:${txtCol};font-family:${ff};font-size:14px;font-weight:bold;text-decoration:none;border-radius:5px;line-height:16px;mso-padding-alt:0;text-align:center;">${esc(text)}</a><!--<![endif]-->`;

  // Outlook-safe image
  const safeImg = (src: string, w: number, h: number | null, alt: string) => {
    const hAttr = h ? ` height="${h}"` : '';
    const hStyle = h ? `height:${h}px;` : 'height:auto;';
    return `<!--[if mso]><img src="${esc(src)}" width="${w}"${hAttr} border="0" style="display:block;border:0;outline:none;${hStyle}width:${w}px;" alt="${esc(alt)}"><![endif]-->
<!--[if !mso]><!--><img src="${esc(src)}" width="${w}" border="0" style="display:block;border:0;outline:none;max-width:100%;height:auto;width:${w}px;" alt="${esc(alt)}"><!--<![endif]-->`;
  };

  // Header section
  const headerHTML = `<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background-color:#ffffff;" class="responsive" role="presentation">
<tr><td style="padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${primaryColor}" style="background-color:${primaryColor};" role="presentation">
  <tr><td style="padding-top:22px;padding-right:24px;padding-bottom:22px;padding-left:24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
    <tr>
      <td style="vertical-align:middle;font-family:${ff};font-size:22px;font-weight:bold;color:${accentColor};line-height:28px;">${esc(issueNumber)}</td>
      <td width="100" align="right" style="vertical-align:middle;">
        ${safeImg(logoUrl, 80, null, 'PORR')}
      </td>
    </tr>
    </table>
  </td></tr>
  </table>
</td></tr></table>`;

  // Main article
  const mainArticleHTML = `<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background-color:#ffffff;" class="responsive" role="presentation">
<tr><td style="padding-top:5px;padding-right:20px;padding-bottom:0px;padding-left:20px;">
  <a href="${esc(mainLink)}" target="_blank" style="text-decoration:none;">
    ${safeImg(mainImage, 560, null, mainTitle)}
  </a>
</td></tr>
<tr><td style="padding-top:25px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
  <h2 style="margin-top:0;margin-right:0;margin-bottom:15px;margin-left:0;font-family:${ff};font-size:20px;font-weight:bold;color:${textColor};line-height:26px;">${esc(mainTitle)}</h2>
  <p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:14px;color:${textColor};line-height:22px;">${nl2br(mainDescription)}</p>
</td></tr>
<tr><td style="padding-top:15px;padding-right:20px;padding-bottom:30px;padding-left:20px;">
  ${vmlButton(mainLink, 'Czytaj więcej', 160, accentColor, buttonTextColor)}
</td></tr>
</table>`;

  // Separator
  const separatorHTML = `<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background-color:#ffffff;" class="responsive" role="presentation">
<tr><td style="padding-top:0px;padding-right:40px;padding-bottom:0px;padding-left:40px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation">
  <tr><td style="border-top:1px solid #e8e8e8;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>
</td></tr>
</table>`;

  // Articles - each with MSO fallback
  const articlesHTML = articles.map((a, idx) => `${idx > 0 ? separatorHTML : ''}
<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background-color:#ffffff;" class="responsive" role="presentation">
<tr><td style="padding-top:24px;padding-right:20px;padding-bottom:24px;padding-left:20px;">
  <!--[if mso]>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
    <td width="260" valign="top" style="padding-right:10px;">
      <a href="${esc(a.link)}" target="_blank"><img src="${esc(a.image)}" width="260" height="174" border="0" style="display:block;border:0;outline:none;width:260px;height:174px;" alt="${esc(a.title)}"></a>
    </td>
    <td width="10"></td>
    <td width="270" valign="top">
  <![endif]-->
  <!--[if !mso]><!-->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
    <td class="stack-col" width="48%" style="vertical-align:top;">
      <a href="${esc(a.link)}" target="_blank" style="text-decoration:none;">
        <img src="${esc(a.image)}" width="260" border="0" style="display:block;border:0;outline:none;max-width:100%;height:auto;border-radius:4px;" alt="${esc(a.title)}">
      </a>
    </td>
    <td class="hide-mobile" width="4%"></td>
    <td class="stack-col" width="48%" style="vertical-align:top;padding-top:0px;">
  <!--<![endif]-->
      <h3 style="margin-top:8px;margin-right:0;margin-bottom:10px;margin-left:0;font-family:${ff};font-size:17px;font-weight:bold;color:${textColor};line-height:22px;">${esc(a.title)}</h3>
      <p style="margin-top:0;margin-right:0;margin-bottom:15px;margin-left:0;font-family:${ff};font-size:13px;color:${textColor};line-height:20px;">${nl2br(a.description)}</p>
      ${vmlButton(a.link, 'Czytaj więcej', 140, accentColor, buttonTextColor)}
    </td>
  </tr></table>
</td></tr>
</table>`).join('\n');

  // Video section
  const videoHTML = showVideo ? `${articles.length > 0 ? separatorHTML : ''}
<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:600px;max-width:600px;background-color:#ffffff;" class="responsive" role="presentation">
<tr><td style="padding-top:30px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
  <a href="${esc(videoLink)}" target="_blank" style="text-decoration:none;">
    ${safeImg(videoThumbnail, 560, 315, videoTitle)}
  </a>
</td></tr>
<tr><td style="padding-top:15px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
  <h3 style="margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;font-family:${ff};font-size:18px;font-weight:bold;color:${textColor};line-height:24px;">${esc(videoTitle)}</h3>
  <p style="margin-top:0;margin-right:0;margin-bottom:15px;margin-left:0;font-family:${ff};font-size:14px;color:${textColor};line-height:22px;">${nl2br(videoDescription)}</p>
</td></tr>
<tr><td style="padding-top:5px;padding-right:20px;padding-bottom:35px;padding-left:20px;">
  ${vmlButton(videoReadMore, 'Czytaj więcej', 140, accentColor, buttonTextColor)}
</td></tr>
</table>` : '';

  // Feedback section
  const feedbackCellWidth = Math.floor(560 / Math.max(feedbackOptions.length, 1));
  const feedbackHTML = showFeedback ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgColor}" style="background-color:${bgColor};" role="presentation"><tr><td align="center">
  <table width="600" align="center" cellpadding="0" cellspacing="0" border="0" bgcolor="${feedbackBgColor}" style="width:600px;max-width:600px;background-color:${feedbackBgColor};" class="responsive" role="presentation">
    <tr><td style="padding-top:10px;padding-right:20px;padding-bottom:0px;padding-left:20px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
    <tr><td align="center" style="padding-top:25px;padding-right:20px;padding-bottom:12px;padding-left:20px;">
      <h2 style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:20px;font-weight:bold;color:${primaryColor};line-height:26px;">${esc(feedbackTitle)}</h2>
    </td></tr>
    <tr><td align="center" style="padding-top:0px;padding-right:20px;padding-bottom:20px;padding-left:20px;">
      <p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:14px;color:${textColor};line-height:20px;">${esc(feedbackSubtitle)}</p>
    </td></tr>
    <tr><td align="center" style="padding-top:0px;padding-right:10px;padding-bottom:20px;padding-left:10px;">
      <!--[if mso]>
      <table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
        ${feedbackOptions.map(o => `<td width="${feedbackCellWidth}" align="center" valign="top" style="padding-top:8px;padding-right:6px;padding-bottom:8px;padding-left:6px;">
          <a href="${esc(o.link)}" target="_blank" style="text-decoration:none;">
            <span style="font-size:28px;line-height:36px;">${o.emoji}</span><br>
            <span style="font-family:${ff};font-size:11px;color:${textColor};line-height:16px;">${esc(o.label)}</span>
          </a>
        </td>`).join('\n')}
      </tr></table>
      <![endif]-->
      <!--[if !mso]><!-->
      <table cellpadding="0" cellspacing="0" border="0" class="feedback-table" role="presentation"><tr>
        ${feedbackOptions.map(o => `<td class="feedback-cell" align="center" style="padding-top:8px;padding-right:10px;padding-bottom:8px;padding-left:10px;">
          <a href="${esc(o.link)}" target="_blank" style="text-decoration:none;display:inline-block;">
            <div style="font-size:30px;line-height:38px;margin-bottom:6px;">${o.emoji}</div>
            <div style="font-family:${ff};font-size:11px;color:${textColor};line-height:16px;">${esc(o.label)}</div>
          </a>
        </td>`).join('\n')}
      </tr></table>
      <!--<![endif]-->
    </td></tr>
    ${feedbackSurveyLink ? `<tr><td align="center" style="padding-top:10px;padding-right:20px;padding-bottom:20px;padding-left:20px;">
      <a href="${esc(feedbackSurveyLink)}" target="_blank" style="font-family:${ff};font-size:13px;color:${primaryColor};text-decoration:underline;line-height:20px;">${esc(feedbackSurveyText)}</a>
    </td></tr>` : ''}
    <tr><td style="padding-top:0px;padding-bottom:10px;font-size:1px;line-height:1px;">&nbsp;</td></tr>
  </table>
</td></tr></table>` : '';

  // Social icons
  const socialIconSize = 36;
  const socialIcons = [
    { url: facebookUrl, img: 'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png', alt: 'Facebook' },
    { url: linkedinUrl, img: 'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png', alt: 'LinkedIn' },
    { url: youtubeUrl, img: 'https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png', alt: 'YouTube' },
  ];
  const socialHTML = showSocial ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
  ${socialIcons.map(si => `<td style="padding-top:0px;padding-right:12px;padding-bottom:0px;padding-left:12px;">
    <a href="${esc(si.url)}" target="_blank">
      <img width="${socialIconSize}" height="${socialIconSize}" src="${si.img}" border="0" style="display:block;border:0;outline:none;width:${socialIconSize}px;height:${socialIconSize}px;" alt="${si.alt}">
    </a>
  </td>`).join('\n')}
</tr></table>` : '';

  // Footer
  const footerHTML = `<table width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;" class="responsive" role="presentation">
<tr><td bgcolor="${primaryColor}" style="padding-top:24px;padding-right:24px;padding-bottom:8px;padding-left:24px;background-color:${primaryColor};">
  <h3 style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:18px;font-weight:bold;color:#ffffff;line-height:24px;">${esc(footerTitle)}</h3>
</td></tr>
<tr><td bgcolor="${primaryColor}" style="padding-top:12px;padding-right:24px;padding-bottom:20px;padding-left:24px;background-color:${primaryColor};">
  <!--[if mso]>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
    <td width="255" valign="top"><p style="margin:0;font-family:${ff};font-size:13px;color:#ffffff;line-height:20px;">${nl2br(footerLeft)}</p></td>
    <td width="30"></td>
    <td width="255" valign="top"><p style="margin:0;font-family:${ff};font-size:13px;color:#ffffff;line-height:20px;">${nl2br(footerRight)}</p></td>
  </tr></table>
  <![endif]-->
  <!--[if !mso]><!-->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
    <td class="stack-col" width="48%" style="vertical-align:top;"><p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:13px;color:#ffffff;line-height:20px;">${nl2br(footerLeft)}</p></td>
    <td class="hide-mobile" width="4%"></td>
    <td class="stack-col" width="48%" style="vertical-align:top;"><p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:${ff};font-size:13px;color:#ffffff;line-height:20px;">${nl2br(footerRight)}</p></td>
  </tr></table>
  <!--<![endif]-->
</td></tr>
<tr><td align="center" bgcolor="${primaryColor}" style="padding-top:16px;padding-right:24px;padding-bottom:28px;padding-left:24px;background-color:${primaryColor};">
  ${vmlButton(`mailto:${contactEmail}`, 'Napisz do nas ✉️', 200, accentColor, buttonTextColor)}
</td></tr>
</table>`;

  // Unsubscribe
  const unsubHTML = `<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgColor}" style="background-color:${bgColor};" role="presentation"><tr><td align="center" style="padding-top:24px;padding-right:20px;padding-bottom:24px;padding-left:20px;">
  <p style="margin:0;font-family:${ff};font-size:11px;color:#bbbbbb;line-height:16px;">No longer want these emails? <a href="#" target="_blank" style="font-family:${ff};font-size:11px;color:#bbbbbb;text-decoration:underline;">Unsubscribe</a></p>
</td></tr></table>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
<title>${esc(issueNumber)}</title>
<!--[if mso]>
<noscript>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
</noscript>
<style type="text/css">
  table {border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;}
  td, th {font-family: ${ff}; mso-line-height-rule: exactly;}
  a {text-decoration: none;}
  img {-ms-interpolation-mode: bicubic;}
</style>
<![endif]-->
<style type="text/css">
  body { margin: 0; padding: 0; width: 100%; background-color: ${bgColor}; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  a { text-decoration: none; }
  /* Responsive */
  @media only screen and (max-width: 620px) {
    table.responsive { width: 100% !important; max-width: 100% !important; }
    td.stack-col { display: block !important; width: 100% !important; padding-top: 12px !important; padding-bottom: 12px !important; box-sizing: border-box !important; }
    td.hide-mobile { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
    td.feedback-cell { display: inline-block !important; width: auto !important; padding-left: 6px !important; padding-right: 6px !important; }
    table.feedback-table tr { display: flex !important; flex-wrap: wrap !important; justify-content: center !important; }
    img { max-width: 100% !important; height: auto !important; }
    td.mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${bgColor};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
${preheaderHTML}

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgColor}" style="background-color:${bgColor};" role="presentation">
<tr><td align="center" style="padding:0;">

${viewOnlineHTML}

<!--[if mso]><table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
${headerHTML}
${mainArticleHTML}
<!--[if mso]></td></tr></table><![endif]-->

<!--[if mso]><table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
${articlesHTML}
${videoHTML}
<!--[if mso]></td></tr></table><![endif]-->

${feedbackHTML}

<!--[if mso]><table width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
${footerHTML}
<!--[if mso]></td></tr></table><![endif]-->

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${bgColor}" style="background-color:${bgColor};" role="presentation"><tr><td align="center" style="padding-top:20px;padding-bottom:20px;">
${socialHTML}
</td></tr></table>

${unsubHTML}

</td></tr></table>
</body>
</html>`;
}

export function generateEML(html: string, subject: string): string {
  const boundary = '----=_Part_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  return `From: newsletter@porr.pl\r
To: recipient@example.com\r
Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=\r
Date: ${new Date().toUTCString()}\r
MIME-Version: 1.0\r
Content-Type: multipart/alternative;\r
 boundary="${boundary}"\r
X-Mailer: PORR Newsletter Generator v3.0\r
\r
--${boundary}\r
Content-Type: text/plain; charset="utf-8"\r
Content-Transfer-Encoding: quoted-printable\r
\r
${subject}\r
\r
--${boundary}\r
Content-Type: text/html; charset="utf-8"\r
Content-Transfer-Encoding: quoted-printable\r
\r
${html}\r
\r
--${boundary}--`;
}

export function generateMSG(html: string, subject: string): string {
  // MSG format approximation - creates an EML that Outlook can handle
  const boundary = '----=_Part_MSG_' + Date.now();
  return `From: newsletter@porr.pl\r
To: \r
Subject: ${subject}\r
Date: ${new Date().toUTCString()}\r
MIME-Version: 1.0\r
Content-Type: multipart/mixed;\r
 boundary="${boundary}"\r
X-Unsent: 1\r
X-Mailer: PORR Newsletter Generator v3.0\r
\r
--${boundary}\r
Content-Type: text/html; charset="utf-8"\r
Content-Transfer-Encoding: 7bit\r
\r
${html}\r
\r
--${boundary}--`;
}

export function generateMHT(html: string, subject: string): string {
  return `From: <PORR Newsletter Generator>\r
Subject: ${subject}\r
Date: ${new Date().toUTCString()}\r
MIME-Version: 1.0\r
Content-Type: text/html; charset="utf-8"\r
\r
${html}`;
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob(['\uFEFF' + content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Outlook compatibility check
export interface CompatIssue {
  severity: 'ok' | 'warning' | 'error';
  message: string;
}

export function checkOutlookCompat(s: NewsletterState): CompatIssue[] {
  const issues: CompatIssue[] = [];

  // Check image URLs
  const images = [s.logoUrl, s.mainImage, s.videoThumbnail, ...s.articles.map(a => a.image)];
  images.forEach(img => {
    if (img && img.startsWith('data:')) {
      issues.push({ severity: 'warning', message: 'Base64 obrazki mogą nie działać w Outlooku. Użyj URL.' });
    }
  });

  if (!s.logoUrl) {
    issues.push({ severity: 'error', message: 'Brak URL logo.' });
  }

  if (!s.mainImage) {
    issues.push({ severity: 'error', message: 'Brak obrazka artykułu głównego.' });
  }

  s.articles.forEach((a, i) => {
    if (!a.image) issues.push({ severity: 'warning', message: `Artykuł ${i+1}: brak obrazka.` });
    if (!a.link || a.link === '#') issues.push({ severity: 'warning', message: `Artykuł ${i+1}: brak linku.` });
  });

  if (s.showFeedback) {
    s.feedbackOptions.forEach((o, i) => {
      if (!o.link || o.link === '#') issues.push({ severity: 'warning', message: `Feedback opcja ${i+1}: brak linku.` });
    });
  }

  if (issues.length === 0) {
    issues.push({ severity: 'ok', message: 'Wszystko wygląda OK! Gotowe do wysyłki.' });
  }

  return issues;
}
