import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, signIn, signUp } from "~/lib/authClient";
import {
  Shield,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  HeartHandshake,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"anonymous" | "credentials">("anonymous");
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await signIn.anonymous();
      if (res.error) {
        setErrorMessage(res.error.message || "Failed to establish anonymous session");
      } else {
        navigate({ to: "/triage" });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isRegistering) {
        const res = await signUp.email({
          email,
          password,
          name: name.trim() || "Survivor Advocate",
        });
        if (res.error) {
          setErrorMessage(res.error.message || "Registration failed");
        } else {
          navigate({ to: "/triage" });
        }
      } else {
        const res = await signIn.email({
          email,
          password,
        });
        if (res.error) {
          setErrorMessage(res.error.message || "Sign in failed");
        } else {
          navigate({ to: "/triage" });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] mb-4 shadow-[0_0_20px_rgba(244,141,22,0.15)]">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#faf9f5] tracking-tight">
          Trauma-Informed Safe Access
        </h1>
        <p className="text-sm text-[#a89f91] mt-2 max-w-md mx-auto leading-relaxed">
          KindMinds AI is designed with non-retraumatizing safety principles. You never have to disclose your real identity to receive emergency triage and support.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[#181512] border border-[#302a24] rounded-full p-1.5 flex gap-1 mb-8 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setTab("anonymous");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-full font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tab === "anonymous"
              ? "bg-[#26211c] text-[#faf9f5] border border-[#483f36] shadow-md"
              : "text-[#a89f91] hover:text-[#faf9f5] hover:bg-[#201c18]/50"
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#f48d16]" />
          Pseudonymous Access
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("credentials");
            setErrorMessage(null);
          }}
          className={`flex-1 py-2.5 px-4 rounded-full font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            tab === "credentials"
              ? "bg-[#26211c] text-[#faf9f5] border border-[#483f36] shadow-md"
              : "text-[#a89f91] hover:text-[#faf9f5] hover:bg-[#201c18]/50"
          }`}
        >
          <Lock className="w-4 h-4 text-[#a89f91]" />
          Email & Password
        </button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-[#fb3858]/10 border border-[#fb3858]/30 text-[#fca5a5] text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#fb3858] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Authentication Notice</p>
            <p className="text-xs text-[#fca5a5]/90 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tab 1: Anonymous Access */}
      {tab === "anonymous" && (
        <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#f48d16]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f48d16]/10 border border-[#f48d16]/25 text-[#f48d16] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Recommended for Survivors
            </div>
            <h2 className="text-xl font-bold text-[#faf9f5] tracking-tight">
              One-Click Anonymous Session
            </h2>
            <p className="text-sm text-[#a89f91] leading-relaxed max-w-md mx-auto">
              Enter immediately with an isolated, encrypted guest token. No emails, phone numbers, or passwords are kept. If you choose to save your safety plan permanently later, you can link an email account at any time.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <button
              type="button"
              disabled={loading}
              onClick={handleAnonymousSignIn}
              className="w-full py-4 px-6 rounded-full bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] font-bold text-sm tracking-tight shadow-[0_0_30px_rgba(244,141,22,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#100e0c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Anonymously Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-[#302a24] text-xs text-[#756d62] flex items-center justify-center gap-2 relative z-10">
            <Shield className="w-3.5 h-3.5 text-[#f48d16]" />
            <span>Double-tap ESC at any time to instantly scrub all local session telemetry.</span>
          </div>
        </div>
      )}

      {/* Tab 2: Credentials (Email & Password) */}
      {tab === "credentials" && (
        <div className="parley-bento-card rounded-3xl bg-[#181512] border border-[#302a24] p-6 sm:p-10 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#302a24] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#faf9f5] tracking-tight">
                {isRegistering ? "Create Clinician / Care Account" : "Sign In to Existing Account"}
              </h2>
              <p className="text-xs text-[#a89f91] mt-0.5">
                {isRegistering
                  ? "Save and sync safety plans and clinical assessments across devices."
                  : "Welcome back. Enter your credentials below."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
              className="text-xs text-[#f48d16] hover:text-[#e07d0f] font-medium underline cursor-pointer"
            >
              {isRegistering ? "Have an account? Sign in" : "Need an account? Register"}
            </button>
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-medium text-[#a89f91] mb-1.5">
                  Display Pseudonym or Clinician Name
                </label>
                <div className="relative">
                  <HeartHandshake className="w-4 h-4 text-[#756d62] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Oak or Dr. Aris"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-[#faf9f5] placeholder-[#756d62] text-sm focus:outline-none focus:border-[#f48d16]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#a89f91] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#756d62] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-[#faf9f5] placeholder-[#756d62] text-sm focus:outline-none focus:border-[#f48d16]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a89f91] mb-1.5">
                Password (min 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#756d62] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#100e0c] border border-[#302a24] text-[#faf9f5] placeholder-[#756d62] text-sm focus:outline-none focus:border-[#f48d16]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756d62] hover:text-[#faf9f5]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full bg-[#f48d16] hover:bg-[#e07d0f] text-[#100e0c] font-bold text-sm shadow-[0_0_30px_rgba(244,141,22,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#100e0c] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isRegistering ? "Create Secure Account" : "Sign In"}</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
