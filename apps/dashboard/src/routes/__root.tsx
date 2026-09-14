import {
  createRootRoute,
  Link,
  Outlet,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import appCss from "~/styles/app.css?url";
import {
  ShieldAlert,
  Eye,
  EyeOff,
  HeartHandshake,
  Activity,
  Compass,
  FileCheck2,
  Download,
  Flame,
  PhoneCall,
  User,
  LogIn,
  LogOut,
} from "lucide-react";
import { useSession, signOut } from "~/lib/authClient";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KindMinds — Real-Time Trauma Triage & Distress Prediction" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const [privacyShield, setPrivacyShield] = useState(false);
  const [showHelplinesModal, setShowHelplinesModal] = useState(false);
  const { data: sessionData } = useSession();

  // Double-ESC Quick Exit Listener
  useEffect(() => {
    let lastEsc = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const now = Date.now();
        if (now - lastEsc < 600) {
          try {
            sessionStorage.clear();
            localStorage.clear();
          } catch (err) {}
          window.location.replace("https://www.google.com/search?q=weather+today");
        }
        lastEsc = now;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerEscape = () => {
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (err) {}
    window.location.replace("https://www.google.com/search?q=weather+today");
  };

  return (
    <html lang="en" className={privacyShield ? "privacy-shield-active" : ""}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-[#100e0c] text-[#faf9f5] flex flex-col font-sans selection:bg-[#f48d16]/30 selection:text-[#f48d16]">
        {/* Stealth Quick Exit Bar */}
        <div className="sticky top-0 z-50 w-full bg-[#160f10]/95 border-b border-[#fb3858]/25 backdrop-blur-xl px-4 py-2 text-xs flex items-center justify-between transition-all">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#fb3858]">
              <span className="w-2 h-2 rounded-full bg-[#fb3858] animate-ping"></span>
              <span className="font-bold text-[#faf9f5]">Stealth Safety Shield:</span>
              <span className="hidden sm:inline text-stone-400 font-normal">Double-tap ESC or click exit to instantly scrub browser state and redirect.</span>
            </div>
            <button
              type="button"
              onClick={triggerEscape}
              className="cursor-pointer font-bold px-3 py-1 bg-[#fb3858] hover:bg-[#ff4d6a] text-white rounded-full text-xs shadow-md shadow-[#fb3858]/20 transition-all flex items-center gap-1.5 focus:outline-none hover:scale-105"
            >
              <span>Quick Exit (ESC)</span>
            </button>
          </div>
        </div>

        {/* Parley Floating Pill Top Navigation */}
        <header className="sticky top-12 z-40 w-full px-4 sm:px-6 pointer-events-none mt-2">
          <div className="max-w-6xl mx-auto pointer-events-auto">
            <div className="bg-[#181512]/90 border border-[#302a24] backdrop-blur-xl rounded-full px-4 sm:px-6 py-2.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f48d16] to-[#d97706] flex items-center justify-center text-stone-950 font-bold shadow-md shadow-[#f48d16]/20 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-4 h-4 text-stone-950 font-black" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-[#faf9f5]">KindMinds</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f48d16]/10 text-[#f48d16] border border-[#f48d16]/25 font-semibold">Triage Station</span>
                </div>
              </Link>

              <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#a89f91]">
                <Link
                  to="/"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/triage"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Live Triage</span>
                </Link>
                <Link
                  to="/grounding"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Grounding Room</span>
                </Link>
                <Link
                  to="/safety-plan"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Safety Plan</span>
                </Link>
                <Link
                  to="/assessments"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Screeners</span>
                </Link>
                <Link
                  to="/export"
                  activeProps={{ className: "bg-[#241f1a] text-[#f48d16] border-[#383028]" }}
                  className="px-3 py-1.5 rounded-full hover:text-[#faf9f5] transition-colors border border-transparent flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Case Export</span>
                </Link>
              </nav>

              <div className="flex items-center gap-2.5">
                {/* Privacy Blur Toggle */}
                <button
                  type="button"
                  onClick={() => setPrivacyShield((prev) => !prev)}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    privacyShield
                      ? "bg-[#f48d16]/20 text-[#f48d16] border-[#f48d16]/50 shadow-sm"
                      : "bg-[#201c18] text-[#a89f91] border-[#302a24] hover:text-[#faf9f5] hover:border-[#483f36]"
                  }`}
                  title="Blur sensitive clinical text to prevent shoulder-surfing"
                >
                  {privacyShield ? <EyeOff className="w-3.5 h-3.5 text-[#f48d16]" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{privacyShield ? "Privacy ON" : "Blur Text"}</span>
                </button>

                {/* Crisis Helpline Button */}
                <button
                  type="button"
                  onClick={() => setShowHelplinesModal(true)}
                  className="cursor-pointer px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#fb3858]/15 text-[#fb3858] border border-[#fb3858]/30 hover:bg-[#fb3858]/25 transition-all flex items-center gap-1.5"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#fb3858]" />
                  <span>Lifelines</span>
                </button>

                {/* BetterAuth User / Session State */}
                {sessionData?.user ? (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[#10b981] text-xs font-semibold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span className="max-w-[110px] truncate">
                        {sessionData.user.isAnonymous
                          ? "Anonymous"
                          : sessionData.user.name || sessionData.user.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => signOut()}
                      title="Sign Out"
                      className="cursor-pointer p-1.5 rounded-full bg-[#201c18] text-[#756d62] hover:text-[#fb3858] hover:bg-[#fb3858]/10 transition-colors border border-[#302a24]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="cursor-pointer px-4 py-1.5 rounded-full text-xs font-bold bg-[#f48d16] hover:bg-[#ff9c2b] text-stone-950 shadow-md shadow-[#f48d16]/20 transition-all hover:scale-105 flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Safe Access</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        {/* Parley Helplines Modal */}
        {showHelplinesModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="parley-bento-card rounded-[2rem] p-7 max-w-lg w-full shadow-2xl space-y-5 border border-[#383028]">
              <div className="flex items-center justify-between border-b border-[#302a24] pb-4">
                <div className="font-bold text-base text-[#faf9f5] flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-[#fb3858]" />
                  <span>Immediate Crisis Support Lifelines</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelplinesModal(false)}
                  className="text-[#756d62] hover:text-[#faf9f5] text-xs px-2.5 py-1 rounded-full bg-[#201c18] border border-[#302a24] cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#a89f91]">
                <div className="p-4 rounded-2xl bg-[#14110e] border border-[#2b251f] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#faf9f5] text-sm">988 Suicide & Crisis Lifeline</div>
                    <div className="text-[#756d62] text-[11px] mt-0.5">Free, confidential 24/7 (USA & Canada)</div>
                  </div>
                  <a href="tel:988" className="px-4 py-2 bg-[#fb3858] hover:bg-[#ff4d6a] font-bold rounded-full text-white shadow-sm">Call 988</a>
                </div>

                <div className="p-4 rounded-2xl bg-[#14110e] border border-[#2b251f] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#faf9f5] text-sm">Freedom from Torture (UK)</div>
                    <div className="text-[#756d62] text-[11px] mt-0.5">Medical, forensic, and psychological care</div>
                  </div>
                  <a href="tel:+442076977777" className="px-4 py-2 bg-[#f48d16] hover:bg-[#ff9c2b] font-bold rounded-full text-stone-950 shadow-sm">Call UK</a>
                </div>

                <div className="p-4 rounded-2xl bg-[#14110e] border border-[#2b251f] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#faf9f5] text-sm">Befrienders Worldwide</div>
                    <div className="text-[#756d62] text-[11px] mt-0.5">Confidential emotional support globally</div>
                  </div>
                  <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#201c18] hover:bg-[#28231e] rounded-full text-[#faf9f5] font-semibold border border-[#302a24]">Visit ↗</a>
                </div>
              </div>
            </div>
          </div>
        )}

        <Scripts />
      </body>
    </html>
  );
}
