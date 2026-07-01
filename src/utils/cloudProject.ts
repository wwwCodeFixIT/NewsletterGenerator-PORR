import type { NewsletterState } from '@/types';

export const CLOUD_PROJECT_SOFT_LIMIT_BYTES = 1_700_000;

export function getUtf8Size(value: string): number {
  return new Blob([value]).size;
}

export function getProjectJsonSize(state: NewsletterState): number {
  return getUtf8Size(JSON.stringify(state));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function isLocalImage(value: unknown): value is string {
  return typeof value === 'string' && /^data:image\//i.test(value);
}

export function collectLocalImagePaths(input: unknown, path = 'state'): string[] {
  if (isLocalImage(input)) return [path];
  if (!input || typeof input !== 'object') return [];

  if (Array.isArray(input)) {
    return input.flatMap((item, index) => collectLocalImagePaths(item, `${path}[${index}]`));
  }

  return Object.entries(input as Record<string, unknown>).flatMap(([key, value]) =>
    collectLocalImagePaths(value, `${path}.${key}`)
  );
}

export function stripLocalImagesForCloud<T>(input: T): T {
  if (isLocalImage(input)) return '' as T;
  if (!input || typeof input !== 'object') return input;

  if (Array.isArray(input)) {
    return input.map((item) => stripLocalImagesForCloud(item)) as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    result[key] = stripLocalImagesForCloud(value);
  }

  return result as T;
}
