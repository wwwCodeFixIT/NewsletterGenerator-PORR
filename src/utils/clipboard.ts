function extractBodyHtml(html: string, preserveStyles = false): string {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const body = match?.[1]?.trim() || html.trim();
  const withoutScripts = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  if (preserveStyles) {
    return withoutScripts.trim();
  }

  return withoutScripts
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .trim();
}

function htmlToPlainText(html: string): string {
  return extractBodyHtml(html)
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
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

export function getComposeHtml(html: string): string {
  return extractBodyHtml(html, true);
}

export async function copyHtmlToClipboard(html: string): Promise<void> {
  const composeHtml = getComposeHtml(html);
  const text = htmlToPlainText(html);

  if ('ClipboardItem' in window && navigator.clipboard?.write) {
    const item = new ClipboardItem({
      'text/html': new Blob([composeHtml], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' }),
    });

    await navigator.clipboard.write([item]);
    return;
  }

  await navigator.clipboard.writeText(composeHtml);
}

export async function copyPlainHtmlSource(html: string): Promise<void> {
  await navigator.clipboard.writeText(html);
}
