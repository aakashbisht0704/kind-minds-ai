"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

const PUBLIC_PATHS = ["/", "/login", "/privacy", "/terms"];

export function RequireAuthGate() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!user && !isPublic) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const fullPath = `${pathname}${search}`;
      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
    }
  }, [user, loading, pathname, router]);

  return null;
}


