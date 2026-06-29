import type { NewsletterState } from '@/types';

interface GenerateEmlOptions {
  /**
   * true  - klasyczny Outlook otworzy plik jako wersję roboczą do edycji.
   * false - zwykły plik .eml do otwarcia / importu, lepszy dla nowego Outlooka.
   */
  draftMode?: boolean;
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

export function generateEml(
  html: string,
  state: NewsletterState,
  options: GenerateEmlOptions = {}
): string {
  const { draftMode = false } = options;
  const fromEmail = sanitizeEmail(state.contactEmail || 'newsletter@example.com');
  const subjectRaw = state.issueNumber?.trim() || 'Newsletter';
  const subject = encodeHeaderUtf8(subjectRaw);
  const messageId = buildMessageId(fromEmail);
  const relatedBoundary = `----=_Related_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Lokalnie wgrane obrazy są zapisywane w stanie jako data:image/...;
  // w .EML zamieniamy je na CID inline attachments, żeby HTML nie puchł jako data URL.
  const { html: htmlWithCidImages, attachments } = extractInlineImages(html, messageId);
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
        `Content-Location: ${attachment.filename}`,
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
