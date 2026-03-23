import type { NewsletterState } from '@/types';

function toCRLF(value: string): string {
  return value.replace(/\r?\n/g, '\r\n');
}

function encodeHeaderUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return `=?UTF-8?B?${btoa(binary)}?=`;
}

function foldHeader(name: string, value: string, max = 76): string {
  const prefix = `${name}: `;

  if ((prefix + value).length <= max) {
    return prefix + value;
  }

  const chunks: string[] = [];
  let rest = value;
  let first = true;

  while (rest.length > 0) {
    const limit = first ? max - prefix.length : max - 1;
    chunks.push(rest.slice(0, limit));
    rest = rest.slice(limit);
    first = false;
  }

  return chunks
    .map((chunk, index) => (index === 0 ? `${prefix}${chunk}` : ` ${chunk}`))
    .join('\r\n');
}

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  const base64 = btoa(binary);

  return base64.replace(/.{1,76}/g, '$&\r\n').trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function sanitizeEmail(email: string): string {
  return email.replace(/[\r\n]/g, '').trim();
}

function buildMessageId(fromEmail: string): string {
  const domain = sanitizeEmail(fromEmail).split('@')[1] || 'localhost';
  const random = Math.random().toString(36).slice(2, 12);

  return `<${Date.now()}.${random}@${domain}>`;
}

export function generateEml(html: string, state: NewsletterState): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const fromEmail = sanitizeEmail(state.contactEmail || 'newsletter@example.com');
  const subjectRaw = state.issueNumber?.trim() || 'Newsletter';
  const subject = encodeHeaderUtf8(subjectRaw);
  const text = stripHtml(html);
  const htmlPart = encodeBase64Utf8(toCRLF(html));
  const textPart = encodeBase64Utf8(toCRLF(text));

  const headers = [
    foldHeader('From', `<${fromEmail}>`),
    foldHeader('To', 'recipient@example.com'),
    foldHeader('Subject', subject),
    foldHeader('Date', new Date().toUTCString()),
    foldHeader('Message-ID', buildMessageId(fromEmail)),
    foldHeader('MIME-Version', '1.0'),
    foldHeader('X-Unsent', '1'),
    foldHeader('X-Mailer', 'PORR Newsletter Generator'),
    foldHeader('Content-Language', 'pl-PL'),
    foldHeader('Content-Type', `multipart/alternative; boundary="${boundary}"`),
  ].join('\r\n');

  return [
    headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    textPart,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    htmlPart,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}
