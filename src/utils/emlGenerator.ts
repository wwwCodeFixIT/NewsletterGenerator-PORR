import type { NewsletterState } from '@/types';

interface GenerateEmlOptions {
  draftMode?: boolean;
}

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

function encodeQuotedPrintableUtf8(input: string): string {
  const bytes = new TextEncoder().encode(toCRLF(input));
  let result = '';
  let lineLength = 0;

  const push = (chunk: string) => {
    if (lineLength + chunk.length > 73) {
      result += '=\r\n';
      lineLength = 0;
    }
    result += chunk;
    lineLength += chunk.length;
  };

  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];

    if (byte === 13) {
      result += '\r';
      lineLength = 0;
      continue;
    }

    if (byte === 10) {
      result += '\n';
      lineLength = 0;
      continue;
    }

    const isPrintable =
      (byte >= 33 && byte <= 60) ||
      (byte >= 62 && byte <= 126);

    if (isPrintable) {
      push(String.fromCharCode(byte));
      continue;
    }

    if (byte === 32 || byte === 9) {
      const next = bytes[i + 1];
      const atLineEnd = next === 13 || next === 10 || typeof next === 'undefined';

      if (atLineEnd) {
        push(`=${byte.toString(16).toUpperCase().padStart(2, '0')}`);
      } else {
        push(String.fromCharCode(byte));
      }
      continue;
    }

    push(`=${byte.toString(16).toUpperCase().padStart(2, '0')}`);
  }

  return result;
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

export function generateEml(
  html: string,
  state: NewsletterState,
  options: GenerateEmlOptions = {}
): string {
  const { draftMode = false } = options;
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const fromEmail = sanitizeEmail(state.contactEmail || 'newsletter@example.com');
  const subjectRaw = state.issueNumber?.trim() || 'Newsletter';
  const subject = encodeHeaderUtf8(subjectRaw);
  const text = stripHtml(html);

  const headers = [
    foldHeader('From', `<${fromEmail}>`),
    foldHeader('To', 'recipient@example.com'),
    foldHeader('Subject', subject),
    foldHeader('Date', new Date().toUTCString()),
    foldHeader('Message-ID', buildMessageId(fromEmail)),
    foldHeader('MIME-Version', '1.0'),
    ...(draftMode ? [foldHeader('X-Unsent', '1')] : []),
    foldHeader('X-Mailer', 'PORR Newsletter Generator'),
    foldHeader('Content-Language', 'pl-PL'),
    foldHeader('Content-Type', `multipart/alternative; boundary="${boundary}"`),
  ].join('\r\n');

  return [
    headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    encodeQuotedPrintableUtf8(text),
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    encodeQuotedPrintableUtf8(html),
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}
