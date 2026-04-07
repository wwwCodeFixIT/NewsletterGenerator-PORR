import type { NewsletterState } from '@/types';

interface GenerateEmlOptions {
  draftMode?: boolean;
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

function encodeBase64Utf8(value: string): string {
  const bytes = new TextEncoder().encode(toCRLF(value));
  let binary = '';

  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  const base64 = btoa(binary);

  return base64.replace(/.{1,76}/g, '$&\r\n').trim();
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
  const fromEmail = sanitizeEmail(state.contactEmail || 'newsletter@example.com');
  const subjectRaw = state.issueNumber?.trim() || 'Newsletter';
  const subject = encodeHeaderUtf8(subjectRaw);
  const htmlEncoded = encodeBase64Utf8(html);

  const headers = [
    `From: <${fromEmail}>`,
    'To: recipient@example.com',
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${buildMessageId(fromEmail)}`,
    'MIME-Version: 1.0',
    ...(draftMode ? ['X-Unsent: 1'] : []),
    'X-Mailer: PORR Newsletter Generator',
    'Content-Type: text/html; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
  ].join('\r\n');

  return [
    headers,
    '',
    htmlEncoded,
    '',
  ].join('\r\n');
}
