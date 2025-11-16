"use client";

export function resolveBackendUrl(path: string) {
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
  const fallback = process.env.NEXT_PUBLIC_BACKEND_FALLBACK?.replace(/\/$/, "") ?? "http://localhost:8000";

  if (base && base.length > 0) {
    return `${base}${normalisedPath}`;
  }

  if (fallback && fallback.length > 0) {
    return `${fallback}${normalisedPath}`;
  }

  if (typeof window !== "undefined") {
    return normalisedPath;
  }

  return normalisedPath;
}

