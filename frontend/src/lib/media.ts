const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Turn API-relative upload paths into full URLs the browser can load. */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${API_BASE}${url}`;
  }
  return `${API_BASE}/${url}`;
}
