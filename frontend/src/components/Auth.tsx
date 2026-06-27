import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.36 0-4.36-1.6-5.08-3.74H.92v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.92 10.68A5.4 5.4 0 0 1 3.64 9c0-.58.1-1.15.28-1.68V4.99H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.01l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0 9 9 0 0 0 .92 4.99l3 2.33C4.64 5.18 6.64 3.58 9 3.58z" />
    </svg>
  );
}

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success the browser redirects to Google, so we don't reset loading here.
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) setError(error.message);
        else setInfo("Check your email to confirm your account, then sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="auth-grid"
      >
        {/* Brand panel — desktop only */}
        <div
          className="auth-brand"
          style={{
            background:
              "radial-gradient(ellipse 140% 100% at 30% 0%, rgba(245,151,61,0.18), transparent 60%), linear-gradient(160deg, #15131a, #0b0c10)",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 36,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/favicon.ico" alt="Embers" style={{ width: 24, height: 24 }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>Embers</span>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1.25, marginBottom: 12 }}>
              Small days,<br />stacked on purpose.
            </div>
            <p style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 280 }}>
              Six habits. One streak. No phone-first mornings, no weekend-only effort —
              just a quiet log of days you showed up.
            </p>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Your data is private — only you can see it.</div>
        </div>

        {/* Form panel */}
        <div
          className="card auth-card"
          style={{ padding: "32px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <img src="/favicon.ico" alt="Embers" style={{ width: 20, height: 20 }} className="auth-brand-mobile-icon" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Embers</span>
            </div>
            <div style={{ fontSize: 14, color: "var(--text-dim)" }}>
              {mode === "signin" ? "Welcome back." : "Let's set up your tracker."}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-google"
            onClick={handleGoogle}
            disabled={googleLoading}
            aria-label="Continue with Google"
          >
            {googleLoading ? <Loader2 size={16} className="spin" /> : <GoogleIcon />}
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              or with email
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <form onSubmit={submitEmail} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 13, color: "var(--red-500)", overflow: "hidden" }}
                >
                  <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                  {error}
                </motion.div>
              )}
              {info && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 13, color: "var(--sage-500)", overflow: "hidden" }}
                >
                  <CheckCircle2 size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                  {info}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <Loader2 size={16} className="spin" /> : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setInfo("");
            }}
            style={{ marginTop: 14, fontSize: 12.5 }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
