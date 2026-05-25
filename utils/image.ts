// utils/image.ts
//
// The backend returns image paths relative to the public disk (e.g.
// "/storage/foods/lg_abc.jpg") on purpose, so the client can prepend the API
// host it can actually reach (APP_URL on the server is often 127.0.0.1, which
// a real device/emulator cannot load). This resolves such paths to absolute
// URLs; absolute URLs are passed through untouched.

const BASE_URL = (process.env.EXPO_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

export function resolveImageUrl(
  uri?: string | null,
): string | undefined {
  if (!uri) return undefined;
  if (/^https?:\/\//i.test(uri)) return uri; // already absolute
  if (uri.startsWith("/")) return `${BASE_URL}${uri}`; // public-relative path
  return uri;
}
