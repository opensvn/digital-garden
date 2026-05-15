export function isCurrentRoutePath(routePath: string, pathname: string | null | undefined) {
  return normalizeRoutePath(routePath) === normalizeRoutePath(pathname ?? "");
}

function normalizeRoutePath(routePath: string) {
  const decodedPath = safeDecodeURIComponent(routePath);

  if (decodedPath.length > 1 && decodedPath.endsWith("/")) {
    return decodedPath.slice(0, -1);
  }

  return decodedPath;
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
