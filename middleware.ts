import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const protectedPrefixes = [
  "/academic",
  "/mindfulness",
  "/tools",
  "/activities",
  "/profile",
  "/grounding",
  "/meditation",
  "/notifications",
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, searchParams } = request.nextUrl;
  const originalPath = `${pathname}${request.nextUrl.search}`;
  const isProtectedRoute = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!session) {
    if (isProtectedRoute || pathname === "/onboarding") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", originalPath);
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  await supabase.from("profiles").upsert(
    {
      id: session.user.id,
    },
    { onConflict: "id" }
  );

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("onboarding_complete")
    .eq("id", session.user.id)
    .maybeSingle();

  const onboardingComplete = !error && profile?.onboarding_complete;

  if (!onboardingComplete && pathname !== "/onboarding" && !pathname.startsWith("/auth")) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    onboardingUrl.searchParams.delete("redirect");
    return NextResponse.redirect(onboardingUrl);
  }

  if (onboardingComplete && pathname === "/onboarding") {
    const destination = new URL("/academic", request.url);
    return NextResponse.redirect(destination);
  }

  if (pathname === "/login") {
    if (!onboardingComplete) {
      const onboardingUrl = new URL("/onboarding", request.url);
      return NextResponse.redirect(onboardingUrl);
    }

    const redirectTarget = searchParams.get("redirect") || "/academic";
    const destination = new URL(redirectTarget, request.url);
    return NextResponse.redirect(destination);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/onboarding",
    "/academic/:path*",
    "/mindfulness/:path*",
    "/tools/:path*",
    "/activities/:path*",
    "/profile/:path*",
    "/grounding",
    "/meditation",
    "/notifications",
  ],
};


