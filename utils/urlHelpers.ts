export function lastSeparator(url: string): string {
  if (url[url.length - 1] !== "/") url += "/";
  return url;
}
