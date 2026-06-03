export function panoramaImageUrl(src?: string | null): string | null {
  const base = import.meta.env.VITE_CLOUDFRONT_URL;
  if (!src?.trim() || !base) return null;
  return `${base}/${src.replace(/^\//, "")}`;
}
