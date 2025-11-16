"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface LoginClientProps {
  redirectTo: string;
}

type AuthMode = "signin" | "signup";

export default function LoginClient({ redirectTo }: LoginClientProps) {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const resetMessages = () => setFormMessage(null);

  const handleGoogleLogin = async () => {
    if (signingIn) return;
    resetMessages();
    setSigningIn(true);
    try {
      await signInWithGoogle(redirectTo || "/onboarding");
    } finally {
      setSigningIn(false);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formSubmitting) return;

    resetMessages();

    if (!email.trim() || !password.trim()) {
      setFormMessage({ type: "error", text: "Email and password are required." });
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      setFormMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setFormSubmitting(true);
    try {
      if (authMode === "signin") {
        const { error } = await signInWithEmail(email.trim(), password.trim());
        if (error) {
          setFormMessage({ type: "error", text: error.message });
          return;
        }
        router.replace(redirectTo || "/onboarding");
      } else {
        const { error } = await signUpWithEmail(email.trim(), password.trim());
        if (error) {
          setFormMessage({ type: "error", text: error.message });
          return;
        }
        setFormMessage({
          type: "success",
          text: "Account created! Check your email for a confirmation link before signing in.",
        });
        setAuthMode("signin");
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-white to-purple-50 px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to KindMinds</h1>
          <p className="mt-2 text-gray-600">
            Sign in or create an account to continue your academic and mindfulness journey.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div className="flex rounded-full bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  resetMessages();
                }}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition",
                  authMode === "signin" ? "bg-white shadow text-purple-600" : "text-gray-500"
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  resetMessages();
                }}
                className={cn(
                  "flex-1 rounded-full py-2 text-sm font-semibold transition",
                  authMode === "signup" ? "bg-white shadow text-purple-600" : "text-gray-500"
                )}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  disabled={formSubmitting}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={formSubmitting}
                  className="h-11 rounded-xl"
                  required
                />
              </div>
              {authMode === "signup" && (
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    disabled={formSubmitting}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              )}
            </div>

            {formMessage && (
              <div
                className={cn(
                  "rounded-xl border p-4 text-sm",
                  formMessage.type === "error"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-green-200 bg-green-50 text-green-600"
                )}
              >
                {formMessage.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={formSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 py-3 text-base font-semibold text-white hover:from-purple-600 hover:to-purple-700"
            >
              {formSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {authMode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : authMode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="space-y-6 rounded-3xl border border-gray-100 bg-gradient-to-br from-purple-50 via-white to-purple-100 p-6 shadow-inner">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Prefer single-click access?</h3>
              <p className="mt-2 text-sm text-gray-600">
                Use your Google account to jump right back into KindMinds.
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading || signingIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 py-4 text-base font-semibold shadow-sm"
            >
              {signingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Continue with Google</span>
            </Button>

            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.18-.93 2.18-1.98 2.85v2.37h3.2c1.87-1.73 2.96-4.27 2.96-7.27 0-.7-.06-1.37-.18-2z"
        fill="#4285F4"
      />
      <path
        d="M12.17 21c2.7 0 4.97-.9 6.63-2.49l-3.2-2.37c-.89.6-2.03.96-3.43.96-2.64 0-4.87-1.78-5.66-4.18H3.19v2.46A8.83 8.83 0 0 0 12.17 21z"
        fill="#34A853"
      />
      <path
        d="M6.51 12.92A5.31 5.31 0 0 1 6.23 11c0-.66.12-1.3.28-1.92V6.62H3.19A8.82 8.82 0 0 0 3 11a8.82 8.82 0 0 0 .19 3.38L6.51 12.92z"
        fill="#FBBC05"
      />
      <path
        d="M12.17 5.32c1.47 0 2.78.51 3.81 1.52l2.85-2.85C17.13 2.16 14.87 1 12.17 1 7.99 1 4.43 3.45 3.19 6.62l3.32 2.46c.79-2.4 3.02-4.18 5.66-4.18z"
        fill="#EA4335"
      />
      <path d="M3 3h18v18H3z" fill="none" />
    </svg>
  );
}


