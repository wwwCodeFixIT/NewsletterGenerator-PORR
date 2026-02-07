import type { NewsletterState } from '@/types';

function esc(t: string): string {
  if (!t) return '';
  return t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function vmlButton(href: string, text: string, bgColor: string, textColor: string, fontFamily: string, width: number = 150, height: number = 40): string {
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="13%" strokecolor="${bgColor}" fillcolor="${bgColor}">
  <w:anchorlock/>
  <center style="color:${textColor};font-family:${fontFamily};font-size:14px;font-weight:bold;">
    ${esc(text)}
  </center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-->
<a href="${esc(href)}" style="display:inline-block;padding-top:12px;padding-bottom:12px;padding-left:25px;padding-right:25px;background-color:${bgColor};color:${textColor};font-family:${fontFamily};font-size:14px;font-weight:bold;text-decoration:none;border-radius:5px;mso-hide:all;">
  ${esc(text)}
</a>
<!--<![endif]-->`;
}

export function generateEmailHTML(s: NewsletterState): string {
  const ff = s.fontFamily;
  const pc = s.primaryColor;
  const ac = s.accentColor;
  const btc = s.buttonTextColor;
  const tc = s.textColor;
  const bg = s.bgColor;
  const fbg = s.feedbackBgColor;

  // Preheader - hidden text that shows in inbox
  const preheaderHTML = s.preheader
    ? `<div style="display:none;font-size:1px;color:${bg};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">${esc(s.preheader)}${'&zwnj;&nbsp;'.repeat(20)}</div>`
    : '';

  // View online link
  const viewOnlineHTML = s.showViewOnline
    ? `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;">
        <tr>
          <td align="center" style="padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px;">
            <a href="#" style="font-family:${ff};font-size:12px;color:#999999;text-decoration:underline;">Wyświetl online</a>
          </td>
        </tr>
      </table>`
    : '';

  // Header with logo
  const headerHTML = `
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding-top:20px;padding-bottom:0px;padding-left:20px;padding-right:20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${pc}" style="background-color:${pc};">
        <tr>
          <td style="padding-top:22px;padding-bottom:22px;padding-left:25px;padding-right:25px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align:middle;font-family:${ff};font-size:22px;color:${ac};font-weight:bold;line-height:28px;">
                  ${esc(s.issueNumber)}
                </td>
                <td width="100" align="right" style="vertical-align:middle;">
                  <img src="${esc(s.logoUrl)}" width="80" height="auto" border="0" alt="PORR" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  // Main article with hero image
  const mainArticleHTML = `
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding-top:5px;padding-bottom:0px;padding-left:20px;padding-right:20px;">
      <img src="${esc(s.mainImage)}" width="560" height="auto" border="0" alt="${esc(s.mainTitle)}" style="display:block;border:0;outline:none;text-decoration:none;width:560px;max-width:100%;height:auto;-ms-interpolation-mode:bicubic;">
    </td>
  </tr>
  <tr>
    <td style="padding-top:25px;padding-bottom:10px;padding-left:20px;padding-right:20px;">
      <h2 style="margin:0;padding:0;padding-bottom:15px;font-family:${ff};font-size:20px;font-weight:bold;color:${tc};line-height:26px;">
        ${esc(s.mainTitle)}
      </h2>
      <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:${tc};line-height:22px;">
        ${esc(s.mainDescription)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-top:10px;padding-bottom:25px;padding-left:20px;padding-right:20px;">
      ${vmlButton(s.mainLink, 'Czytaj więcej', ac, btc, ff)}
    </td>
  </tr>
</table>`;

  // Articles - each as a two-column table row
  const articlesHTML = s.articles.map(a => `
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px;">
      <!-- Separator line -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="border-top:1px solid #e8e8e8;font-size:1px;line-height:1px;" height="1">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px;">
      <!--[if mso]>
      <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="270" valign="top">
      <![endif]-->
      <table border="0" cellpadding="0" cellspacing="0" width="270" align="left" class="stack-col" style="display:inline-block;vertical-align:top;">
        <tr>
          <td style="padding-right:10px;">
            <a href="${esc(a.link)}">
              <img src="${esc(a.image)}" width="270" height="auto" border="0" alt="${esc(a.title)}" style="display:block;border:0;outline:none;width:270px;max-width:100%;height:auto;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
        </tr>
      </table>
      <!--[if mso]>
        </td>
        <td width="20" style="font-size:1px;line-height:1px;">&nbsp;</td>
        <td width="270" valign="top">
      <![endif]-->
      <table border="0" cellpadding="0" cellspacing="0" width="270" align="right" class="stack-col" style="display:inline-block;vertical-align:top;">
        <tr>
          <td style="padding-top:5px;">
            <h3 style="margin:0;padding:0;padding-bottom:10px;font-family:${ff};font-size:18px;font-weight:bold;color:${tc};line-height:24px;">
              ${esc(a.title)}
            </h3>
            <p style="margin:0;padding:0;padding-bottom:15px;font-family:${ff};font-size:14px;color:${tc};line-height:20px;">
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

  // Video section
  const videoHTML = s.showVideo ? `
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="#ffffff">
  <tr>
    <td style="padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="border-top:2px solid ${ac};font-size:1px;line-height:1px;" height="1">&nbsp;</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:15px;padding-bottom:10px;padding-left:20px;padding-right:20px;">
      <a href="${esc(s.videoLink)}">
        <img src="${esc(s.videoThumbnail)}" width="560" height="auto" border="0" alt="${esc(s.videoTitle)}" style="display:block;border:0;outline:none;width:560px;max-width:100%;height:auto;-ms-interpolation-mode:bicubic;">
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding-top:15px;padding-bottom:30px;padding-left:20px;padding-right:20px;">
      <h3 style="margin:0;padding:0;padding-bottom:10px;font-family:${ff};font-size:18px;font-weight:bold;color:${tc};line-height:24px;">
        🎬 ${esc(s.videoTitle)}
      </h3>
      <p style="margin:0;padding:0;padding-bottom:15px;font-family:${ff};font-size:14px;color:${tc};line-height:20px;">
        ${esc(s.videoDescription)}
      </p>
      ${vmlButton(s.videoReadMore, 'Czytaj więcej', ac, btc, ff)}
    </td>
  </tr>
</table>` : '';

  // Feedback section
  const feedbackHTML = s.showFeedback ? `
<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center">
      <table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="${fbg}">
        <tr>
          <td align="center" style="padding-top:35px;padding-bottom:10px;padding-left:20px;padding-right:20px;">
            <h2 style="margin:0;padding:0;font-family:${ff};font-size:22px;font-weight:bold;color:${pc};line-height:28px;">
              ${esc(s.feedbackTitle)}
            </h2>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:5px;padding-bottom:25px;padding-left:20px;padding-right:20px;">
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:${tc};line-height:20px;">
              ${esc(s.feedbackSubtitle)}
            </p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:0px;padding-bottom:25px;padding-left:10px;padding-right:10px;">
            <table border="0" cellpadding="0" cellspacing="0">
              <tr>
                ${s.feedbackOptions.map(o => `
                <td align="center" style="padding-top:10px;padding-bottom:10px;padding-left:12px;padding-right:12px;">
                  <a href="${esc(o.link)}" style="text-decoration:none;">
                    <table border="0" cellpadding="0" cellspacing="0">
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
          <td align="center" style="padding-top:5px;padding-bottom:20px;padding-left:20px;padding-right:20px;">
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

  // Footer
  const footerHTML = `
<table border="0" cellpadding="0" cellspacing="0" width="600" align="center" style="width:600px;max-width:600px;" class="responsive" bgcolor="${pc}">
  <tr>
    <td style="padding-top:25px;padding-bottom:5px;padding-left:25px;padding-right:25px;" bgcolor="${pc}">
      <h3 style="margin:0;padding:0;font-family:${ff};font-size:18px;font-weight:bold;color:#ffffff;line-height:24px;">
        ${esc(s.footerTitle)}
      </h3>
    </td>
  </tr>
  <tr>
    <td style="padding-top:15px;padding-bottom:15px;padding-left:25px;padding-right:25px;" bgcolor="${pc}">
      <!--[if mso]>
      <table border="0" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td width="255" valign="top">
      <![endif]-->
      <table border="0" cellpadding="0" cellspacing="0" width="255" align="left" class="stack-col" style="display:inline-block;vertical-align:top;">
        <tr>
          <td>
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff;line-height:22px;">
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
      <table border="0" cellpadding="0" cellspacing="0" width="255" align="right" class="stack-col" style="display:inline-block;vertical-align:top;">
        <tr>
          <td>
            <p style="margin:0;padding:0;font-family:${ff};font-size:14px;color:#ffffff;line-height:22px;">
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
    <td align="center" style="padding-top:20px;padding-bottom:30px;padding-left:25px;padding-right:25px;" bgcolor="${pc}">
      ${vmlButton('mailto:' + s.contactEmail, 'Napisz do nas ✉️', ac, btc, ff, 200, 44)}
    </td>
  </tr>
</table>`;

  // Social media icons
  const socialHTML = s.showSocial ? `
<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding-top:25px;padding-bottom:25px;">
      <table border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-left:15px;padding-right:15px;">
            <a href="${esc(s.facebookUrl)}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/facebook-logo-colored.png" alt="Facebook" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
          <td style="padding-left:15px;padding-right:15px;">
            <a href="${esc(s.linkedinUrl)}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/linkedin-logo-colored.png" alt="LinkedIn" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
          <td style="padding-left:15px;padding-right:15px;">
            <a href="${esc(s.youtubeUrl)}">
              <img width="40" height="40" border="0" src="https://eyifvsv.stripocdn.email/content/assets/img/social-icons/logo-colored/youtube-logo-colored.png" alt="YouTube" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;">
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>` : '';

  // Unsubscribe
  const unsubHTML = `
<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding-top:15px;padding-bottom:25px;padding-left:20px;padding-right:20px;">
      <p style="margin:0;padding:0;font-size:11px;color:#bbbbbb;font-family:${ff};line-height:16px;">
        No longer want these emails? <a href="#" style="color:#bbbbbb;text-decoration:underline;">Unsubscribe</a>
        <br>© ${new Date().getFullYear()} PORR S.A. Wszelkie prawa zastrzeżone.
      </p>
    </td>
  </tr>
</table>`;

  // Full document
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
/* Reset */
body, #bodyTable { margin:0 !important; padding:0 !important; width:100% !important; height:100% !important; }
body { background-color:${bg}; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
a { text-decoration:none; }
/* Responsive */
@media only screen and (max-width:620px) {
  table.responsive { width:100% !important; max-width:100% !important; }
  table.stack-col { display:block !important; width:100% !important; max-width:100% !important; }
  td.hide-mobile { display:none !important; width:0 !important; height:0 !important; overflow:hidden !important; }
  img { max-width:100% !important; height:auto !important; }
  td { padding-left:15px !important; padding-right:15px !important; }
}
/* Dark mode support */
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
<table border="0" cellpadding="0" cellspacing="0" width="100%" id="bodyTable" bgcolor="${bg}" style="background-color:${bg};">
  <tr>
    <td align="center" style="padding-top:0;padding-bottom:0;">
      ${viewOnlineHTML}
      ${headerHTML}
      ${mainArticleHTML}
      ${articlesHTML}
      ${videoHTML}
    </td>
  </tr>
</table>
${feedbackHTML}
<table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${bg}" style="background-color:${bg};">
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
