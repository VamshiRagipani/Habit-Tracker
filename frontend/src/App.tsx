import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabaseClient";
import Auth from "./components/Auth";
import DailyTracker from "./components/DailyTracker";

function parseAuthAction() {
  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    return searchParams.get("type") ?? hashParams.get("type");
  } catch {
    return null;
  }
}

function ResetPasswordPage({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Password updated successfully. You can now sign in with your new password.");
      await supabase.auth.signOut();
      onComplete();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="card auth-card" style={{ padding: 32, maxWidth: 420, margin: "auto" }}>
        <h1 style={{ marginBottom: 12, fontSize: 20 }}>Reset your password</h1>
        <p style={{ marginBottom: 24, color: "var(--text-dim)" }}>
          Enter a new password to finish resetting your account.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            className="input"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          {error ? <div className="error-message">{error}</div> : null}
          {info ? <div className="info-message">{info}</div> : null}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Updating…" : "Set new password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const recoveryAction = parseAuthAction() === "recovery";
    if (recoveryAction) {
      setShowRecovery(true);
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setCheckingSession(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
      </div>
    );
  }

  if (showRecovery) {
    return <ResetPasswordPage onComplete={() => setShowRecovery(false)} />;
  }

  return (
    <AnimatePresence mode="wait">
      {session ? (
        <motion.div key="tracker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <DailyTracker />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Auth />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
