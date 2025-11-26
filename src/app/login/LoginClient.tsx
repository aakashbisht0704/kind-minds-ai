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
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    null
  );

  const resetMessages = () => setFormMessage(null);

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

        <div className="max-w-md mx-auto">
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

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


