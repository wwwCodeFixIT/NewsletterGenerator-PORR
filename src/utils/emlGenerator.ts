import type { NewsletterState } from '@/types';

export type ExternalImageMode = 'keep' | 'remove';

interface GenerateEmlOptions {
  draftMode?: boolean;
  /**
   * keep   - zostawia zewnętrzne obrazy po https/http, więc Outlook może pokazać pasek pobierania obrazów.
   * remove - usuwa/zastępuje zewnętrzne obrazy placeholderem; lokalne data:image nadal są osadzane jako CID.
   */
  externalImageMode?: ExternalImageMode;
}

interface InlineImagePart {
  cid: string;
  mimeType: string;
  base64: string;
  filename: string;
}

function toCRLF(value: string): string {
  return value.replace(/\r?\n/g, '\r\n');
}

function sanitizeEmail(email: string): string {
  return email.replace(/[\r\n]/g, '').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ');
}

function encodeHeaderUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function wrapBase64(base64: string): string {
  return base64.replace(/.{1,76}/g, '$&\r\n').trim();
}

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(toCRLF(value));
  let binary = '';

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return wrapBase64(btoa(binary));
}

function buildMessageId(fromEmail: string): string {
  const domain = sanitizeEmail(fromEmail).split('@')[1] || 'localhost';
  const random = Math.random().toString(36).slice(2, 12);

  return `<${Date.now()}.${random}@${domain}>`;
}

function sanitizeFilename(value: string): string {
  const normalized = value
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || 'image';
}

function extractInlineImages(html: string, messageId: string): { html: string; attachments: InlineImagePart[] } {
  const attachments: InlineImagePart[] = [];
  let index = 0;

  const updatedHtml = html.replace(
    /src=(['"])(data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\r\n]+))\1/gi,
    (_match, quote: string, _dataUrl: string, mimeType: string, base64Payload: string) => {
      index += 1;
      const cleanBase64 = base64Payload.replace(/\s+/g, '');
      const extension = mimeType.split('/')[1]?.replace(/[^a-z0-9]+/gi, '') || 'img';
      const cid = `inline-image-${index}-${Date.now()}@${messageId.replace(/[<>]/g, '')}`;

      attachments.push({
        cid,
        mimeType,
        base64: wrapBase64(cleanBase64),
        filename: `${sanitizeFilename(`image-${index}`)}.${extension}`,
      });

      return `src=${quote}cid:${cid}${quote}`;
    }
  );

  return { html: updatedHtml, attachments };
}

function getAltFromImgTag(imgTag: string): string {
  const altMatch = imgTag.match(/\balt=(['"])(.*?)\1/i);
  const alt = altMatch?.[2] ? decodeHtmlEntities(altMatch[2]) : 'Obraz';
  return alt.trim() || 'Obraz';
}

function isTinyTrackingPixel(imgTag: string): boolean {
  return /\b(width|height)=(['"]?)1\2/i.test(imgTag) || /width:\s*1px/i.test(imgTag) || /height:\s*1px/i.test(imgTag);
}

function replaceExternalImages(html: string, mode: ExternalImageMode): string {
  if (mode === 'keep') return html;

  return html.replace(/<img\b[^>]*\bsrc=(['"])(https?:\/\/[^'"]+)\1[^>]*>/gi, (imgTag: string, _quote: string, src: string) => {
    if (isTinyTrackingPixel(imgTag)) return '';

    const isSocialIcon = /social-icons|facebook|linkedin|youtube/i.test(src);
    if (isSocialIcon) return '';

    const alt = getAltFromImgTag(imgTag);

    return `<span style="display:block;background-color:#f4f6f8;border:1px solid #d9e0e8;color:#4b5563;font-family:Arial,sans-serif;font-size:12px;line-height:18px;text-align:center;padding:16px 12px;">${escapeHtml(alt)}<br /><span style="font-size:10px;color:#8a94a6;">Obraz zewnętrzny pominięty w trybie Outlook Safe</span></span>`;
  });
}

export function hasExternalImages(html: string): boolean {
  return /<img\b[^>]*\bsrc=(['"])(https?:\/\/[^'"]+)\1/i.test(html);
}

export function generateEml(
  html: string,
  state: NewsletterState,
  options: GenerateEmlOptions = {}
): string {
  const { draftMode = false, externalImageMode = 'keep' } = options;
  const fromEmail = sanitizeEmail(state.contactEmail || 'newsletter@example.com');
  const subjectRaw = state.issueNumber?.trim() || 'Newsletter';
  const subject = encodeHeaderUtf8(subjectRaw);
  const messageId = buildMessageId(fromEmail);
  const relatedBoundary = `----=_Related_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const htmlAfterExternalPolicy = replaceExternalImages(html, externalImageMode);
  const { html: htmlWithCidImages, attachments } = extractInlineImages(htmlAfterExternalPolicy, messageId);
  const htmlEncoded = encodeBase64Utf8(htmlWithCidImages);

  const headers = [
    `From: <${fromEmail}>`,
    'To: recipient@example.com',
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    'MIME-Version: 1.0',
    ...(draftMode ? ['X-Unsent: 1'] : []),
    'X-Mailer: PORR Newsletter Generator',
    `Content-Type: multipart/related; boundary="${relatedBoundary}"; type="text/html"`,
  ].join('\r\n');

  const attachmentParts = attachments
    .map((attachment) =>
      [
        `--${relatedBoundary}`,
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-ID: <${attachment.cid}>`,
        `Content-Disposition: inline; filename="${attachment.filename}"`,
        '',
        attachment.base64,
        '',
      ].join('\r\n')
    )
    .join('');

  return [
    headers,
    '',
    `--${relatedBoundary}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    htmlEncoded,
    '',
    attachmentParts,
    `--${relatedBoundary}--`,
    '',
  ].join('\r\n');
}
