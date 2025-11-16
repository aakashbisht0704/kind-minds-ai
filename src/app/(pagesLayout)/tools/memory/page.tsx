"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy tools route for Memory.
 * The actual Memory Game now lives at /activities/memory.
 * This page simply redirects there.
 */
export default function ToolsMemoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/activities/memory");
  }, [router]);

  return null;
}


